import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { cvApi } from "../helpers/http-client";
import { supabase } from "../helpers/supabaseClient";
import UploadCVComponent from "../components/UploadCV";

/**
 * WHAT: Upload CV page where users can upload files and view/edit generated CVs
 * INPUT: CV ID from params (optional) for viewing/editing existing CV
 * OUTPUT: Renders upload form or displays CV for editing
 */

export default function UploadCV() {
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div
              className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3 text-gray-600">Loading CV...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mb-4"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-gray-800">
          {cv ? "View/Edit CV" : "Upload New CV"}
        </h1>
      </header>

      <div className="max-w-5xl mx-auto">
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
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex justify-end gap-3 mb-6">
        {!editMode ? (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={() => setEditMode(true)}
          >
            Edit CV
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              onClick={handleSave}
            >
              Save Changes
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="mb-8 pb-6 border-b border-gray-200">
        {editMode ? (
          <>
            <input
              type="text"
              value={generatedCV.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Name"
            />
            <input
              type="email"
              value={generatedCV.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email"
            />
            <input
              type="tel"
              value={generatedCV.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone"
            />
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {generatedCV.name}
            </h2>
            {generatedCV.email && (
              <p className="text-gray-600">{generatedCV.email}</p>
            )}
            {generatedCV.phone && (
              <p className="text-gray-600">{generatedCV.phone}</p>
            )}
          </>
        )}
      </div>

      {generatedCV.education && generatedCV.education.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Education
          </h3>
          {generatedCV.education.map((edu, idx) => (
            <div
              key={idx}
              className="mb-6 pb-4 border-b border-gray-100 last:border-0"
            >
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Year"
                  />
                </>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {edu.institution}
                  </h4>
                  <p className="text-gray-700">{edu.degree}</p>
                  <span className="text-sm text-gray-500">{edu.year}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {generatedCV.experience && generatedCV.experience.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Experience
          </h3>
          {generatedCV.experience.map((exp, idx) => (
            <div
              key={idx}
              className="mb-6 pb-4 border-b border-gray-100 last:border-0"
            >
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description"
                    rows="3"
                  />
                </>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {exp.position}
                  </h4>
                  <p className="text-gray-700 font-medium">{exp.company}</p>
                  <span className="text-sm text-gray-500">{exp.duration}</span>
                  {exp.description && (
                    <p className="text-gray-600 mt-2">{exp.description}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {generatedCV.skills && generatedCV.skills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Skills</h3>
          {editMode ? (
            <textarea
              value={generatedCV.skills.join(", ")}
              onChange={(e) =>
                handleInputChange(
                  "skills",
                  e.target.value.split(",").map((s) => s.trim()),
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Skills (comma separated)"
              rows="3"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {generatedCV.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {!editMode && (
        <div className="pt-6 border-t border-gray-200">
          <a
            href={cv.original_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
          >
            Download Original File
          </a>
        </div>
      )}
    </div>
  );
}
