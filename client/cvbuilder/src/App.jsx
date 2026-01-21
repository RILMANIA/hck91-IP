import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadCV from "./pages/UploadCV";
import "./App.css";

/**
 * WHAT: Main App component with routing configuration
 * INPUT: None
 * OUTPUT: Renders application with routing for login, register, dashboard, and upload pages
 */

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has a token
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    setLoading(false);
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
        {/* Login Page */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Register Page */}
        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          }
        />

        {/* Dashboard Page - View all user CVs */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Upload CV Page - Upload and generate new CV */}
        <Route
          path="/upload-cv"
          element={isAuthenticated ? <UploadCV /> : <Navigate to="/login" />}
        />

        {/* View/Edit CV Page - View and edit existing CV */}
        <Route
          path="/cv/:id"
          element={isAuthenticated ? <UploadCV /> : <Navigate to="/login" />}
        />

        {/* Redirect root to dashboard if logged in, otherwise login */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />

        {/* 404 - Not Found */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
