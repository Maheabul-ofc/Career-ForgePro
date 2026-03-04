/**
 * AI Resume Rewriter
 * Uses OpenAI-compatible API to rewrite resume bullet points
 * incorporating missing keywords from the JD analysis.
 */

const buildRewritePrompt = (resumeText, missingKeywords, matchedKeywords, jobDescription) => {
  return `You are an expert ATS Resume Optimizer. Your job is to rewrite the user's resume content to maximize their ATS (Applicant Tracking System) score for the target job description.

## Instructions:
1. Analyze the resume content and the target job description
2. Rewrite bullet points to naturally incorporate the MISSING keywords
3. Keep the candidate's actual experience truthful — only rephrase, don't fabricate
4. Use strong action verbs and quantifiable achievements where possible
5. Maintain professional tone and formatting

## Missing Keywords to Incorporate:
${missingKeywords.join(", ")}

## Already Matched Keywords (keep these):
${matchedKeywords.join(", ")}

## Target Job Description:
${jobDescription}

## Original Resume Content:
${resumeText}

## Response Format:
Return a JSON object with this exact structure:
{
  "optimizedContent": "The full rewritten resume content with keywords incorporated",
  "changes": [
    {
      "original": "Original bullet point or section",
      "rewritten": "Rewritten version with keywords",
      "keywordsAdded": ["keyword1", "keyword2"]
    }
  ],
  "newAtsScore": 85,
  "summary": "Brief summary of changes made"
}

IMPORTANT: Return ONLY valid JSON, no markdown code blocks.`;
};

/**
 * Call Google Gemini API for resume rewriting
 * Requires GEMINI_API_KEY in environment (free tier available)
 */
const rewriteResume = async (resumeText, missingKeywords, matchedKeywords, jobDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Add it to server/.env — get a free key at https://aistudio.google.com/app/apikey");
  }

  const prompt = buildRewritePrompt(resumeText, missingKeywords, matchedKeywords, jobDescription);
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("No response from Gemini model");
  }

  // Parse the JSON response (handle potential markdown wrapping)
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);

  try {
    return JSON.parse(cleaned.trim());
  } catch (e) {
    throw new Error("Failed to parse AI response as JSON");
  }
};

module.exports = { rewriteResume };
