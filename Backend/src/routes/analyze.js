import express from "express";
import { getChangedFiles, getFileContent } from "../utils/githubActions.js";
import { parseCode, extractFunctions, extractImports } from "../utils/treeSitterParser.js";
import { createFileNode, createFunctionNodes, createImportEdges } from "../utils/graphBuilder.js";
import { reviewPR } from "../utils/reviewChain.js";

const router = express.Router();

//Only two Entry Points...file and pr

// Single file analyze karo
router.post("/file", async (req, res) => {
  const { owner, repo, filePath, branch = "main" } = req.body;

  try {
    const content = await getFileContent(owner, repo, filePath, branch);
    const tree = parseCode(content);
    const functions = extractFunctions(tree);
    const imports = extractImports(tree);

    await createFileNode(filePath);
    await createFunctionNodes(filePath, functions);
    await createImportEdges(filePath, imports);

    res.json({
      success: true,
      filePath,
      functionsFound: functions.length,
      importsFound: imports.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PR analyze karo — main feature
router.post("/pr", async (req, res) => {
  const { owner, repo, prNumber } = req.body;

  try {
    const changedFiles = await getChangedFiles(owner, repo, prNumber);

    // Sirf JS files filter karo abhi
    const jsFiles = changedFiles.filter((f) =>
      f.filename.endsWith(".js") || f.filename.endsWith(".jsx")
    );

    const results = [];

    for (const file of jsFiles) {
      try {
        const content = await getFileContent(owner, repo, file.filename, "main");
        const tree = parseCode(content);
        const functions = extractFunctions(tree);
        const imports = extractImports(tree);

        await createFileNode(file.filename);
        await createFunctionNodes(file.filename, functions);
        await createImportEdges(file.filename, imports);

        results.push({
          filename: file.filename,
          status: file.status,
          functionsFound: functions.length,
          importsFound: imports.length,
        });
      } catch (fileErr) {
        // Ek file fail hone pe poora PR fail na ho
        results.push({
          filename: file.filename,
          status: file.status,
          error: fileErr.message,
        });
      }
    }

    res.json({
      success: true,
      prNumber,
      totalFiles: changedFiles.length,
      jsFilesAnalyzed: jsFiles.length,
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PR Review route
router.post("/review", async (req, res) => {
  const { owner, repo, prNumber } = req.body;

  try {
    // Pehle changed files lo
    const changedFiles = await getChangedFiles(owner, repo, prNumber);
    
    // Sirf JS files
    const jsFiles = changedFiles.filter((f) =>
      f.filename.endsWith(".js") || f.filename.endsWith(".jsx")
    );

    // Review generate karo
    const review = await reviewPR(owner, repo, prNumber, jsFiles);

    res.json({
      success: true,
      prNumber,
      review,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;