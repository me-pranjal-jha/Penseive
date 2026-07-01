import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <label className="toggle text-base-content">
          <input type="checkbox" value="synthwave" className="theme-controller" />
          <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>
          <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>
        </label>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="card bg-base-200 shadow-2xl p-12 w-[520px] items-center text-center gap-8 border border-base-300"
      >
        {/* Logo */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-7xl"
        >
          🧙
        </motion.div>

        {/* Title */}
        <div className="gap-2 flex flex-col">
          <h1 className="text-5xl font-bold text-primary">Pensieve</h1>
          <p className="text-base-content/60 text-sm mt-1">
            Understanding code should not feel like magic.
          </p>
        </div>

        {/* Divider */}
        <div className="divider w-full">✨</div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg w-full"
            onClick={() => navigate("/analyze/pr")}
          >
            🔍 Analyze a PR
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-outline btn-primary btn-lg w-full"
            onClick={() => navigate("/analyze/file")}
          >
            📄 Analyze a File
          </motion.button>
        </div>

        {/* Stats */}
        <div className="stats stats-horizontal shadow w-full">
          <div className="stat place-items-center">
            <div className="stat-title">Parsing</div>
            <div className="stat-value text-primary text-lg">AST</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">Graph</div>
            <div className="stat-value text-primary text-lg">Neo4j</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">AI</div>
            <div className="stat-value text-primary text-lg">Gemini</div>
          </div>
        </div>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-base-content/40 text-xs mt-6"
      >
        Powered by AST parsing + Neo4j + Gemini AI
      </motion.p>
    </div>
  );
}

export default LandingPage;