import React, { useState, useEffect } from "react";
import { uploadResume, analyzeResume, aiRewriteResume, generatePDF, checkSubscription } from "../api";

const Dashboard = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState("");
  const [subscription, setSubscription] = useState({ subscribed: false, tier: "free" });
  const [activeTab, setActiveTab] = useState("analyze");

  useEffect(() => {
    checkSubscription()
      .then(({ data }) => setSubscription(data))
      .catch(() => setSubscription({ subscribed: false, tier: "free" }));
  }, []);

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await uploadResume(formData);
      setResumeText(data.text);
    } catch (err) {
      setError(err.response?.data?.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Both resume and job description are required");
      return;
    }
    setAnalyzing(true);
    setError("");
    setAiResult(null);
    try {
      const { data } = await analyzeResume({ resumeText, jobDescription });
      setAnalysis(data);
      setActiveTab("results");
    } catch (err) {
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAiRewrite = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Both resume and job description are required");
      return;
    }
    setRewriting(true);
    setError("");
    try {
      const { data } = await aiRewriteResume({ resumeText, jobDescription });
      setAiResult(data);
      setActiveTab("ai-results");
    } catch (err) {
      setError(err.response?.data?.message || "AI rewrite failed");
    } finally {
      setRewriting(false);
    }
  };

  const handleDownloadPDF = async (content, title) => {
    setGeneratingPdf(true);
    setError("");
    try {
      const { data } = await generatePDF({ content, title });
      const blob = new Blob([data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(title || "resume").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "PDF generation failed");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">Resume Optimizer</h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            subscription.tier === "pro"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "bg-slate-700 text-slate-400 border border-slate-600"
          }`}>
            {subscription.tier === "pro" ? "⭐ Pro Plan" : "Free Plan"}
          </span>
        </div>
      </div>
      <p className="text-slate-400 mb-8">
        Upload your resume and paste a job description to get ATS keyword matching & AI optimization
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Panel — Input */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">📄 Upload Resume</h2>
            <div className="flex gap-3">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="flex-1 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer"
              />
              <button
                onClick={handleFileUpload}
                disabled={!file || uploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Extract"}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">📝 Resume Content</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content or upload a file above..."
              rows={8}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">💼 Job Description</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              rows={8}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 resize-none focus:outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="gradient-accent text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {analyzing ? "⏳ Analyzing..." : "⚡ Analyze Keywords"}
              </button>
              <button
                onClick={handleAiRewrite}
                disabled={rewriting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                {rewriting ? "🤖 Rewriting..." : "🤖 AI Optimize"}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel — Results */}
        <div className="space-y-6">
          {/* Tab switcher */}
          {(analysis || aiResult) && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("results")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "results"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                📊 Keyword Analysis
              </button>
              {aiResult && (
                <button
                  onClick={() => setActiveTab("ai-results")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "ai-results"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  🤖 AI Optimized
                </button>
              )}
            </div>
          )}

          {/* Keyword Analysis Results */}
          {activeTab === "results" && analysis && (
            <>
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
                <h2 className="text-lg font-semibold text-white mb-4">ATS Score</h2>
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-4 border-indigo-500">
                  <span className="text-4xl font-bold text-indigo-400">{analysis.atsScore}%</span>
                </div>
                <p className="text-slate-400 text-sm mt-3">{analysis.jobTitle}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-sm font-medium text-white mb-3">✅ Matched Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchedKeywords.map((kw) => (
                    <span key={kw} className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                      {kw}
                    </span>
                  ))}
                  {analysis.matchedKeywords.length === 0 && (
                    <p className="text-slate-500 text-sm">No keywords matched</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-sm font-medium text-white mb-3">❌ Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((kw) => (
                    <span key={kw} className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {analysis.suggestions?.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-sm font-medium text-white mb-3">💡 Suggestions</h3>
                  <div className="space-y-3">
                    {analysis.suggestions.map((s, i) => (
                      <div key={i} className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-sm">{s.original}</p>
                        <p className="text-indigo-300 text-sm mt-1">{s.improved}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* AI Optimized Results */}
          {activeTab === "ai-results" && aiResult && (
            <>
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Score Improvement</h2>
                  <button
                    onClick={() => handleDownloadPDF(aiResult.optimizedContent, aiResult.jobTitle)}
                    disabled={generatingPdf}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                  >
                    {generatingPdf ? "Generating..." : "📥 Download PDF"}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-red-500/50">
                      <span className="text-2xl font-bold text-red-400">{aiResult.originalAnalysis.atsScore}%</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">Before</p>
                  </div>
                  <div className="text-2xl text-slate-500">→</div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-4 border-green-500/50">
                      <span className="text-2xl font-bold text-green-400">{aiResult.optimizedAnalysis.atsScore}%</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">After</p>
                  </div>
                </div>
              </div>

              {aiResult.summary && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4">
                  <p className="text-emerald-300 text-sm">{aiResult.summary}</p>
                </div>
              )}

              {aiResult.changes?.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <h3 className="text-sm font-medium text-white mb-3">🔄 Changes Made</h3>
                  <div className="space-y-4">
                    {aiResult.changes.map((c, i) => (
                      <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-red-400/70 text-sm line-through mb-2">{c.original}</p>
                        <p className="text-green-300 text-sm">{c.rewritten}</p>
                        {c.keywordsAdded?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.keywordsAdded.map((kw) => (
                              <span key={kw} className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs">
                                +{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-sm font-medium text-white mb-3">📄 Optimized Resume</h3>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                  {aiResult.optimizedContent}
                </pre>
              </div>
            </>
          )}

          {/* Empty state */}
          {!analysis && !aiResult && (
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="text-5xl mb-4 opacity-50">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
              <p className="text-slate-400 max-w-sm">
                Upload your resume and paste a job description to get your ATS compatibility score and AI-optimized version
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
