/**
 * Rehype plugin: strips <img> elements and their wrapping <figure> from the HTML tree.
 * Project images are rendered separately via ProtectedImage gallery.
 */
import { visit } from "unist-util-visit";

export default function rehypeStripImages() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName === "img" && parent && typeof index === "number") {
        parent.children.splice(index, 1);
        return index;
      }
      if (node.tagName === "figure" && parent && typeof index === "number") {
        const hasImg = node.children.some(
          (child) => child.type === "element" && child.tagName === "img"
        );
        if (hasImg) {
          parent.children.splice(index, 1);
          return index;
        }
      }
    });
  };
}
