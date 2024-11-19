import React from "react";
import {
  RiFacebookCircleFill,
  RiYoutubeFill,
  RiPinterestFill,
  RiInstagramLine,
  RiLinkedinBoxFill,
  RiTwitterFill,
} from "react-icons/ri"

const Social = ({ socials }) => {
  if (
    !socials.facebook &&
    !socials.youtube &&
    !socials.pinterest &&
    !socials.instagram &&
    !socials.linkedin &&
    !socials.twitter
  ){
    return null;
  }
    return (
      <div className="flex justify-start items-center gap-3">
        {/* Facebook */}
        {socials.facebook && (
          <a href={socials.facebook} target="_blank" rel="noreferrer">
            <div className="h-[32px] w-[32px] bg-[#E5F0FF] flex justify-center items-center rounded-[4px]">
              <RiFacebookCircleFill className="h-5 w-5 text-[#347AE2]" />
            </div>
          </a>
        )}
        {/* Youtube */}
        {socials.youtube && (
          <a href={socials.youtube} target="_blank" rel="noreferrer">
            <div className="h-[32px] w-[32px] bg-[#E5F0FF] flex justify-center items-center rounded-[4px]">
              <RiYoutubeFill className="h-5 w-5 text-[#347AE2]" />
            </div>
          </a>
        )}

        {/* Pinterest */}
        {socials.pinterest && (
          <a href={socials.pinterest} target="_blank" rel="noreferrer">
            <div className="h-[32px] w-[32px] bg-[#E5F0FF] flex justify-center items-center rounded-[4px]">
              <RiPinterestFill className="h-5 w-5 text-[#347AE2]" />
            </div>
          </a>
        )}
        {/* Intstagram */}
        {socials.instagram && (
          <a href={socials.instagram} target="_blank" rel="noreferrer">
            <div className="h-[32px] w-[32px] bg-[#E5F0FF] flex justify-center items-center rounded-[4px]">
              <RiInstagramLine className="h-5 w-5 text-[#347AE2]" />
            </div>
          </a>
        )}
        {/* LinkedIn */}
        {socials.linkedin && (
          <a href={socials.linkedin} target="_blank" rel="noreferrer">
            <div className="h-[32px] w-[32px] bg-[#E5F0FF] flex justify-center items-center rounded-[4px]">
              <RiLinkedinBoxFill className="h-5 w-5 text-[#347AE2]" />
            </div>
          </a>
        )}
        {/* Twitter */}
        {socials.twitter && (
          <a href={socials.twitter} target="_blank" rel="noreferrer">
            <div className="h-[32px] w-[32px] bg-[#E5F0FF] flex justify-center items-center rounded-[4px]">
              <RiTwitterFill className="h-5 w-5 text-[#347AE2]" />
            </div>
          </a>
        )}
      </div>
    )
};

export default Social;
