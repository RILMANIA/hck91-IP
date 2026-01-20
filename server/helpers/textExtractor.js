const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * WHAT: Extracts text content from PDF or Word documents
 * INPUT: file - Multer file object with buffer and mimetype
 * OUTPUT: Promise resolving to extracted text string
 */
const extractTextFromFile = async (file) => {
  try {
    const mimeType = file.mimetype;

    // Extract text from PDF
    if (mimeType === "application/pdf") {
      const data = await pdfParse(file.buffer);
      return data.text;
    }

    // Extract text from Word document (.doc, .docx)
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }

    throw new Error(
      "Unsupported file type. Please upload PDF or Word document.",
    );
  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

module.exports = { extractTextFromFile };
