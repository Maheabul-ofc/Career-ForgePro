const express = require("express");
const protect = require("../middleware/auth");
const { analyzeResume } = require("../utils/keywordMatcher");
const Resume = require("../models/Resume");

const router = express.Router();

// POST /api/analyze — Analyze resume against job description
router.post("/", protect, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: "Resume text and job description are required" });
    }

    const result = analyzeResume(resumeText, jobDescription);

    // Extract a job title from the first line of JD
    const firstLine = jobDescription.split("\n")[0].trim();
    const jobTitle = firstLine.length > 80 ? firstLine.substring(0, 80) + "..." : firstLine;

    // Save to MongoDB
    const saved = await Resume.create({
      user: req.user._id,
      title: jobTitle || "Resume Analysis",
      originalContent: resumeText,
      jobDescription,
      atsScore: result.atsScore,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      suggestions: result.suggestions,
    });

    res.json({
      _id: saved._id,
      jobTitle,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
