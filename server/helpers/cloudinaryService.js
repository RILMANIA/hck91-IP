if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const cloudinary = require("cloudinary").v2;

/**
 * WHAT: Configures Cloudinary SDK with credentials from environment variables
 * INPUT: None (reads from .env file)
 * OUTPUT: Configured cloudinary instance
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * WHAT: Uploads a file to Cloudinary cloud storage
 * INPUT: file - Multer file object containing buffer, originalname, mimetype
 * OUTPUT: Promise resolving to { secure_url: string } - public URL of uploaded file
 */
const uploadToCloudinary = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "smart-cv-uploads",
          resource_type: "auto",
          public_id: `cv-${Date.now()}`,
          format: file.originalname.split(".").pop(),
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({ secure_url: result.secure_url });
          }
        },
      );

      // Write file buffer to upload stream
      uploadStream.end(file.buffer);
      console.log("Uploading file to Cloudinary...");
    });
  } catch (error) {
    console.log(error, "<<< error in Cloudinary upload");
    throw {
      name: "BadRequest",
      message: `Cloudinary upload failed: ${error.message}`,
    };
  }
};

module.exports = { uploadToCloudinary };
