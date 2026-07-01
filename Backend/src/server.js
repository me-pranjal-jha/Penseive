import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyze.js";
import graphRoutes from "./routes/graph.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Pensieve API running 🧙" });
});

// Routes (baad mein add karenge)
app.use("/api/analyze", analyzeRoutes);
app.use("/api/graph", graphRoutes);

app.listen(PORT, () => {
  console.log(`Pensieve server running on port ${PORT}`);
});