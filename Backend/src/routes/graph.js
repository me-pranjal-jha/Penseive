import express from "express";
import { getSession } from "../utils/neo4jClient.js";

const router = express.Router();

// Saare File nodes fetch karo
router.get("/files", async (req, res) => {
  const session = await getSession();
  try {
    const result = await session.run("MATCH (f:File) RETURN f");
    const files = result.records.map((r) => r.get("f").properties);
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

// Specific file ke functions fetch karo
router.get("/functions", async (req, res) => {
  const session = await getSession();
  const filePath = req.query.filePath;

  if (!filePath) {
    return res.status(400).json({ success: false, error: "filePath query param required" });
  }

  try {
    const result = await session.run(
      `MATCH (f:File {path: $filePath})-[:CONTAINS]->(fn:Function)
       RETURN fn`,
      { filePath }
    );
    const functions = result.records.map((r) => r.get("fn").properties);
    res.json({ success: true, functions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});
// Poora graph fetch karo (D3.js ke liye)
router.get("/all", async (req, res) => {
  const session = await getSession();
  try {
    const result = await session.run(
      `MATCH (a)-[r]->(b) RETURN a, r, b`
    );

    const nodes = new Map();
    const edges = [];

    result.records.forEach((record) => {
      const a = record.get("a");
      const b = record.get("b");
      const r = record.get("r");

      nodes.set(a.identity.toString(), {
        id: a.identity.toString(),
        label: a.labels[0],
        ...a.properties,
      });

      nodes.set(b.identity.toString(), {
        id: b.identity.toString(),
        label: b.labels[0],
        ...b.properties,
      });

      edges.push({
        from: a.identity.toString(),
        to: b.identity.toString(),
        type: r.type,
      });
    });

    res.json({
      success: true,
      nodes: Array.from(nodes.values()),
      edges,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    await session.close();
  }
});

export default router;