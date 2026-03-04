const express = require("express");
const protect = require("../middleware/auth");
const upload = require("../middleware/upload");
const extractText = require("../utils/extractText");
const Resume = require("../models/Resume");

const router = express.Router();

// POST /api/resume/upload — Upload PDF/DOCX and extract text
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const text = await extractText(req.file.buffer, req.file.originalname);

    res.json({
      text,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/resume/history — Get all saved resume checks for user
router.get("/history", protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("title atsScore createdAt fileName");

    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/resume/:id — Get a single saved resume check
router.get("/:id", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
