import Parser from "tree-sitter";
import JavaScript from "tree-sitter-javascript";

const parser = new Parser();
parser.setLanguage(JavaScript);

export function parseCode(sourceCode) {
  const tree = parser.parse(sourceCode);
  return tree;
}

// Tree se functions nikalna
export function extractFunctions(tree) {
  const functions = [];

  function walk(node) {
    // function declaration
    if (node.type === "function_declaration") {
      const nameNode = node.childForFieldName("name");
      functions.push({
        name: nameNode ? nameNode.text : "anonymous",
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
      });
    }

    // arrow function ya function expression (const x = () => {})
    if (
      node.type === "variable_declarator" &&
      node.childForFieldName("value")?.type === "arrow_function"
    ) {
      const nameNode = node.childForFieldName("name");
      functions.push({
        name: nameNode ? nameNode.text : "anonymous",
        startLine: node.startPosition.row + 1,
        endLine: node.endPosition.row + 1,
      });
    }

    // export async function getUser() {}
    if (node.type === "export_statement") {
      const funcNode = node.children.find(
        (c) =>
          c.type === "function_declaration" ||
          c.type === "generator_function_declaration"
      );
      if (funcNode) {
        const nameNode = funcNode.childForFieldName("name");
        functions.push({
          name: nameNode ? nameNode.text : "anonymous",
          startLine: funcNode.startPosition.row + 1,
          endLine: funcNode.endPosition.row + 1,
        });
      }
    }

    for (const child of node.children) {
      walk(child);
    }
  }

  walk(tree.rootNode);
  return functions;
}

// Tree se imports nikalna
export function extractImports(tree) {
  const imports = [];

  function walk(node) {
    if (node.type === "import_statement") {
      const sourceNode = node.childForFieldName("source");
      imports.push({
        source: sourceNode ? sourceNode.text.replace(/['"]/g, "") : null,
      });
    }
    for (const child of node.children) {
      walk(child);
    }
  }

  walk(tree.rootNode);
  return imports;
}