/**
 * Extract keywords from a job description
 */
const extractKeywords = (jobDescription) => {
  // Common filler words to ignore
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need", "must",
    "we", "you", "your", "our", "their", "this", "that", "these", "those",
    "it", "its", "as", "if", "not", "no", "so", "up", "out", "about",
    "into", "over", "after", "all", "also", "new", "one", "two", "more",
    "very", "just", "than", "then", "now", "here", "there", "when", "where",
    "how", "what", "which", "who", "whom", "why", "each", "every", "both",
    "few", "many", "some", "any", "most", "other", "such", "only", "own",
    "same", "able", "across", "per", "within", "including", "etc",
  ]);

  // Technical / skill keywords get higher importance
  const techPatterns = [
    /javascript/i, /typescript/i, /react/i, /node\.?js/i, /python/i,
    /java\b/i, /c\+\+/i, /c#/i, /sql/i, /mongodb/i, /aws/i, /azure/i,
    /docker/i, /kubernetes/i, /git/i, /agile/i, /scrum/i, /rest\s?api/i,
    /graphql/i, /html/i, /css/i, /sass/i, /tailwind/i, /figma/i,
    /machine\s?learning/i, /data\s?science/i, /devops/i, /ci\/cd/i,
  ];

  const text = jobDescription.toLowerCase();
  const words = text.match(/[a-z][a-z+#.]+/g) || [];

  // Count word frequency (excluding stop words)
  const freq = {};
  words.forEach((w) => {
    if (!stopWords.has(w) && w.length > 2) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });

  // Extract multi-word phrases (bigrams)
  const rawWords = text.split(/\s+/);
  for (let i = 0; i < rawWords.length - 1; i++) {
    const bigram = rawWords[i].replace(/[^a-z]/g, "") + " " + rawWords[i + 1].replace(/[^a-z]/g, "");
    if (bigram.length > 5) {
      freq[bigram] = (freq[bigram] || 0) + 1;
    }
  }

  // Sort by frequency and pick top keywords
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([keyword]) => {
      const isTech = techPatterns.some((p) => p.test(keyword));
      return {
        keyword,
        importance: isTech ? "high" : freq[keyword] > 2 ? "medium" : "low",
      };
    });

  return sorted;
};

/**
 * Match resume against extracted keywords
 */
const analyzeResume = (resumeText, jobDescription) => {
  const keywords = extractKeywords(jobDescription);
  const lowerResume = resumeText.toLowerCase();

  let matched = [];
  let missing = [];

  keywords.forEach((kw) => {
    if (lowerResume.includes(kw.keyword)) {
      matched.push(kw.keyword);
      kw.found = true;
    } else {
      missing.push(kw.keyword);
      kw.found = false;
    }
  });

  // Calculate ATS score
  const total = keywords.length || 1;
  const score = Math.round((matched.length / total) * 100);

  // Generate suggestions
  const suggestions = missing.slice(0, 5).map((kw) => ({
    original: `Consider adding "${kw}" to your resume`,
    improved: `Include experience or skills related to "${kw}" in relevant sections`,
  }));

  return {
    keywords,
    matchedKeywords: matched,
    missingKeywords: missing,
    atsScore: score,
    suggestions,
  };
};

module.exports = { extractKeywords, analyzeResume };
