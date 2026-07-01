import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Poora PR diff (raw text, +/- lines)
export async function getPRDiff(owner, repo, prNumber) {
  const response = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: "diff",
    },
  });
  return response.data; // raw diff string
}

// File-by-file changed files list
export async function getChangedFiles(owner, repo, prNumber) {
  const response = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
  });

  return response.data.map((file) => ({
    filename: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
    patch: file.patch, // file-specific diff
  }));
}

// Pure file ka content fetch karna (parsing ke liye chahiye)
export async function getFileContent(owner, repo, path, ref) {
  const response = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref, // branch/commit SHA
  });

  // GitHub content ko base64 mein bhejta hai, decode karna padega
  const content = Buffer.from(response.data.content, "base64").toString("utf-8");
  return content;
}