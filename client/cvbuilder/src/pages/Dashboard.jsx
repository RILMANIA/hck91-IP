import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { cvApi } from "../helpers/http-client";
import CVCard from "../components/CVCard";

/**
 * WHAT: Dashboard page displaying user's CV history and navigation
 * INPUT: None (uses authenticated session)
 * OUTPUT: Renders list of user's CVs with options to view, edit, or delete
 */

export default function Dashboard() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      const { data } = await cvApi.get(`/cvs`);

      console.log(data, "<<< data fetchCVs Dashboard");
      setCvs(data);
    } catch (error) {
      console.log(error.response, "<<< fetchCVs Dashboard");

      if (error.response) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "There was an error fetching your CVs",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCV = async (cvId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) {
        return;
      }

      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      await cvApi.delete(`/cvs/${cvId}`);

      Swal.fire("Deleted!", "Your CV has been deleted.", "success");
      await fetchCVs();
    } catch (error) {
      console.log(error.response, "<<< deleteCV Dashboard");

      if (error.response) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response.data.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "There was an error deleting the CV",
        });
      }
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  /**
   * WHAT: Signs out user and redirects to login
   * INPUT: None (button click)
   * OUTPUT: Clears session and navigates to login page
   */
  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  /**
   * WHAT: Formats date string to readable format
   * INPUT: dateString - ISO date string
   * OUTPUT: Formatted date string (e.g., "Jan 20, 2026")
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div
              className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3 text-gray-600">Loading your CVs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-800">My CVs</h1>
        <div className="flex gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={() => navigate("/upload-cv")}
          >
            + Create New CV
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="">
        {!loading && cvs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No CVs yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first AI-generated CV by uploading a document
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={() => navigate("/upload-cv")}
            >
              Upload Your First CV
            </button>
          </div>
        )}

        {cvs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                handleDeleteCV={handleDeleteCV}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
