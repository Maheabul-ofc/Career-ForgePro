const express = require("express");
const protect = require("../middleware/auth");

const router = express.Router();

// POST /api/pdf/generate — Generate a PDF from optimized resume content
router.post("/generate", protect, async (req, res) => {
  try {
    const { content, title } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Resume content is required" });
    }

    const puppeteer = require("puppeteer");

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1a1a;
            padding: 48px 56px;
          }
          h1 {
            font-size: 22pt;
            font-weight: 700;
            text-align: center;
            margin-bottom: 4px;
            color: #111;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          h2 {
            font-size: 12pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1.5px solid #333;
            padding-bottom: 3px;
            margin-top: 18px;
            margin-bottom: 8px;
            color: #222;
          }
          h3 {
            font-size: 11pt;
            font-weight: 700;
            margin-bottom: 2px;
            color: #111;
          }
          p, li {
            font-size: 10.5pt;
            line-height: 1.5;
            color: #333;
          }
          ul {
            padding-left: 18px;
            margin-bottom: 8px;
          }
          li {
            margin-bottom: 3px;
          }
          .contact-info {
            text-align: center;
            font-size: 9.5pt;
            color: #555;
            margin-bottom: 16px;
          }
          .section { margin-bottom: 12px; }
          .job-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
          }
          .job-date {
            font-size: 10pt;
            color: #555;
            font-style: italic;
          }
          strong { font-weight: 700; }
          em { font-style: italic; }
        </style>
      </head>
      <body>
        ${formatResumeToHTML(content)}
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${(title || "resume").replace(/[^a-zA-Z0-9]/g, "_")}.pdf"`,
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Convert plain text resume content into structured HTML
 */
function formatResumeToHTML(content) {
  const lines = content.split("\n");
  let html = "";
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      continue;
    }

    // Section headers (ALL CAPS lines or lines starting with ##)
    if (trimmed.startsWith("## ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2>${trimmed.replace("## ", "")}</h2>`;
    } else if (trimmed.startsWith("# ")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h1>${trimmed.replace("# ", "")}</h1>`;
    } else if (/^[A-Z][A-Z\s&]+$/.test(trimmed) && trimmed.length > 3) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h2>${trimmed}</h2>`;
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${trimmed.replace(/^[-•*]\s*/, "")}</li>`;
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      if (inList) { html += "</ul>"; inList = false; }
      html += `<h3>${trimmed.replace(/\*\*/g, "")}</h3>`;
    } else {
      if (inList) { html += "</ul>"; inList = false; }
      // Bold and italic markdown
      let formatted = trimmed
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
      html += `<p>${formatted}</p>`;
    }
  }

  if (inList) html += "</ul>";
  return html;
}

module.exports = router;
