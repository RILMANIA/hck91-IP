import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserCVsAsync } from "../helpers/cvSlice";
import { supabase } from "../helpers/supabaseClient";
import "./Dashboard.css";

/**
 * WHAT: Dashboard page displaying user's CV history and navigation
 * INPUT: None (uses authenticated session from Redux)
 * OUTPUT: Renders list of user's CVs with options to view or create new
 */

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userCVs, loading, error } = useSelector((state) => state.cv);

  useEffect(() => {
    // Fetch user's CVs on component mount
    dispatch(fetchUserCVsAsync());
  }, [dispatch]);

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
        {loading && <div className="loading">Loading your CVs...</div>}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && userCVs.length === 0 && (
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

        {!loading && userCVs.length > 0 && (
          <div className="cv-grid">
            {userCVs.map((cv) => (
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
                    onClick={() => navigate(`/upload-cv`, { state: { cv } })}
                  >
                    View Details
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
