import { useNavigate } from "react-router-dom";

export default function CVCard({ cv, handleDeleteCV, formatDate }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-1 line-clamp-2 h-14">
          {cv.generated_cv?.name || "Untitled CV"}
        </h3>
        <span className="text-sm text-gray-500">
          {formatDate(cv.createdAt)}
        </span>
      </div>

      <div className="space-y-2 mb-4 flex-grow">
        <p className="text-sm text-gray-700">
          <strong className="font-medium">Email:</strong>{" "}
          <span className="truncate block">
            {cv.generated_cv?.email || "N/A"}
          </span>
        </p>
        <p className="text-sm text-gray-700">
          <strong className="font-medium">Phone:</strong>{" "}
          {cv.generated_cv?.phone || "N/A"}
        </p>
        {cv.generated_cv?.skills && cv.generated_cv.skills.length > 0 && (
          <div className="mt-3">
            <strong className="text-sm font-medium text-gray-700">
              Skills:
            </strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {cv.generated_cv.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {cv.generated_cv.skills.length > 3 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  +{cv.generated_cv.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-200">
        <a
          href={cv.original_file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 underline text-center"
        >
          View Original
        </a>
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          onClick={() => navigate(`/cv/${cv.id}`)}
        >
          View Details
        </button>
        <button
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          onClick={() => handleDeleteCV(cv.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
