const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled Resume" },
    originalContent: { type: String },
    optimizedContent: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    jobDescription: { type: String },
    atsScore: { type: Number, default: 0 },
    matchedKeywords: [String],
    missingKeywords: [String],
    suggestions: [
      {
        original: String,
        improved: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
