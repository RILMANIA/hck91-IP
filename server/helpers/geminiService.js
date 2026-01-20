const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * WHAT: Initializes Google Gemini AI client with API key
 * INPUT: None (reads from .env file)
 * OUTPUT: Configured Gemini AI instance
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * WHAT: Generates a structured professional CV from raw text using Gemini AI
 * INPUT: rawText - string containing extracted text from uploaded PDF/Word document
 * OUTPUT: Promise resolving to structured CV JSON object with format:
 *   {
 *     name: string,
 *     email: string,
 *     phone: string,
 *     education: [{ institution, degree, year }],
 *     experience: [{ company, position, duration, description }],
 *     skills: [string]
 *   }
 */
const generateCVFromText = async (rawText) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
You are an expert CV parser and formatter. Analyze the following raw text extracted from a document and create a structured professional CV in JSON format.

Extract and organize the information into this exact JSON structure:
{
  "name": "Full name of the person",
  "email": "Email address",
  "phone": "Phone number",
  "education": [
    {
      "institution": "University/School name",
      "degree": "Degree or qualification",
      "year": "Year or duration"
    }
  ],
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "duration": "Time period",
      "description": "Brief description of responsibilities"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

Raw text to parse:
${rawText}

Return ONLY valid JSON without any markdown formatting or code blocks.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up response to ensure valid JSON
    let cleanedText = text.trim();

    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```\n?/g, "");
    }

    // Parse and return the structured CV
    const structuredCV = JSON.parse(cleanedText);

    return structuredCV;
  } catch (error) {
    throw new Error(`Gemini CV generation failed: ${error.message}`);
  }
};

module.exports = { generateCVFromText };
