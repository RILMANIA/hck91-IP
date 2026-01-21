// Mock external services BEFORE any imports
jest.mock("../helpers/cloudinaryService");
jest.mock("../helpers/geminiService");
jest.mock("../helpers/textExtractor");

const { test, expect, describe } = require("@jest/globals");

const { uploadToCloudinary } = require("../helpers/cloudinaryService");
const { generateCVFromText } = require("../helpers/geminiService");
const { extractTextFromFile } = require("../helpers/textExtractor");

describe("Helper Services", () => {
  describe("cloudinaryService", () => {
    test("should upload file to cloudinary successfully", async () => {
      const mockFile = {
        buffer: Buffer.from("test file content"),
        mimetype: "application/pdf",
        originalname: "test.pdf",
      };

      uploadToCloudinary.mockResolvedValue({
        secure_url: "https://cloudinary.com/test.pdf",
        public_id: "test-id",
      });

      const result = await uploadToCloudinary(mockFile);

      expect(result).toHaveProperty("secure_url");
      expect(result.secure_url).toContain("cloudinary.com");
      expect(uploadToCloudinary).toHaveBeenCalledWith(mockFile);
    });

    test("should handle cloudinary upload errors", async () => {
      const mockFile = {
        buffer: Buffer.from("test file content"),
        mimetype: "application/pdf",
      };

      uploadToCloudinary.mockRejectedValue(
        new Error("Cloudinary upload failed"),
      );

      await expect(uploadToCloudinary(mockFile)).rejects.toThrow(
        "Cloudinary upload failed",
      );
    });

    test("should handle missing file buffer", async () => {
      const mockFile = {
        mimetype: "application/pdf",
        originalname: "test.pdf",
      };

      uploadToCloudinary.mockRejectedValue(
        new Error("No file buffer provided"),
      );

      await expect(uploadToCloudinary(mockFile)).rejects.toThrow(
        "No file buffer provided",
      );
    });
  });

  describe("textExtractor", () => {
    test("should extract text from PDF file successfully", async () => {
      const mockFile = {
        buffer: Buffer.from("test pdf content"),
        mimetype: "application/pdf",
        originalname: "resume.pdf",
      };

      const mockExtractedText = `
        John Doe
        Software Engineer
        john@example.com
        +1234567890
        
        Experience:
        - Senior Developer at Tech Corp (2020-2023)
        - Junior Developer at StartUp Inc (2018-2020)
        
        Education:
        - BS Computer Science, University of Tech (2014-2018)
        
        Skills: JavaScript, Python, React, Node.js
      `;

      extractTextFromFile.mockResolvedValue(mockExtractedText);

      const result = await extractTextFromFile(mockFile);

      expect(result).toBe(mockExtractedText);
      expect(result).toContain("John Doe");
      expect(result).toContain("Software Engineer");
      expect(extractTextFromFile).toHaveBeenCalledWith(mockFile);
    });

    test("should extract text from DOCX file successfully", async () => {
      const mockFile = {
        buffer: Buffer.from("test docx content"),
        mimetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        originalname: "resume.docx",
      };

      const mockExtractedText = "Sample CV text from DOCX";

      extractTextFromFile.mockResolvedValue(mockExtractedText);

      const result = await extractTextFromFile(mockFile);

      expect(result).toBe(mockExtractedText);
      expect(extractTextFromFile).toHaveBeenCalledWith(mockFile);
    });

    test("should handle text extraction errors", async () => {
      const mockFile = {
        buffer: Buffer.from("corrupt file"),
        mimetype: "application/pdf",
      };

      extractTextFromFile.mockRejectedValue(
        new Error("Failed to extract text from file"),
      );

      await expect(extractTextFromFile(mockFile)).rejects.toThrow(
        "Failed to extract text from file",
      );
    });

    test("should handle unsupported file types", async () => {
      const mockFile = {
        buffer: Buffer.from("image content"),
        mimetype: "image/png",
        originalname: "image.png",
      };

      extractTextFromFile.mockRejectedValue(new Error("Unsupported file type"));

      await expect(extractTextFromFile(mockFile)).rejects.toThrow(
        "Unsupported file type",
      );
    });
  });

  describe("geminiService", () => {
    test("should generate structured CV from text successfully", async () => {
      const rawText = `
        John Doe
        Software Engineer
        john@example.com
        
        Experience: Developer at Company A
        Education: BS Computer Science
        Skills: JavaScript, Python
      `;

      const mockGeneratedCV = {
        personalInfo: {
          name: "John Doe",
          email: "john@example.com",
          phone: "",
          address: "",
        },
        summary: "Experienced Software Engineer",
        experience: [
          {
            title: "Developer",
            company: "Company A",
            startDate: "",
            endDate: "",
            description: "",
          },
        ],
        education: [
          {
            degree: "BS Computer Science",
            institution: "",
            graduationYear: "",
          },
        ],
        skills: ["JavaScript", "Python"],
        certifications: [],
        languages: [],
      };

      generateCVFromText.mockResolvedValue(mockGeneratedCV);

      const result = await generateCVFromText(rawText);

      expect(result).toHaveProperty("personalInfo");
      expect(result).toHaveProperty("experience");
      expect(result).toHaveProperty("education");
      expect(result).toHaveProperty("skills");
      expect(result.personalInfo.name).toBe("John Doe");
      expect(result.skills).toContain("JavaScript");
      expect(generateCVFromText).toHaveBeenCalledWith(rawText);
    });

    test("should handle Gemini API errors", async () => {
      const rawText = "Some text";

      generateCVFromText.mockRejectedValue(
        new Error("Gemini API rate limit exceeded"),
      );

      await expect(generateCVFromText(rawText)).rejects.toThrow(
        "Gemini API rate limit exceeded",
      );
    });

    test("should handle empty text input", async () => {
      const rawText = "";

      generateCVFromText.mockRejectedValue(
        new Error("Text input cannot be empty"),
      );

      await expect(generateCVFromText(rawText)).rejects.toThrow(
        "Text input cannot be empty",
      );
    });

    test("should handle malformed text input", async () => {
      const rawText = "Random unstructured text without CV information";

      const mockGeneratedCV = {
        personalInfo: {
          name: "",
          email: "",
          phone: "",
          address: "",
        },
        summary: "",
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
      };

      generateCVFromText.mockResolvedValue(mockGeneratedCV);

      const result = await generateCVFromText(rawText);

      expect(result).toHaveProperty("personalInfo");
      expect(result.experience).toEqual([]);
    });

    test("should parse complex CV with multiple sections", async () => {
      const rawText = `
        Jane Smith
        Senior Software Engineer
        jane.smith@email.com | +1-555-0123
        
        Professional Summary:
        Highly skilled software engineer with 10+ years of experience
        
        Work Experience:
        Senior Engineer at Tech Corp (2020-Present)
        - Led team of 5 developers
        - Implemented microservices architecture
        
        Engineer at StartUp Inc (2015-2020)
        - Developed RESTful APIs
        
        Education:
        MS Computer Science, MIT (2013-2015)
        BS Computer Science, Stanford (2009-2013)
        
        Skills:
        JavaScript, TypeScript, Python, Java, React, Node.js, AWS, Docker
        
        Certifications:
        AWS Solutions Architect (2022)
        
        Languages:
        English (Native), Spanish (Fluent)
      `;

      const mockComplexCV = {
        personalInfo: {
          name: "Jane Smith",
          email: "jane.smith@email.com",
          phone: "+1-555-0123",
          address: "",
        },
        summary:
          "Highly skilled software engineer with 10+ years of experience",
        experience: [
          {
            title: "Senior Engineer",
            company: "Tech Corp",
            startDate: "2020",
            endDate: "Present",
            description: "Led team of 5 developers",
          },
          {
            title: "Engineer",
            company: "StartUp Inc",
            startDate: "2015",
            endDate: "2020",
            description: "Developed RESTful APIs",
          },
        ],
        education: [
          {
            degree: "MS Computer Science",
            institution: "MIT",
            graduationYear: "2015",
          },
          {
            degree: "BS Computer Science",
            institution: "Stanford",
            graduationYear: "2013",
          },
        ],
        skills: [
          "JavaScript",
          "TypeScript",
          "Python",
          "Java",
          "React",
          "Node.js",
          "AWS",
          "Docker",
        ],
        certifications: ["AWS Solutions Architect (2022)"],
        languages: ["English (Native)", "Spanish (Fluent)"],
      };

      generateCVFromText.mockResolvedValue(mockComplexCV);

      const result = await generateCVFromText(rawText);

      expect(result.experience).toHaveLength(2);
      expect(result.education).toHaveLength(2);
      expect(result.skills).toHaveLength(8);
      expect(result.certifications).toHaveLength(1);
      expect(result.languages).toHaveLength(2);
    });
  });

  describe("Integration: Full CV Upload Flow", () => {
    test("should complete full CV upload and processing", async () => {
      const mockFile = {
        buffer: Buffer.from("CV content"),
        mimetype: "application/pdf",
        originalname: "resume.pdf",
      };

      const mockCloudinaryUrl = "https://cloudinary.com/resume.pdf";
      const mockExtractedText = "John Doe, Software Engineer...";
      const mockGeneratedCV = {
        personalInfo: { name: "John Doe", email: "john@example.com" },
        experience: [],
        education: [],
        skills: ["JavaScript"],
      };

      uploadToCloudinary.mockResolvedValue({ secure_url: mockCloudinaryUrl });
      extractTextFromFile.mockResolvedValue(mockExtractedText);
      generateCVFromText.mockResolvedValue(mockGeneratedCV);

      const cloudinaryResult = await uploadToCloudinary(mockFile);
      const extractedText = await extractTextFromFile(mockFile);
      const generatedCV = await generateCVFromText(extractedText);

      expect(cloudinaryResult.secure_url).toBe(mockCloudinaryUrl);
      expect(extractedText).toBe(mockExtractedText);
      expect(generatedCV).toEqual(mockGeneratedCV);
    });
  });
});
