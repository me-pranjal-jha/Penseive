import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getSession } from "./neo4jClient.js";
import { getPRDiff } from "./githubActions.js";

// Gemini model setup
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-2.5-flash",
  temperature: 0.3,
});

// Graph context fetch karo Neo4j se
async function getGraphContext(changedFiles) {
  const session = await getSession();
  try {
    const fileNames = changedFiles.map((f) => f.filename);

    const result = await session.run(
      `MATCH (f:File)-[:CONTAINS]->(fn:Function)
       WHERE f.path IN $fileNames
       RETURN f.path as file, collect(fn.name) as functions`,
      { fileNames }
    );

    return result.records.map((r) => ({
      file: r.get("file"),
      functions: r.get("functions"),
    }));
  } finally {
    await session.close();
  }
}

// PR Review chain
export async function reviewPR(owner, repo, prNumber, changedFiles) {
  // 1. PR diff fetch karo
  const diff = await getPRDiff(owner, repo, prNumber);

  // 2. Graph context fetch karo
  const graphContext = await getGraphContext(changedFiles);

  // 3. Prompt banao
  const prompt = PromptTemplate.fromTemplate(`
You are an expert code reviewer with deep understanding of software architecture.

## PR Diff:
{diff}

## Codebase Graph Context (functions in changed files):
{graphContext}

## Your Task:
Review this PR and provide:
1. **Summary** - What does this PR do? (2-3 lines)
2. **Key Changes** - Most important changes made
3. **Potential Issues** - Any bugs, edge cases, or concerns
4. **Suggestions** - Improvements or best practices
5. **Overall Assessment** - LGTM / Needs Changes / Major Issues

Be concise and specific. Focus on actual code quality issues.
`);

  // 4. Chain run karo
 const formattedPrompt = await prompt.format({
  diff: diff.slice(0, 8000),
  graphContext: JSON.stringify(graphContext, null, 2),
});

const response = await model.invoke(formattedPrompt);

return response.content;

}