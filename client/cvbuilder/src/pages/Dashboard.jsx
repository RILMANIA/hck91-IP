import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { cvApi } from "../helpers/http-client";
import { supabase } from "../helpers/supabaseClient";
import "./Dashboard.css";

/**
 * WHAT: Dashboard page displaying user's CV history and navigation
 * INPUT: None (uses authenticated session from Supabase)
 * OUTPUT: Renders list of user's CVs with options to view, edit, or delete
 */

function Dashboard() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const { data } = await cvApi.get(`/cvs`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      await cvApi.delete(`/cvs/${cvId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

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
  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
      <div className="dashboard-container">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading your CVs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My CVs</h1>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/upload-cv")}
          >
            + Create New CV
          </button>
          <button className="btn btn-secondary" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {!loading && cvs.length === 0 && (
          <div className="empty-state">
            <h2>No CVs yet</h2>
            <p>Create your first AI-generated CV by uploading a document</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/upload-cv")}
            >
              Upload Your First CV
            </button>
          </div>
        )}

        {cvs.length > 0 && (
          <div className="cv-grid">
            {cvs.map((cv) => (
              <div key={cv.id} className="cv-card">
                <div className="cv-card-header">
                  <h3>{cv.generated_cv?.name || "Untitled CV"}</h3>
                  <span className="cv-date">{formatDate(cv.createdAt)}</span>
                </div>
                <div className="cv-card-body">
                  <p>
                    <strong>Email:</strong> {cv.generated_cv?.email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {cv.generated_cv?.phone || "N/A"}
                  </p>
                  {cv.generated_cv?.skills && (
                    <div className="skills-preview">
                      <strong>Skills:</strong>
                      <div className="skill-tags">
                        {cv.generated_cv.skills
                          .slice(0, 3)
                          .map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                        {cv.generated_cv.skills.length > 3 && (
                          <span className="skill-tag">
                            +{cv.generated_cv.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="cv-card-footer">
                  <a
                    href={cv.original_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-link"
                  >
                    View Original
                  </a>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(`/cv/${cv.id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteCV(cv.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
