import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { analyzePR, fetchGraph } from "../utils/api";
import GraphCanvas from "../components/GraphCanvas";

function AnalyzePR() {
  const navigate = useNavigate();
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [review, setReview] = useState(null);
  const [activeTab, setActiveTab] = useState("graph"); // "graph" ya "review"

 async function handleAnalyze() {
    if (!owner || !repo || !prNumber) {
      toast.error("Please fill all fields!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("🧙 Summoning memories...");

    try {
      // PR analyze karo (fail hone pe bhi continue karo)
      try {
        await analyzePR(owner, repo, prNumber);
      } catch (err) {
        console.log("PR analyze warning:", err.message);
      }
      
      toast.loading("📊 Building dependency graph...", { id: toastId });
      const graph = await fetchGraph();
      setNodes(graph.nodes);
      setEdges(graph.edges);

      toast.loading("🤖 Generating AI review...", { id: toastId });
      const reviewRes = await fetch("http://localhost:3000/api/analyze/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, prNumber: parseInt(prNumber) }),
      });
      const reviewData = await reviewRes.json();
      setReview(reviewData.review);

      toast.success("✨ Pensieve ready!", { id: toastId });
    } catch (err) {
      toast.error("Error: " + err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Toaster position="top-right" />

      {/* Navbar */}
      <div className="navbar bg-base-200 border-b border-base-300 px-6">
        <div className="flex-1">
          <button
            onClick={() => navigate("/")}
            className="btn btn-ghost text-primary text-xl font-bold"
          >
            🧙 Pensieve
          </button>
        </div>
        <div className="flex-none">
          <label className="toggle text-base-content">
            <input type="checkbox" value="synthwave" className="theme-controller" />
            <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>
            <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>
          </label>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex justify-center py-6 bg-base-200 border-b border-base-300">
        <div className="flex gap-3 items-center flex-wrap justify-center">
          <input
            className="input input-bordered input-primary w-40"
            placeholder="owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
          <input
            className="input input-bordered input-primary w-40"
            placeholder="repo"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <input
            className="input input-bordered input-primary w-32"
            placeholder="PR number"
            value={prNumber}
            onChange={(e) => setPrNumber(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`btn btn-primary ${loading ? "loading" : ""}`}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Summoning..." : "🪄 Analyze PR"}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      {nodes.length > 0 ? (
        <div className="flex h-[calc(100vh-140px)]">

          {/* Left — Graph */}
          <div className="w-[60%] border-r border-base-300 relative">
            <div className="absolute top-2 left-2 z-10">
              <div className="badge badge-primary">Dependency Graph</div>
            </div>
            <GraphCanvas nodes={nodes} edges={edges} />
          </div>

          {/* Right — Review Panel */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-[40%] flex flex-col"
          >
            {/* Tabs */}
            <div className="tabs tabs-border px-4 pt-4">
              <button
                className={`tab ${activeTab === "review" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("review")}
              >
                🤖 AI Review
              </button>
              <button
                className={`tab ${activeTab === "stats" ? "tab-active" : ""}`}
                onClick={() => setActiveTab("stats")}
              >
                📊 Stats
              </button>
            </div>

            {/* Review Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "review" && review && (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-base-content bg-base-200 p-4 rounded-lg">
                    {review}
                  </pre>
                </div>
              )}
              {activeTab === "stats" && (
                <div className="flex flex-col gap-4">
                  <div className="stats stats-vertical shadow">
                    <div className="stat">
                      <div className="stat-title">Total Nodes</div>
                      <div className="stat-value text-primary">{nodes.length}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Total Edges</div>
                      <div className="stat-value text-secondary">{edges.length}</div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Files</div>
                      <div className="stat-value text-accent">
                        {nodes.filter((n) => n.label === "File").length}
                      </div>
                    </div>
                    <div className="stat">
                      <div className="stat-title">Functions</div>
                      <div className="stat-value">
                        {nodes.filter((n) => n.label === "Function").length}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-140px)]">
          <div className="text-center text-base-content/40">
            <div className="text-6xl mb-4">🔮</div>
            <p className="text-lg">Enter PR details and click Analyze</p>
            <p className="text-sm mt-2">The Pensieve awaits...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyzePR;