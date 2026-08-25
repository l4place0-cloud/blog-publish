import { resolve } from 'node:path';

export default function remarkSolutionTitle() {
  const configuredRoot = process.env.SOLUTIONS_CONTENT_ROOT;
  const solutionsRoot = configuredRoot
    ? resolve(configuredRoot).replaceAll('\\', '/')
    : null;

  return (tree, file) => {
    if (!solutionsRoot) return;

    const filePath = resolve(String(file.path ?? '')).replaceAll('\\', '/');
    if (filePath !== solutionsRoot && !filePath.startsWith(`${solutionsRoot}/`)) return;

    const headingIndex = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 1);
    if (headingIndex >= 0) tree.children.splice(headingIndex, 1);
  };
}
