import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
  return (
    <BrowserRouter>
      <Routes>
        {/* Add your routes here */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-cv" element={<UploadCV />} />
        <Route path="/cv/:id" element={<UploadCV />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
