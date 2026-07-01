import { getSession } from "./neo4jClient.js";

// File node banana
export async function createFileNode(filePath, language = "javascript") {
  const session = await getSession();
  try {
    await session.run(
      `MERGE (f:File {path: $path})
       SET f.language = $language,
           f.name = $name
       RETURN f`,
      { 
        path: filePath, 
        language,
        name: filePath.split("/").pop()
      }
    );
  } finally {
    await session.close();
  }
}

// Function node banana aur File se CONTAINS edge lagana
export async function createFunctionNodes(filePath, functions) {
  const session = await getSession();
  try {
    for (const fn of functions) {
      await session.run(
        `MATCH (f:File {path: $filePath})
         MERGE (fn:Function {name: $name, filePath: $filePath})
         SET fn.startLine = $startLine, fn.endLine = $endLine
         MERGE (f)-[:CONTAINS]->(fn)`,
        {
          filePath,
          name: fn.name,
          startLine: fn.startLine,
          endLine: fn.endLine,
        }
      );
    }
  } finally {
    await session.close();
  }
}

// Import edges banana (File A imports File B)
export async function createImportEdges(filePath, imports) {
  const session = await getSession();
  try {
    for (const imp of imports) {
      // Sirf relative imports handle karenge abhi (jo "./" ya "../" se start hoon)
      // npm packages (bcryptjs, dotenv) skip karenge for now
      if (!imp.source.startsWith(".")) continue;

      await session.run(
        `MERGE (a:File {path: $fromPath})
         MERGE (b:File {path: $toPath})
         MERGE (a)-[:IMPORTS]->(b)`,
        {
          fromPath: filePath,
          toPath: imp.source,
        }
      );
    }
  } finally {
    await session.close();
  }
}