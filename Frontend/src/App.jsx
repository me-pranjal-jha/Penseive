import { useState } from "react";
import { fetchGraph, analyzePR, analyzeFile } from "./utils/api";
import GraphCanvas from "./components/GraphCanvas";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [filePath, setFilePath] = useState("");
  const [branch, setBranch] = useState("main");
  const [mode, setMode] = useState("pr"); // "pr" ya "file"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAnalyzePR() {
    setLoading(true);
    setMessage("Analyzing PR...");
    try {
      await analyzePR(owner, repo, prNumber);
      setMessage("PR analyzed! Loading graph...");
      const graph = await fetchGraph();
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setMessage("Graph loaded!");
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyzeFile() {
    setLoading(true);
    setMessage("Analyzing file...");
    try {
      await analyzeFile(owner, repo, filePath, branch);
      setMessage("File analyzed! Loading graph...");
      const graph = await fetchGraph();
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setMessage("Graph loaded!");
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadGraph() {
    setLoading(true);
    setMessage("Loading graph...");
    try {
      const graph = await fetchGraph();
      setNodes(graph.nodes);
      setEdges(graph.edges);
      setMessage("Graph loaded!");
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#0D1117", minHeight: "100vh", color: "#fff", fontFamily: "serif" }}>

      {/* Header */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #C9A86A", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <h1 style={{ color: "#C9A86A", margin: 0, fontSize: "24px" }}>🧙 Pensieve</h1>

        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setMode("pr")}
            style={{ ...toggleBtn, background: mode === "pr" ? "#C9A86A" : "transparent", color: mode === "pr" ? "#0D1117" : "#C9A86A" }}
          >
            PR Mode
          </button>
          <button
            onClick={() => setMode("file")}
            style={{ ...toggleBtn, background: mode === "file" ? "#C9A86A" : "transparent", color: mode === "file" ? "#0D1117" : "#C9A86A" }}
          >
            File Mode
          </button>
        </div>

        <input placeholder="owner" value={owner} onChange={(e) => setOwner(e.target.value)} style={inputStyle} />
        <input placeholder="repo" value={repo} onChange={(e) => setRepo(e.target.value)} style={inputStyle} />

        {/* PR Mode inputs */}
        {mode === "pr" && (
          <>
            <input placeholder="PR number" value={prNumber} onChange={(e) => setPrNumber(e.target.value)} style={inputStyle} />
            <button onClick={handleAnalyzePR} disabled={loading} style={btnStyle}>
              {loading ? "Analyzing..." : "Analyze PR"}
            </button>
          </>
        )}

        {/* File Mode inputs */}
        {mode === "file" && (
          <>
            <input placeholder="file path (e.g. src/index.js)" value={filePath} onChange={(e) => setFilePath(e.target.value)} style={{ ...inputStyle, width: "220px" }} />
            <input placeholder="branch (default: main)" value={branch} onChange={(e) => setBranch(e.target.value)} style={{ ...inputStyle, width: "150px" }} />
            <button onClick={handleAnalyzeFile} disabled={loading} style={btnStyle}>
              {loading ? "Analyzing..." : "Analyze File"}
            </button>
          </>
        )}

        <button onClick={handleLoadGraph} disabled={loading} style={{ ...btnStyle, background: "transparent", border: "1px solid #C9A86A", color: "#C9A86A" }}>
          Load Graph
        </button>

        {message && <span style={{ color: "#C9A86A", fontSize: "13px" }}>{message}</span>}
      </div>

      {/* Graph */}
      {nodes.length > 0 && edges.length > 0 ? (
        <GraphCanvas nodes={nodes} edges={edges} />
      ) : (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          color: "#C9A86A",
          fontSize: "18px",
          fontFamily: "serif"
        }}>
          🧙 Enter details to summon the Pensieve...
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  background: "#1A1A2E",
  border: "1px solid #C9A86A",
  borderRadius: "6px",
  padding: "6px 12px",
  color: "#fff",
  outline: "none",
};

const btnStyle = {
  background: "#C9A86A",
  border: "none",
  borderRadius: "6px",
  padding: "6px 16px",
  color: "#0D1117",
  cursor: "pointer",
  fontWeight: "bold",
};

const toggleBtn = {
  border: "1px solid #C9A86A",
  borderRadius: "6px",
  padding: "6px 14px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default App;