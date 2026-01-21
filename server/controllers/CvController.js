const { Cv } = require("../models");
const { uploadToCloudinary } = require("../helpers/cloudinaryService");
const { generateCVFromText } = require("../helpers/geminiService");
const { extractTextFromFile } = require("../helpers/textExtractor");

module.exports = class CvController {
  static async uploadCV(req, res, next) {
    try {
      if (!req.file) {
        throw { name: "BadRequest", message: "No file uploaded" };
      }

      const userId = req.user.id;

      // Upload original file to Cloudinary
      const { secure_url } = await uploadToCloudinary(req.file);

      // Extract text from the uploaded file
      const rawText = await extractTextFromFile(req.file);

      // Generate structured CV using Gemini AI
      const generatedCV = await generateCVFromText(rawText);

      // Save CV record to database
      const cvRecord = await Cv.create({
        userId: userId,
        original_file_url: secure_url,
        generated_cv: generatedCV,
      });

      res.status(201).json(cvRecord);
    } catch (error) {
      console.log(error, "<<< error in uploadCV");
      next(error);
    }
  }

  static async getUserCVs(req, res, next) {
    try {
      const userId = req.user.id;

      const cvs = await Cv.findAll({
        where: { userId: userId },
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(cvs);
    } catch (error) {
      console.log(error, "<<< error in getUserCVs");
      next(error);
    }
  }

  static async getCVById(req, res, next) {
    try {
      const { id } = req.params;

      const cv = await Cv.findByPk(id);

      if (!cv) {
        throw { name: "NotFound", message: "CV not found" };
      }

      res.status(200).json(cv);
    } catch (error) {
      console.log(error, "<<< error in getCVById");
      next(error);
    }
  }

  static async updateCV(req, res, next) {
    try {
      const { id } = req.params;
      const { generated_cv } = req.body;

      if (!generated_cv) {
        throw { name: "BadRequest", message: "No CV content provided" };
      }

      const cv = await Cv.findByPk(id);

      if (!cv) {
        throw { name: "NotFound", message: "CV not found" };
      }

      // Update the CV content
      await cv.update({ generated_cv });

      res.status(200).json(cv);
    } catch (error) {
      console.log(error, "<<< error in updateCV");
      next(error);
    }
  }

  static async deleteCV(req, res, next) {
    try {
      const { id } = req.params;

      const cv = await Cv.findByPk(id);

      if (!cv) {
        throw { name: "NotFound", message: "CV not found" };
      }

      await cv.destroy();

      res.status(200).json({ message: "CV deleted successfully" });
    } catch (error) {
      console.log(error, "<<< error in deleteCV");
      next(error);
    }
  }
};
