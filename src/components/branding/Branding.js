import React from "react";
import { RiStackLine } from "react-icons/ri";
import Color from "../color/Color";

const Branding = ({ brandColors }) => {
  return (
    <div className="text-sm">
      <div className="flex justify-start items-center mb-3">
        <RiStackLine className="mr-2 h-5 w-5" />
        <span className="text-md font-bold">
          Branding{" "}
          <span className="ml-5 text-gray-300 font-normal">
            {brandColors.logoColor.length + brandColors.landingPageColor.length}
          </span>
        </span>
      </div>
      {brandColors.logoColor.length > 0 && (
        <>
          <h5 className="text-gray-700 mb-1 font-semibold">Logo colors</h5>
          <div className="grid grid-cols-5 gap-2">
            {brandColors.logoColor.map((color) => (
              <Color key={color + Math.random()} color={color} />
            ))}
          </div>
        </>
      )}
      {brandColors.landingPageColor.length > 0 && (
          <>
            <h5 className="text-gray-700 mb-1 font-semibold mt-2">
              Landing page colors
            </h5>
            <div className="grid grid-cols-5 gap-2">
              {brandColors.landingPageColor.map((color) => (
                <Color key={color + Math.random()} color={color} />
              ))}
            </div>
          </>
        )}
    </div>
  )
}

export default Branding;
