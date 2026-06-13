/**
 * Rehype plugin: strips <img> elements and their wrapping <figure> from the HTML tree.
 * Project images are rendered separately via ProtectedImage gallery.
 */
export default function rehypeStripImages() {
  return (tree) => {
    stripImages(tree);
  };
}

// fallow-ignore-next-line complexity
function shouldStrip(node) {
  if (node.type !== "element") return false;
  if (node.tagName === "img") return true;
  if (node.tagName !== "figure") return false;
  return node.children?.some((c) => c.type === "element" && c.tagName === "img");
}

function stripImages(node) {
  if (!node.children) return;

  const toRemove = [];
  for (let i = 0; i < node.children.length; i++) {
    if (shouldStrip(node.children[i])) {
      toRemove.push(i);
    }
    stripImages(node.children[i]);
  }

  for (let i = toRemove.length - 1; i >= 0; i--) {
    node.children.splice(toRemove[i], 1);
  }
}
