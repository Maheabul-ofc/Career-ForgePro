import React, { useEffect, useState } from "react";
import { getHistory, getResumeById } from "../api";

const History = () => {
  const [resumes, setResumes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getHistory();
        setResumes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelect = async (id) => {
    try {
      const { data } = await getResumeById(id);
      setSelected(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Resume History</h1>

      {resumes.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
          <p className="text-slate-400">No resume checks yet. Go to Dashboard to analyze your first resume.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            {resumes.map((r) => (
              <button
                key={r._id}
                onClick={() => handleSelect(r._id)}
                className={`w-full text-left bg-slate-800 rounded-xl p-4 border transition-colors ${
                  selected?._id === r._id
                    ? "border-indigo-500"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <p className="text-white text-sm font-medium truncate">{r.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-indigo-400 text-sm font-bold">{r.atsScore}%</span>
                  <span className="text-slate-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">{selected.title}</h2>
                  <span className="text-2xl font-bold text-indigo-400">{selected.atsScore}%</span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white mb-2">✅ Matched</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.matchedKeywords.map((kw) => (
                      <span key={kw} className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white mb-2">❌ Missing</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.missingKeywords.map((kw) => (
                      <span key={kw} className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {selected.suggestions?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-2">💡 Suggestions</h3>
                    {selected.suggestions.map((s, i) => (
                      <div key={i} className="bg-slate-700/50 rounded p-3 mb-2">
                        <p className="text-slate-400 text-sm">{s.original}</p>
                        <p className="text-indigo-300 text-sm mt-1">{s.improved}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center">
                <p className="text-slate-400">Select a resume check to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
