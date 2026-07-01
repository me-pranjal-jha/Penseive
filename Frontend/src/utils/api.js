import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export async function fetchGraph() {
  const response = await api.get("/api/graph/all");
  return response.data;
}

export async function analyzePR(owner, repo, prNumber) {
  const response = await api.post("/api/analyze/pr", {
    owner,
    repo,
    prNumber: parseInt(prNumber),
  });
  return response.data;
}

export async function analyzeFile(owner, repo, filePath, branch = "main") {
  const response = await api.post("/api/analyze/file", {
    owner,
    repo,
    filePath,
    branch,
  });
  return response.data;
}

export default api;