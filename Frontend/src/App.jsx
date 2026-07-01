import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage";
import AnalyzePR from "./pages/AnalyzePR";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze/pr" element={<AnalyzePR />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;