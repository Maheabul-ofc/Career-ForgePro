const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/resume", require("./routes/resume"));
app.use("/api/analyze", require("./routes/analyze"));
app.use("/api/ai-rewrite", require("./routes/ai-rewrite"));
app.use("/api/stripe", require("./routes/stripe"));
app.use("/api/pdf", require("./routes/pdf"));

app.get("/", (req, res) => {
  res.json({ message: "CareerForge API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
