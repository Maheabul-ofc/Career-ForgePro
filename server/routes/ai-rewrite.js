const express = require("express");
const protect = require("../middleware/auth");
const { rewriteResume } = require("../utils/aiRewriter");
const { analyzeResume } = require("../utils/keywordMatcher");
const Resume = require("../models/Resume");

const router = express.Router();

// POST /api/ai-rewrite — AI-powered resume rewrite
router.post("/", protect, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: "Resume text and job description are required" });
    }

    // Step 1: Analyze keywords
    const analysis = analyzeResume(resumeText, jobDescription);

    // Step 2: AI rewrite to incorporate missing keywords
    const rewriteResult = await rewriteResume(
      resumeText,
      analysis.missingKeywords,
      analysis.matchedKeywords,
      jobDescription
    );

    // Step 3: Re-analyze the optimized content
    const optimizedAnalysis = analyzeResume(rewriteResult.optimizedContent, jobDescription);

    // Extract job title
    const firstLine = jobDescription.split("\n")[0].trim();
    const jobTitle = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;

    // Step 4: Save to MongoDB
    const saved = await Resume.create({
      user: req.user._id,
      title: jobTitle || "AI Optimized Resume",
      originalContent: resumeText,
      optimizedContent: rewriteResult.optimizedContent,
      jobDescription,
      atsScore: optimizedAnalysis.atsScore,
      matchedKeywords: optimizedAnalysis.matchedKeywords,
      missingKeywords: optimizedAnalysis.missingKeywords,
      suggestions: rewriteResult.changes.map((c) => ({
        original: c.original,
        improved: c.rewritten,
      })),
    });

    res.json({
      _id: saved._id,
      jobTitle,
      originalAnalysis: {
        atsScore: analysis.atsScore,
        matchedKeywords: analysis.matchedKeywords,
        missingKeywords: analysis.missingKeywords,
      },
      optimizedAnalysis: {
        atsScore: optimizedAnalysis.atsScore,
        matchedKeywords: optimizedAnalysis.matchedKeywords,
        missingKeywords: optimizedAnalysis.missingKeywords,
      },
      optimizedContent: rewriteResult.optimizedContent,
      changes: rewriteResult.changes,
      summary: rewriteResult.summary,
    });
  } catch (error) {
    console.error("AI Rewrite error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
