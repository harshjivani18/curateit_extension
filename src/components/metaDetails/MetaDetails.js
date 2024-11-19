import { CheckIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { AiOutlineCopy } from "react-icons/ai";
import { RiStackLine } from "react-icons/ri";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}


const MetaDetails = ({ keywords }) => {
  const [showCopied, setShowCopied] = useState(false)

  const handleCopy = () => {
    setShowCopied(true)
    setTimeout(() => {
      setShowCopied(false)
    }, 1000)
  }

  return (
    <div className="text-sm">
      <div className="flex justify-start items-center mb-3">
        <RiStackLine className="mr-2 h-5 w-5" />
        <span className="text-md font-bold">Meta details</span>
      </div>
      <div className="flex justify-start flex-wrap gap-1 items-center p-2 pr-4 border-gray-300 border-[1px] rounded-lg relative">
        <div
          className={classNames(
            showCopied ? "" : "hidden",
            "text-xs font-bold text-green-800 bg-green-400 absolute break-words text-center rounded-md p-1 right-0 -top-5 flex justify-center items-center gap-1"
          )}
        >
          <CheckIcon className="w-4 h-4" />
          Copied
        </div>
        <CopyToClipboard
          // key={color}
          text={keywords.join(", ")}
          onCopy={() => handleCopy()}
          className="absolute top-1 right-1"
        >
            <AiOutlineCopy className="w-5 h-5 text-gray-400" />
        </CopyToClipboard>
        {keywords.map((words) => (
          <span
            key={words}
            className="bg-[#F0F5FF] border-[1px] border-[#B8D4FE] rounded-md text-[#347AE2] px-[3px] py-[2px] text-xs"
          >
            {words}
          </span>
        ))}
      </div>
    </div>
  )
}

export default MetaDetails;
