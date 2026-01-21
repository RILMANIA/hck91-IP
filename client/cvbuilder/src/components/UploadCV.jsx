import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadCVAsync, clearError } from "../helpers/cvSlice";

export default function UploadCV() {
  const dispatch = useDispatch();
  const { generatedCV, uploadedFileUrl, loading, error } = useSelector(
    (state) => state.cv,
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) validateAndSetFile(file);
  };

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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

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
    <div className="max-w-4xl mx-auto">
      {!generatedCV ? (
        <UploadForm
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          dragActive={dragActive}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleFileChange={handleFileChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      ) : (
        <CVResult cv={generatedCV} fileUrl={uploadedFileUrl} />
      )}
    </div>
  );
}

function UploadForm({
  selectedFile,
  setSelectedFile,
  dragActive,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
  handleSubmit,
  loading,
  error,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-3">Upload Your CV</h2>
      <p className="text-gray-600 mb-6">
        Upload a PDF or Word document containing your resume information. Our AI
        will extract and format it into a professional CV.
      </p>

      <form onSubmit={handleSubmit}>
        <FileDropZone
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          dragActive={dragActive}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
          handleFileChange={handleFileChange}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedFile || loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            "Generate CV"
          )}
        </button>
      </form>
    </div>
  );
}

function FileDropZone({
  selectedFile,
  setSelectedFile,
  dragActive,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
}) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : selectedFile
            ? "border-green-500 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {selectedFile ? (
        <SelectedFileInfo
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      ) : (
        <EmptyDropZone handleFileChange={handleFileChange} />
      )}
    </div>
  );
}

function SelectedFileInfo({ selectedFile, setSelectedFile }) {
  return (
    <div className="flex flex-col items-center">
      <svg
        className="w-16 h-16 text-green-600 mb-4"
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
      <p className="text-lg font-medium text-gray-800 mb-1">
        {selectedFile.name}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        {(selectedFile.size / 1024).toFixed(2)} KB
      </p>
      <button
        type="button"
        className="text-red-600 hover:text-red-800 font-medium transition-colors"
        onClick={() => setSelectedFile(null)}
      >
        Remove
      </button>
    </div>
  );
}

function EmptyDropZone({ handleFileChange }) {
  return (
    <div className="flex flex-col items-center">
      <svg
        className="w-16 h-16 text-gray-400 mb-4"
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
      <p className="text-gray-700 font-medium mb-2">
        Drag and drop your file here
      </p>
      <p className="text-gray-500 mb-4">or</p>
      <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium cursor-pointer transition-colors inline-block">
        Browse Files
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"
          className="hidden"
        />
      </label>
      <p className="text-sm text-gray-500 mt-4">
        Supported formats: PDF, DOC, DOCX (Max 10MB)
      </p>
    </div>
  );
}

function CVResult({ cv, fileUrl }) {
  const dispatch = useDispatch();

  const handleUploadAnother = () => {
    dispatch({ type: "cv/clearCV" });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <ResultHeader onUploadAnother={handleUploadAnother} />
      <CVHeader cv={cv} />
      <CVEducation education={cv.education} />
      <CVExperience experience={cv.experience} />
      <CVSkills skills={cv.skills} />
      <CVActions fileUrl={fileUrl} />
    </div>
  );
}

function ResultHeader({ onUploadAnother }) {
  return (
    <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
      <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2">
        <span className="text-3xl">✓</span> CV Generated Successfully!
      </h2>
      <button
        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        onClick={onUploadAnother}
      >
        Upload Another
      </button>
    </div>
  );
}

function CVHeader({ cv }) {
  return (
    <div className="mb-8 pb-6 border-b border-gray-200">
      <h3 className="text-3xl font-bold text-gray-800 mb-2">{cv.name}</h3>
      {cv.email && <p className="text-gray-600">{cv.email}</p>}
      {cv.phone && <p className="text-gray-600">{cv.phone}</p>}
    </div>
  );
}

function CVEducation({ education }) {
  if (!education || education.length === 0) return null;

  return (
    <div className="mb-8">
      <h4 className="text-2xl font-semibold text-gray-800 mb-4">Education</h4>
      {education.map((edu, idx) => (
        <div
          key={idx}
          className="mb-4 pb-4 border-b border-gray-100 last:border-0"
        >
          <strong className="text-lg text-gray-800 block">
            {edu.institution}
          </strong>
          <p className="text-gray-700">{edu.degree}</p>
          <span className="text-sm text-gray-500">{edu.year}</span>
        </div>
      ))}
    </div>
  );
}

function CVExperience({ experience }) {
  if (!experience || experience.length === 0) return null;

  return (
    <div className="mb-8">
      <h4 className="text-2xl font-semibold text-gray-800 mb-4">Experience</h4>
      {experience.map((exp, idx) => (
        <div
          key={idx}
          className="mb-6 pb-4 border-b border-gray-100 last:border-0"
        >
          <strong className="text-lg text-gray-800 block">
            {exp.position}
          </strong>
          <p className="text-gray-700 font-medium">{exp.company}</p>
          <span className="text-sm text-gray-500">{exp.duration}</span>
          {exp.description && (
            <p className="text-gray-600 mt-2">{exp.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function CVSkills({ skills }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="mb-8">
      <h4 className="text-2xl font-semibold text-gray-800 mb-4">Skills</h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <span
            key={idx}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function CVActions({ fileUrl }) {
  if (!fileUrl) return null;

  return (
    <div className="pt-6 border-t border-gray-200">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium"
      >
        View Original File
      </a>
    </div>
  );
}
