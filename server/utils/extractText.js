const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

const extractText = async (buffer, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === ".pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
};

module.exports = extractText;
