import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { uploadCVAsync, clearCV } from "../helpers/cvSlice";
import UploadCVComponent from "../components/UploadCV";
import "./UploadCV.css";

/**
 * WHAT: Upload CV page where users can upload files and view generated CVs
 * INPUT: None (may receive CV data via location state for viewing)
 * OUTPUT: Renders upload form and displays generated CV results
 */

function UploadCV() {
  const navigate = useNavigate();
  const location = useLocation();
  const viewingCV = location.state?.cv;

  return (
    <div className="upload-cv-page">
      <header className="page-header">
        <button className="btn btn-back" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>{viewingCV ? "View CV" : "Upload New CV"}</h1>
      </header>

      <div className="page-content">
        {viewingCV ? <CVDisplay cv={viewingCV} /> : <UploadCVComponent />}
      </div>
    </div>
  );
}

/**
 * WHAT: Displays a generated CV in a formatted view
 * INPUT: cv - CV object with generated_cv and original_file_url
 * OUTPUT: Renders formatted CV details
 */
function CVDisplay({ cv }) {
  const generatedCV = cv.generated_cv;

  return (
    <div className="cv-display">
      <div className="cv-header">
        <h2>{generatedCV.name}</h2>
        {generatedCV.email && <p>{generatedCV.email}</p>}
        {generatedCV.phone && <p>{generatedCV.phone}</p>}
      </div>

      {generatedCV.education && generatedCV.education.length > 0 && (
        <div className="cv-section">
          <h3>Education</h3>
          {generatedCV.education.map((edu, idx) => (
            <div key={idx} className="cv-item">
              <h4>{edu.institution}</h4>
              <p>{edu.degree}</p>
              <span className="cv-year">{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {generatedCV.experience && generatedCV.experience.length > 0 && (
        <div className="cv-section">
          <h3>Experience</h3>
          {generatedCV.experience.map((exp, idx) => (
            <div key={idx} className="cv-item">
              <h4>{exp.position}</h4>
              <p className="company">{exp.company}</p>
              <span className="cv-year">{exp.duration}</span>
              {exp.description && (
                <p className="description">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {generatedCV.skills && generatedCV.skills.length > 0 && (
        <div className="cv-section">
          <h3>Skills</h3>
          <div className="skills-list">
            {generatedCV.skills.map((skill, idx) => (
              <span key={idx} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}

export default UploadCV;
