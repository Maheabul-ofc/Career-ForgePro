import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Beat the <span className="text-indigo-400">ATS</span>.{" "}
            <br className="hidden md:block" />
            Land More Interviews.
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Upload your resume, paste a job description, and instantly see your ATS
            compatibility score with keyword analysis and optimization suggestions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="gradient-accent text-white font-semibold px-8 py-3 rounded-lg text-lg hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 px-8 py-3 rounded-lg text-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: "📄",
              title: "Upload Resume",
              desc: "Upload your PDF or DOCX resume and we'll extract the content automatically.",
            },
            {
              icon: "💼",
              title: "Paste Job Description",
              desc: "Add the target job description to match keywords and skills.",
            },
            {
              icon: "⚡",
              title: "Get ATS Score",
              desc: "Instantly see your ATS score, matched/missing keywords, and optimization tips.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Optimize Your Resume?
        </h2>
        <p className="text-slate-400 mb-8">
          Join thousands of job seekers who improved their ATS scores and landed more interviews.
        </p>
        <Link
          to="/register"
          className="gradient-accent text-white font-semibold px-10 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity inline-block"
        >
          Start Now — It's Free
        </Link>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} CareerForge Pro. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
