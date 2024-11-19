import React, { useState } from "react";
import remarkGfm from 'remark-gfm';
import Markdown from "react-markdown";

const TruncateText = ({ text, length=100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  if (text.length <= length) {
    return <span className="text-[#4b5563] block">{text}</span>;
  }

  return (
    <div>
      <p>
        <Markdown remarkPlugins={remarkGfm}>
          {isExpanded ? text : `${text.substring(0, length)}...`}
        </Markdown>
        <span
          onClick={toggleExpansion}
          style={{ color: "blue", cursor: "pointer" }}
        >
          {isExpanded ? " See less" : " See more"}
        </span>
      </p>
    </div>
  );
};

export default TruncateText;
