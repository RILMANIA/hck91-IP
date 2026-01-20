const multer = require("multer");

/**
 * WHAT: Configures Multer middleware for handling file uploads
 * INPUT: None (configuration object)
 * OUTPUT: Configured Multer middleware that accepts single file under "file" field
 */

// Configure multer to store files in memory as buffer
const storage = multer.memoryStorage();

// File filter to accept only PDF and Word documents
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, and DOCX files are allowed.",
      ),
      false,
    );
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
});

module.exports = upload;
