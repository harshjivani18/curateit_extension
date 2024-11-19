import React from "react";
import { RiStackLine } from "react-icons/ri";

const Technology = ({ technology }) => {
  return (
    <div className="text-sm">
      <div className="flex justify-start items-center mb-3">
        <RiStackLine className="mr-2 h-5 w-5" />
        <span className="text-md font-bold">
          Technologies{" "}
          <span className="ml-5 text-gray-300 font-normal">{technology.length}</span>
        </span>
      </div>
      <div className="w-2/3 grid grid-cols-2 gap-4">
        {technology.map((tech) => (
          <div
            key={tech.name}
            className="flex justify-start items-center gap-2"
          >
            <img
              className="h-5 w-5 object-contain"
              src={tech?.logo}
              alt={tech?.name}
            />
            <span>{tech?.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Technology;
