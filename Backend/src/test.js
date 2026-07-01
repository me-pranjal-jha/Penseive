import "dotenv/config";
import { getFileContent } from "./utils/githubActions.js";
import { parseCode, extractFunctions, extractImports } from "./utils/treeSitterParser.js";
import driver from "./utils/neo4jClient.js"; 
import {
  createFileNode,
  createFunctionNodes,
  createImportEdges,
} from "./utils/graphBuilder.js";

async function runTest() {
  const filePath = "backend/src/controllers/auth.controllers.js";

  const content = await getFileContent(
    "me-pranjal-jha",
    "chat_app",
    filePath,
    "main"
  );

  const tree = parseCode(content);
  const functions = extractFunctions(tree);
  const imports = extractImports(tree);

  console.log("Functions found:", functions.length);
  console.log("Imports found:", imports.length);

  // Neo4j mein push karo
  await createFileNode(filePath);
  console.log("✅ File node created");

  await createFunctionNodes(filePath, functions);
  console.log("✅ Function nodes created");

  await createImportEdges(filePath, imports);
  console.log("✅ Import edges created");

  await driver.close();
  console.log("🎉 Graph build complete! Ab Neo4j Browser mein dekho.");
}

runTest();