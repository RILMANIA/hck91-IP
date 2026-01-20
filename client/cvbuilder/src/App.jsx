import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./helpers/supabaseClient";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UploadCV from "./pages/UploadCV";
import "./App.css";

/**
 * WHAT: Main App component with routing configuration
 * INPUT: None
 * OUTPUT: Renders application with routing for login, dashboard, and upload pages
 */

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Page - Google Sign-In with Supabase */}
        <Route
          path="/login"
          element={!session ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Dashboard Page - View all user CVs */}
        <Route
          path="/dashboard"
          element={session ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Upload CV Page - Upload and generate new CV */}
        <Route
          path="/upload-cv"
          element={session ? <UploadCV /> : <Navigate to="/login" />}
        />

        {/* Redirect root to dashboard if logged in, otherwise login */}
        <Route
          path="/"
          element={<Navigate to={session ? "/dashboard" : "/login"} />}
        />

        {/* 404 - Not Found */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
