import { configureStore } from '@reduxjs/toolkit';
import cvReducer from './cvSlice';

/**
 * WHAT: Configures Redux store as single source of truth for application state
 * INPUT: None
 * OUTPUT: Configured Redux store with CV slice
 */

export const store = configureStore({
  reducer: {
    cv: cvReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false // Disable for file objects
    })
});
