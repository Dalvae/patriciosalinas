import React from "react";
import ProtectedImage from "./ui/ProtectedImage";
import parse, { Element } from "html-react-parser";
import type { HTMLReactParserOptions } from "html-react-parser";
interface ContentWithProtectedImagesProps {
  content: string;
}

const ContentWithProtectedImages: React.FC<ContentWithProtectedImagesProps> = ({
  content,
}) => {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (
        domNode instanceof Element &&
        domNode.name === "img" &&
        domNode.attribs
      ) {
        return (
          <ProtectedImage
            src={domNode.attribs.src || ""}
            alt={domNode.attribs.alt || ""}
            width={domNode.attribs.width}
            height={domNode.attribs.height}
            className={domNode.attribs.class || ""}
          />
        );
      }
    },
  };

  return (
    <div className="wp-content is-layout-constrained">
      {parse(content, options)}
    </div>
  );
};

export default ContentWithProtectedImages;
