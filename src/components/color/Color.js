import React, { useState } from "react";
import { AiOutlineCopy } from "react-icons/ai";
import { CopyToClipboard } from "react-copy-to-clipboard"
import { CheckIcon } from "@heroicons/react/24/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Color = ({ color }) => {
  const [showCopied, setShowCopied] = useState("")

  const handleCopy = (idx) => {
    setShowCopied(idx)
    setTimeout(() => {
      setShowCopied("")
    }, 1000)
  }

  return (
    <CopyToClipboard
      key={color}
      text={color}
      onCopy={() => handleCopy(color)}
      className="cursor-pointer relative"
    >
      <div>
        <div
          className={classNames(
            showCopied === color ? "" : "hidden",
            "text-xs font-bold text-green-800 bg-green-400 absolute break-words text-center rounded-md p-1 right-0 -top-5 flex justify-center items-center gap-1"
          )}
        >
          <CheckIcon className="w-4 h-4" />
          Copied
        </div>
        <div
          style={{ backgroundColor: color }}
          className="w-full h-10 rounded-md"
        ></div>
        <div className="flex justify-center items-center gap-1 text-gray-600 text-xs">
          <span>{color}</span>
          <button>
            <AiOutlineCopy />
          </button>
        </div>
      </div>
    </CopyToClipboard>
  )
};

export default Color;
