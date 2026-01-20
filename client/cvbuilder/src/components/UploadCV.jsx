import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadCVAsync, clearError } from "../helpers/cvSlice";
import "./UploadCV.css";

/**
 * WHAT: File upload component for CV generation
 * INPUT: Selected file from user (PDF/Word document)
 * OUTPUT: Displays upload form, progress, and generated CV result
 */

function UploadCV() {
  const dispatch = useDispatch();
  const { generatedCV, uploadedFileUrl, loading, error } = useSelector(
    (state) => state.cv,
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  /**
   * WHAT: Handles file selection from input
   * INPUT: event - file input change event
   * OUTPUT: Sets selected file in component state
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  /**
   * WHAT: Validates file type and size before setting
   * INPUT: file - File object
   * OUTPUT: Sets file if valid, shows error if invalid
   */
  const validateAndSetFile = (file) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PDF or Word document");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    dispatch(clearError());
  };

  /**
   * WHAT: Handles drag over event for drag-and-drop
   * INPUT: event - drag event
   * OUTPUT: Prevents default and sets drag active state
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  /**
   * WHAT: Handles drag leave event
   * INPUT: event - drag event
   * OUTPUT: Removes drag active state
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  /**
   * WHAT: Handles file drop for drag-and-drop upload
   * INPUT: event - drop event with files
   * OUTPUT: Validates and sets dropped file
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  /**
   * WHAT: Submits file for upload and CV generation
   * INPUT: None (uses selectedFile from state)
   * OUTPUT: Dispatches uploadCVAsync action, displays generated CV on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    try {
      await dispatch(uploadCVAsync(selectedFile)).unwrap();
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="upload-cv-container">
      {!generatedCV ? (
        <div className="upload-section">
          <h2>Upload Your CV</h2>
          <p className="upload-description">
            Upload a PDF or Word document containing your resume information.
            Our AI will extract and format it into a professional CV.
          </p>

          <form onSubmit={handleSubmit}>
            <div
              className={`file-drop-zone ${dragActive ? "active" : ""} ${selectedFile ? "has-file" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="file-info">
                  <svg
                    className="file-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="drop-zone-content">
                  <svg
                    className="upload-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p>Drag and drop your file here</p>
                  <p className="or-text">or</p>
                  <label className="file-input-label">
                    Browse Files
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      className="file-input"
                    />
                  </label>
                  <p className="file-requirements">
                    Supported formats: PDF, DOC, DOCX (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="btn btn-primary btn-upload"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                "Generate CV"
              )}
            </button>
          </form>
        </div>
      ) : (
        <CVResult cv={generatedCV} fileUrl={uploadedFileUrl} />
      )}
    </div>
  );
}

/**
 * WHAT: Displays the generated CV result
 * INPUT: cv - generated CV object, fileUrl - original file URL
 * OUTPUT: Renders formatted CV with all sections
 */
function CVResult({ cv, fileUrl }) {
  const dispatch = useDispatch();

  return (
    <div className="cv-result">
      <div className="result-header">
        <h2>✓ CV Generated Successfully!</h2>
        <button
          className="btn btn-secondary"
          onClick={() => dispatch({ type: "cv/clearCV" })}
        >
          Upload Another
        </button>
      </div>

      <div className="cv-display">
        <div className="cv-header">
          <h3>{cv.name}</h3>
          {cv.email && <p>{cv.email}</p>}
          {cv.phone && <p>{cv.phone}</p>}
        </div>

        {cv.education && cv.education.length > 0 && (
          <div className="cv-section">
            <h4>Education</h4>
            {cv.education.map((edu, idx) => (
              <div key={idx} className="cv-item">
                <strong>{edu.institution}</strong>
                <p>{edu.degree}</p>
                <span className="year">{edu.year}</span>
              </div>
            ))}
          </div>
        )}

        {cv.experience && cv.experience.length > 0 && (
          <div className="cv-section">
            <h4>Experience</h4>
            {cv.experience.map((exp, idx) => (
              <div key={idx} className="cv-item">
                <strong>{exp.position}</strong>
                <p>{exp.company}</p>
                <span className="year">{exp.duration}</span>
                {exp.description && (
                  <p className="description">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {cv.skills && cv.skills.length > 0 && (
          <div className="cv-section">
            <h4>Skills</h4>
            <div className="skills-container">
              {cv.skills.map((skill, idx) => (
                <span key={idx} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {fileUrl && (
          <div className="cv-actions">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-link"
            >
              View Original File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadCV;
