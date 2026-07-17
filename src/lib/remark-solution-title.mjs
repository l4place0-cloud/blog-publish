export default function remarkSolutionTitle() {
  return (tree, file) => {
    const filePath = String(file.path ?? '').replaceAll('\\', '/');
    if (!filePath.includes('/sources/my-solve/')) return;

    const headingIndex = tree.children.findIndex((node) => node.type === 'heading' && node.depth === 1);
    if (headingIndex >= 0) tree.children.splice(headingIndex, 1);
  };
}
