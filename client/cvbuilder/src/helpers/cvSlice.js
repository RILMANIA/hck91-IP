import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cvApi } from "./http-client";

/**
 * WHAT: Async thunk to upload CV file to backend and process with AI
 * INPUT: file - File object selected by user (PDF/Word document)
 * OUTPUT: Promise resolving to { id, original_file_url, generated_cv } from backend
 */
export const uploadCVAsync = createAsyncThunk(
  "cv/uploadCV",
  async (file, { rejectWithValue }) => {
    try {
      // Get current session token from localStorage
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("User not authenticated");
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("file", file);

      // Send file to backend
      const response = await cvApi.post(`/cvs/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to upload CV",
      );
    }
  },
);

/**
 * WHAT: Async thunk to fetch all CVs for the authenticated user
 * INPUT: None (uses authenticated session)
 * OUTPUT: Promise resolving to array of CV records
 */
export const fetchUserCVsAsync = createAsyncThunk(
  "cv/fetchUserCVs",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await cvApi.get(`/cvs`);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch CVs",
      );
    }
  },
);

/**
 * CV Slice - Manages CV upload and display state
 *
 * State:
 * - uploadedFileUrl: URL of the uploaded file in Cloudinary (string | null)
 * - generatedCV: Structured CV data from Gemini AI (object | null)
 * - userCVs: Array of all user's CV records
 * - loading: Upload/fetch operation in progress (boolean)
 * - error: Error message if operation fails (string | null)
 */
const cvSlice = createSlice({
  name: "cv",
  initialState: {
    uploadedFileUrl: null,
    generatedCV: null,
    userCVs: [],
    loading: false,
    error: null,
  },
  reducers: {
    /**
     * WHAT: Sets the generated CV data in state
     * INPUT: action.payload - CV object from backend
     * OUTPUT: Updates generatedCV and uploadedFileUrl in state
     */
    setGeneratedCV: (state, action) => {
      state.generatedCV = action.payload.generated_cv;
      state.uploadedFileUrl = action.payload.original_file_url;
    },

    /**
     * WHAT: Clears CV data from state
     * INPUT: None
     * OUTPUT: Resets CV-related state to initial values
     */
    clearCV: (state) => {
      state.uploadedFileUrl = null;
      state.generatedCV = null;
      state.error = null;
    },

    /**
     * WHAT: Clears error message from state
     * INPUT: None
     * OUTPUT: Sets error to null
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Upload CV reducers
    builder
      .addCase(uploadCVAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadCVAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedCV = action.payload.generated_cv;
        state.uploadedFileUrl = action.payload.original_file_url;
        state.error = null;
      })
      .addCase(uploadCVAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch user CVs reducers
    builder
      .addCase(fetchUserCVsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCVsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.userCVs = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCVsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setGeneratedCV, clearCV, clearError } = cvSlice.actions;
export default cvSlice.reducer;
