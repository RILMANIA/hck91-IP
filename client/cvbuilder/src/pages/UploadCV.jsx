import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { cvApi } from "../helpers/http-client";
import { supabase } from "../helpers/supabaseClient";
import UploadCVComponent from "../components/UploadCV";
import "./UploadCV.css";

/**
 * WHAT: Upload CV page where users can upload files and view/edit generated CVs
 * INPUT: CV ID from params (optional) for viewing/editing existing CV
 * OUTPUT: Renders upload form or displays CV for editing
 */

function UploadCV() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchCVById = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const { data } = await cvApi.get(`/cvs/${id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log(data, "<<< data fetchCVById UploadCV");
      setCv(data);
    } catch (error) {
      console.log(error.response, "<<< fetchCVById UploadCV");

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
          text: "There was an error fetching the CV",
        });
      }
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCV = async (updatedCVData) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      await cvApi.put(
        `/cvs/${id}`,
        { generated_cv: updatedCVData },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "CV updated successfully",
      });

      setEditMode(false);
      await fetchCVById();
    } catch (error) {
      console.log(error.response, "<<< updateCV UploadCV");

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
          text: "There was an error updating the CV",
        });
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchCVById();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCVById();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="upload-cv-page">
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
            <p className="mt-3 text-muted">Loading CV...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-cv-page">
      <header className="page-header">
        <button className="btn btn-back" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>{cv ? "View/Edit CV" : "Upload New CV"}</h1>
      </header>

      <div className="page-content">
        {cv ? (
          <CVDisplay
            cv={cv}
            editMode={editMode}
            setEditMode={setEditMode}
            onUpdate={handleUpdateCV}
          />
        ) : (
          <UploadCVComponent />
        )}
      </div>
    </div>
  );
}

/**
 * WHAT: Displays a generated CV in a formatted view with edit capability
 * INPUT: cv - CV object with generated_cv and original_file_url
 * OUTPUT: Renders formatted CV details with edit mode
 */
function CVDisplay({ cv, editMode, setEditMode, onUpdate }) {
  const [formData, setFormData] = useState(cv.generated_cv);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleCancel = () => {
    setFormData(cv.generated_cv);
    setEditMode(false);
  };

  const generatedCV = editMode ? formData : cv.generated_cv;

  return (
    <div className="cv-display">
      <div className="cv-actions-top">
        {!editMode ? (
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Edit CV
          </button>
        ) : (
          <div className="edit-actions">
            <button className="btn btn-success" onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="cv-header">
        {editMode ? (
          <>
            <input
              type="text"
              value={generatedCV.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="form-control mb-2"
              placeholder="Name"
            />
            <input
              type="email"
              value={generatedCV.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="form-control mb-2"
              placeholder="Email"
            />
            <input
              type="tel"
              value={generatedCV.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="form-control"
              placeholder="Phone"
            />
          </>
        ) : (
          <>
            <h2>{generatedCV.name}</h2>
            {generatedCV.email && <p>{generatedCV.email}</p>}
            {generatedCV.phone && <p>{generatedCV.phone}</p>}
          </>
        )}
      </div>

      {generatedCV.education && generatedCV.education.length > 0 && (
        <div className="cv-section">
          <h3>Education</h3>
          {generatedCV.education.map((edu, idx) => (
            <div key={idx} className="cv-item">
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={edu.institution || ""}
                    onChange={(e) =>
                      handleArrayChange("education", idx, {
                        ...edu,
                        institution: e.target.value,
                      })
                    }
                    className="form-control mb-2"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.degree || ""}
                    onChange={(e) =>
                      handleArrayChange("education", idx, {
                        ...edu,
                        degree: e.target.value,
                      })
                    }
                    className="form-control mb-2"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.year || ""}
                    onChange={(e) =>
                      handleArrayChange("education", idx, {
                        ...edu,
                        year: e.target.value,
                      })
                    }
                    className="form-control"
                    placeholder="Year"
                  />
                </>
              ) : (
                <>
                  <h4>{edu.institution}</h4>
                  <p>{edu.degree}</p>
                  <span className="cv-year">{edu.year}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {generatedCV.experience && generatedCV.experience.length > 0 && (
        <div className="cv-section">
          <h3>Experience</h3>
          {generatedCV.experience.map((exp, idx) => (
            <div key={idx} className="cv-item">
              {editMode ? (
                <>
                  <input
                    type="text"
                    value={exp.position || ""}
                    onChange={(e) =>
                      handleArrayChange("experience", idx, {
                        ...exp,
                        position: e.target.value,
                      })
                    }
                    className="form-control mb-2"
                    placeholder="Position"
                  />
                  <input
                    type="text"
                    value={exp.company || ""}
                    onChange={(e) =>
                      handleArrayChange("experience", idx, {
                        ...exp,
                        company: e.target.value,
                      })
                    }
                    className="form-control mb-2"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.duration || ""}
                    onChange={(e) =>
                      handleArrayChange("experience", idx, {
                        ...exp,
                        duration: e.target.value,
                      })
                    }
                    className="form-control mb-2"
                    placeholder="Duration"
                  />
                  <textarea
                    value={exp.description || ""}
                    onChange={(e) =>
                      handleArrayChange("experience", idx, {
                        ...exp,
                        description: e.target.value,
                      })
                    }
                    className="form-control"
                    placeholder="Description"
                    rows="3"
                  />
                </>
              ) : (
                <>
                  <h4>{exp.position}</h4>
                  <p className="company">{exp.company}</p>
                  <span className="cv-year">{exp.duration}</span>
                  {exp.description && (
                    <p className="description">{exp.description}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {generatedCV.skills && generatedCV.skills.length > 0 && (
        <div className="cv-section">
          <h3>Skills</h3>
          {editMode ? (
            <textarea
              value={generatedCV.skills.join(", ")}
              onChange={(e) =>
                handleInputChange(
                  "skills",
                  e.target.value.split(",").map((s) => s.trim()),
                )
              }
              className="form-control"
              placeholder="Skills (comma separated)"
              rows="3"
            />
          ) : (
            <div className="skills-list">
              {generatedCV.skills.map((skill, idx) => (
                <span key={idx} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {!editMode && (
        <div className="cv-actions">
          <a
            href={cv.original_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Download Original File
          </a>
        </div>
      )}
    </div>
  );
}

export default UploadCV;
