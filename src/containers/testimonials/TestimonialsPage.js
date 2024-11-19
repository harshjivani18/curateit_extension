import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

import OperationLayout from "../../components/layouts/OperationLayout";
import session from "../../utils/session";
import { panelClose } from "../../utils/message-operations";

import {
  addGemToSharedCollection,
  getBookmarkDetailsMicrolink,
  moveGemToSharedCollection,
  removeGemFromCollection,
  updateBookmarkWithExistingCollection,
  uploadAllTypeFileInS3,
  uploadScreenshots,
} from "../../actions/collection";
import { addGem, updateGem } from "../../actions/gems";
import { removeDuplicates } from "../../utils/equalChecks";
// import { useEffect } from "react";
import {
  RiGithubLine,
  RiLinkedinFill,
  RiMediumLine,
  RiProductHuntLine,
  RiRedditLine,
  RiTwitterLine,
  RiInstagramLine,
  RiYoutubeLine,
  RiTwitterXFill,
  RiThreadsFill,
  RiFacebookLine,
  RiSnapchatFill,
  RiGitlabFill,
  RiMastodonFill,
  RiPinterestFill,
} from "react-icons/ri";
import { DiHackernews } from "react-icons/di";
import ComboBoxSelect from "../../components/combobox/ComboBoxSelect";
import {
  FaQuora,
  FaAppStore,
  FaProductHunt,
  FaGoodreads,
  FaShopify,
  FaAmazon,
  FaYelp,
} from "react-icons/fa";
import { BsGoogle, BsApple } from "react-icons/bs";
import { IoLogoGooglePlaystore } from "react-icons/io5";
import Input from "../../components/input/Input";
import { Button, DatePicker, Dropdown, Rate, Spin, message ,Input as AntInput} from "antd";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { TEXT_MESSAGE, getColorForProfilePlatform, getDomainFromURLForBookmark, normalizeUrl } from "../../utils/constants";
import TextareaAutosize from "react-textarea-autosize";
import moment from "moment";
import { PiPencilSimple, PiUploadSimpleLight } from "react-icons/pi";
import { AiOutlineUser } from "react-icons/ai";
import { ArrowTopRightOnSquareIcon, ArrowUpTrayIcon, HeartIcon, LinkIcon, MicrophoneIcon, PhotoIcon, PlayCircleIcon, SpeakerWaveIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Validator } from "../../utils/validations";
import { readHtmlDocument } from "../../utils/read-html-page";
import { updateTags } from "../../utils/update-tags";
import TranslatorComponent from "../../components/audioTranscript/TranslatorComponent";
import { GlobeAltIcon, TrashIcon } from "@heroicons/react/24/outline";

let currentParentDetails            = null;
let openImg = null
// media: {
//           covers: finalCovers,
//           testimonial: testimonial,
//           attachImage: finalSrc || '',
//           author: testimonialAuthor,
//           date: testimonialDate,
//           platform: testimonialPlatform,
//           product: testimonialProduct,
//           rating: testimonialRating,
//           tagLine: testimonialTagLine,
//           url: obj.assetUrl || testimonialUrl,
//           testimonialType: testimonialType,
//           attachAudio: finalSrcAudio || '',
//           fileType: fileType,
//           attachVideo: finalSrcVideo || '',
//           avatar: finalSrcAvatar || ''
//         },

export const PLATFORMS = [
   {
    id: 0,
    name: "Globe",
    value: "Globe",
    icon: (
      <GlobeAltIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <GlobeAltIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <GlobeAltIcon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 1,
    name: "Twitter",
    value: "Twitter",
    icon: (
      <RiTwitterLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiTwitterLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiTwitterLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 2,
    name: "LinkedIn",
    value: "LinkedIn",
    icon: (
      <RiLinkedinFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiLinkedinFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiLinkedinFill
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 3,
    name: "Reddit",
    value: "Reddit",
    icon: <RiRedditLine className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <RiRedditLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiRedditLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 4,
    name: "Producthunt",
    value: "Producthunt",
    icon: (
      <RiProductHuntLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiProductHuntLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiProductHuntLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 5,
    name: "Medium",
    value: "Medium",
    icon: <RiMediumLine className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <RiMediumLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiMediumLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 6,
    name: "Hacker News",
    value: "Hacker News",
    icon: <DiHackernews className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <DiHackernews className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <DiHackernews
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 7,
    name: "Github",
    value: "Github",
    icon: <RiGithubLine className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <RiGithubLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiGithubLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 8,
    name: "Tiktok",
    value: "Tiktok",
    icon: (
      <img
        src="/icons/tiktok.svg"
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src="/icons/tiktok.svg"
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src="/icons/tiktok.svg"
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 9,
    name: "Instagram",
    value: "Instagram",
    icon: (
      <RiInstagramLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiInstagramLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiInstagramLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 10,
    name: "YouTube",
    value: "YouTube",
    icon: (
      <RiYoutubeLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiYoutubeLine className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiYoutubeLine
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 11,
    name: "Quora",
    value: "Quora",
    icon: <FaQuora className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaQuora className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaQuora
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 12,
    name: "PlayStore",
    value: "PlayStore",
    icon: (
      <IoLogoGooglePlaystore
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <IoLogoGooglePlaystore
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <IoLogoGooglePlaystore
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 13,
    name: "AppStore",
    value: "AppStore",
    icon: <FaAppStore className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaAppStore className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaAppStore
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 14,
    name: "G2",
    value: "G2",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/g2.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/g2.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/g2.png`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 15,
    name: "Pinterest",
    value: "Pinterest",
    icon: (
      <RiPinterestFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <RiPinterestFill className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <RiPinterestFill
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 16,
    name: "Capterra",
    value: "Capterra",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/capterra.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/capterra.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/capterra.png`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 17,
    name: "Trustpilot",
    value: "Trustpilot",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/trustpilot.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/trustpilot.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/trustpilot.png`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 18,
    name: "Google",
    value: "Google",
    icon: <BsGoogle className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <BsGoogle className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <BsGoogle
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 19,
    name: "ProductHunt",
    value: "ProductHunt",
    icon: (
      <FaProductHunt className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectOptionIcon: (
      <FaProductHunt className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaProductHunt
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 20,
    name: "AppSumo",
    value: "AppSumo",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/app_sumo.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/app_sumo.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/app_sumo.png`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 21,
    name: "Goodreads",
    value: "Goodreads",
    icon: <FaGoodreads className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaGoodreads className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaGoodreads
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 22,
    name: "TripAdvisor",
    value: "TripAdvisor",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/tripadvisor.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectOptionIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/tripadvisor.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
      />
    ),
    selectedIcon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/tripadvisor.png`}
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 23,
    name: "AppStore",
    value: "AppStore",
    icon: <BsApple className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <BsApple className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <BsApple
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 24,
    name: "Yelp",
    value: "Yelp",
    icon: <FaYelp className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaYelp className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaYelp
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 25,
    name: "Shopify",
    value: "Shopify",
    icon: <FaShopify className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaShopify className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaShopify
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 26,
    name: "Amazon",
    value: "Amazon",
    icon: <FaAmazon className="h-4 w-4 text-gray-500" aria-hidden="true" />,
    selectOptionIcon: (
      <FaAmazon className="h-4 w-4 text-gray-500" aria-hidden="true" />
    ),
    selectedIcon: (
      <FaAmazon
        className="pointer-events-none absolute top-[10px] left-2 h-4 w-4 text-gray-400"
        aria-hidden="true"
      />
    ),
  },
   {
    id: 27,
    name: "Curateit",
    value: "Curateit",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/logo192.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
        alt="Curateit"
      />
    ),
    selectOptionIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/logo192.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
        alt="Curateit"
      />
    ),
    selectedIcon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/logo192.png`}
        className="h-4 w-4 text-gray-500"
        aria-hidden="true"
        alt="Curateit"
      />
    ),
  },
];

export const PLATFORMS_ICON = [
  {
    id: 0,
    name: "Globe",
    value: "Globe",
    icon: (
      <GlobeAltIcon className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 1,
    name: "Twitter",
    value: "Twitter",
    icon: (
      <RiTwitterXFill className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 2,
    name: "LinkedIn",
    value: "LinkedIn",
    icon: (
      <RiLinkedinFill className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 3,
    name: "Reddit",
    value: "Reddit",
    icon: <RiRedditLine className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 4,
    name: "Producthunt",
    value: "Producthunt",
    icon: (
      <RiProductHuntLine className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 5,
    name: "Medium",
    value: "Medium",
    icon: <RiMediumLine className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 6,
    name: "Hacker News",
    value: "Hacker News",
    icon: <DiHackernews className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 7,
    name: "Github",
    value: "Github",
    icon: <RiGithubLine className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 8,
    name: "Tiktok",
    value: "Tiktok",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/icons/tiktok.svg`}
        className="h-5 w-5 text-white"
        aria-hidden="true"
        alt="titok"
      />
    ),
  },
  {
    id: 9,
    name: "Instagram",
    value: "Instagram",
    icon: (
      <RiInstagramLine className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 10,
    name: "YouTube",
    value: "YouTube",
    icon: (
      <RiYoutubeLine className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 11,
    name: "Quora",
    value: "Quora",
    icon: <FaQuora className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 12,
    name: "PlayStore",
    value: "PlayStore",
    icon: (
      <IoLogoGooglePlaystore
        className="h-5 w-5 text-white"
        aria-hidden="true"
      />
    ),
  },
  {
    id: 13,
    name: "AppStore",
    value: "AppStore",
    icon: <FaAppStore className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 14,
    name: "G2",
    value: "G2",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/g2.png`}
        className="h-5 w-5 text-white"
        aria-hidden="true"
        alt="G2"
      />
    ),
  },
  {
    id: 15,
    name: "Capterra",
    value: "Capterra",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/capterra.png`}
        className="h-5 w-5 text-white"
        aria-hidden="true"
        alt="Capterra"
      />
    ),
  },
  {
    id: 16,
    name: "Trustpilot",
    value: "Trustpilot",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/trustpilot.png`}
        className="h-5 w-5 text-white"
        aria-hidden="true"
        alt="Trustpilot"
      />
    ),
  },
  {
    id: 17,
    name: "Google",
    value: "Google",
    icon: <BsGoogle className="h-5 w-5 text-white" aria-hidden="true" />,
    
  },
  {
    id: 18,
    name: "ProductHunt",
    value: "ProductHunt",
    icon: (
      <FaProductHunt className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 19,
    name: "AppSumo",
    value: "AppSumo",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/app_sumo.png`}
        className="h-5 w-5 text-white"
        aria-hidden="true"
        alt="AppSumo"
      />
    ),
  },
  {
    id: 20,
    name: "Goodreads",
    value: "Goodreads",
    icon: <FaGoodreads className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 21,
    name: "TripAdvisor",
    value: "TripAdvisor",
    icon: (
      <img
        src={`https://curateit-static-files.s3.amazonaws.com/webapp/tripadvisor.png`}
        className="h-5 w-5 text-white"
        aria-hidden="true"
        alt="TripAdvisor"
      />
    ),
  },
  {
    id: 22,
    name: "Yelp",
    value: "Yelp",
    icon: <FaYelp className="h-5 w-5 text-white" aria-hidden="true" />,

  },
  {
    id: 23,
    name: "Shopify",
    value: "Shopify",
    icon: <FaShopify className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 24,
    name: "Amazon",
    value: "Amazon",
    icon: <FaAmazon className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 25,
    name: "Threads",
    value: "Threads",
    icon: (
      <RiThreadsFill className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 26,
    name: "Facebook",
    value: "Facebook",
    icon: (
      <RiFacebookLine className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 27,
    name: "Snapchat",
    value: "Snapchat",
    icon: (
      <RiSnapchatFill className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 28,
    name: "Gitlab",
    value: "Gitlab",
    icon: <RiGitlabFill className="h-5 w-5 text-white" aria-hidden="true" />,
  },
  {
    id: 29,
    name: "Mastodon",
    value: "Mastodon",
    icon: (
      <RiMastodonFill className="h-5 w-5 text-white" aria-hidden="true" />
    ),
  },
  {
    id: 30,
    name: "Curateit",
    value: "Curateit",
    icon: (
      <img
        src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/logo192.png`}
        className="h-5 w-5 text-white"
        aria-hidden="true"
        alt="titok"
      />
    ),
  },
];

const TestimonialsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentGem = useSelector((state) => state.gem.currentGem);
  // const [showTweetType, setShowTweetType] = useState(false);
  const [showPlatform, setShowPlatform] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(
    currentGem && currentGem?.media?.platform
      ? PLATFORMS.filter((t) => t.value == currentGem?.media?.platform)[0]
      : PLATFORMS[0]
  );
  const [socialObj, setSocialObj] = useState({});
  const [isSocialObj, setIsSocialObj] = useState(true);
  const fileAvatarRef = useRef();

  const [open, setOpen] = useState(false);
    const handleOpen = (flag) => {
        setOpen(flag);
    };

  // inputs
  const highlightRef = useRef();
  const fileRef = useRef(null);
  const [author, setAuthor] = useState((currentGem && currentGem?.media) ? currentGem?.media?.author : '');
  const [tagLine, setTagLine] = useState((currentGem && currentGem?.media) ? currentGem?.media?.tagLine : '');
  const [product, setProduct] = useState((currentGem && currentGem?.media) ? currentGem?.media?.product : '');
  // const [avatar,setAvatar] = useState('')
  const [testimonial, setTestimonial] = useState((currentGem && currentGem?.media) ? currentGem?.media?.testimonial : '');
  const [attachImage, setAttachImage] = useState((currentGem && currentGem?.media) ? currentGem?.media?.attachImage : '')
  const [url, setUrl] = useState((currentGem && currentGem?.media) ? currentGem?.media?.url : '');
  const [date, setDate] = useState((currentGem && currentGem?.media) ? currentGem?.media?.date : '');
  const [rating, setRating] = useState((currentGem && currentGem?.media) ? currentGem?.media?.rating : '');
  const [showImageLoader, setShowImageLoader] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null)
  const [testimonialIcon, setTestimonialIcon] = useState((currentGem && currentGem?.metaData) ? currentGem?.metaData?.testimonialIcon : '');
  const sharedCollections             = useSelector((state) => state.collection.sharedCollections)

    const [testimonialType, setTestimonialType] = useState((currentGem && currentGem?.media) ? currentGem?.media?.testimonialType : 'image');
    const [testimonialAttachVideo, setTestimonialAttachVideo] = useState((currentGem && currentGem?.media) ? currentGem?.media?.attachVideo : '')
    const [testimonialAttachAudio, setTestimonialAttachAudio] = useState((currentGem && currentGem?.media) ? currentGem?.media?.attachAudio : '')
    const [testimonialAvatar, setTestimonialAvatar] = useState((currentGem && currentGem?.media) ? currentGem?.media?.avatar : '')
    const [testimonialAttachImage, setTestimonialAttachImage] = useState((currentGem && currentGem?.media) ? currentGem?.media?.attachImage : '')

    //for avatar img
    const [testimonialAvatarImage, setTestimonialAvatarImage] = useState('');
    const [testimonialAvatarImageSrc, setTestimonialAvatarImageSrc] = useState('');
    const [showShortEndInput, setShowShortEndInput]     = useState(false)
  const [showAssetUrlInput, setShowAssetUrlInput]     = useState(false)
  const [favorite, setFavorite] = useState(currentGem ? currentGem.is_favourite : false);
  const [fileType, setFileType] = useState(currentGem && currentGem?.media?.fileType ? currentGem?.media?.fileType : "url")
  const [audioFile, setAudioFile] = useState(null)
    const [videoFile, setVideoFile] = useState(null)
    const [imageFile, setImageFile] = useState(null)
    const [audioSrc, setAudioSrc]       = useState("")
    const [videoSrc, setVideoSrc]       = useState("")
    const [fetching, setFetching]       = useState(false)
    const [dataFetched, setDataFetched]       = useState(false)

    // audio type state
  const [audioRecordSrc, setAudioRecordSrc] = useState(currentGem && currentGem?.media?.attachAudio ? currentGem?.media?.attachAudio : "");
  const [audioOriginalText, setAudioOriginalText] = useState(currentGem?.title || "");
  const [html,setHtml] = useState(currentGem && currentGem?.media?.html ? currentGem?.media?.html : null)
  const [imageUrl, setImageUrl] = useState(currentGem && currentGem.metaData?.covers && currentGem.metaData?.covers?.length > 0 ? currentGem.metaData?.covers[0] : (currentGem?.media && currentGem.media?.covers && currentGem.media?.covers?.length > 0) ? currentGem.media?.covers[0] :'')

    const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])

  useEffect(() => {
    const fetchStorageData = () => {
      window.chrome.storage.local.get(["twitterObj", "socialObject"], (data) => {
        if (data?.twitterObj?.tweet) {
          setSocialObj(data?.twitterObj?.tweet);
          window.chrome.storage.local.remove("twitterObj");
        } else if (data?.socialObject?.post) {
          const postImgURL = data?.socialObject?.post?.socialfeed_obj?.coverImg
          const profileURL = data?.socialObject?.post?.socialfeed_obj?.profileImg
          setSocialObj(data?.socialObject?.post);
          setTagLine(data?.socialObject?.post?.title);
          setTestimonial(data?.socialObject?.post?.description);
          setUrl(data?.socialObject?.post?.url);
          setAuthor(data?.socialObject?.post?.author);
          setProduct(data?.socialObject?.post?.product);
          setRating(data?.socialObject?.post?.rating);
          setDate(data?.socialObject?.post?.dateAdded);
          setTestimonialIcon(data?.socialObject?.post?.testimonialIcon);
          setAttachImage(data?.socialObject?.post?.socialfeed_obj?.coverImg)
          setTestimonialType(postImgURL ? 'image' : "")
          setImageUrl(postImgURL ? postImgURL : '')
          setTestimonialAttachImage(postImgURL ? postImgURL : '')
          setFileType("url")
          setSelectedPlatform(
            PLATFORMS.filter(
              (platform) => platform.value === data?.socialObject?.post.platform
            )[0]
          );
          if (Array.isArray(data?.socialObject?.post?.media?.covers) && data?.socialObject?.post?.media?.covers.length > 0) {
                setTestimonialAvatar(profileURL || data?.socialObject?.post?.media?.covers[0])
              }
          window.chrome.storage.local.remove("socialObject");
        }
      });
    };
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("refreshed") === "true") {
      fetchStorageData();
    }
  }, [location]);

  const onSubmitBookmark = async (obj) => {
    // let finalSrc;
    // if (selectedFile) {
    //   const formData = new FormData();
    //   formData.append("files", selectedFile);
    //   const imgRes = await dispatch(uploadScreenshots(formData));
    //   if (imgRes.error === undefined && imgRes.payload?.error === undefined) {
    //     const { data } = imgRes.payload;
    //     if (data && data.length !== 0) {
    //       const src = data[0];
    //       finalSrc = src;
    //       setAttachImage(src);
    //     }
    //   }
    // }
    let finalSrcAvatar;
        if(testimonialAvatarImage){
          const formData = new FormData();
            formData.append("files", testimonialAvatarImage);
            const imgRes = await dispatch(uploadScreenshots(formData));
            if (imgRes.error === undefined && imgRes.payload?.error === undefined) {
              const { data } = imgRes.payload;
              if (data && data.length !== 0) {
                const src = data[0];
                finalSrcAvatar = src;
                setTestimonialAvatarImageSrc(src);
                setTestimonialAvatar(src)
              }
            }
        }
    const mediaCovers = currentGem?.metaData?.covers
      ? [obj.imageUrl, ...currentGem?.metaData?.covers]
      : obj.covers && obj.covers.length !== 0
      ? obj.covers
      : [obj.imageUrl];
    const finalCovers = removeDuplicates(mediaCovers);
    let finalObj = {
      title: tagLine ? tagLine : obj.heading,
      description: testimonial ? testimonial : obj.description,
      // expander: obj.shortUrlObj,
      media_type:
        typeof obj.selectedType === "object"
          ? obj.selectedType?.name
          : obj.selectedType,
      author: session.userId ? parseInt(session.userId) : null,
      url: obj.assetUrl,
      media: {
        covers: finalCovers,
        tagLine,
        author,
        testimonial,
        rating,
        url,
        date,
        product,
        platform: selectedPlatform?.value,
        avatar: finalSrcAvatar || testimonialAvatar || '',
        attachImage: testimonialAttachImage || '',
        attachAudio: testimonialAttachAudio || '',
        fileType: currentGem?.media?.fileType || fileType,
        attachVideo: testimonialAttachVideo || '',
        testimonialType: testimonialType,
        html: html
      },
      metaData: {
        type:
          typeof obj.selectedType === "object"
            ? obj.selectedType?.name
            : obj.selectedType,
        title: obj.heading,
        icon: obj?.favIconImage || "",
        defaultIcon: obj?.defaultFavIconImage || '',
        url: obj.assetUrl,
        testimonialIcon: testimonialIcon || "",
        covers: attachImage ? [attachImage] : finalCovers,
        docImages: obj.docImages,
        defaultThumbnail: obj?.defaultThumbnailImg || null,
      },
      platform: selectedPlatform?.value
        ? selectedPlatform?.value
        : socialObj?.platform,
      // post_type: selectedTweet?.value ? selectedTweet?.value : obj.post_type,
      // socialfeed_obj: socialObj?.socialfeed_obj || obj?.socialfeed_obj,
      collection_gems: obj.selectedCollection.id,
      remarks: obj.remarks,
      tags: obj.selectedTags?.map((t) => {
        return t.id;
      }),
      is_favourite: favorite || obj.favorite,
      showThumbnail: obj?.showThumbnail,
      fileType: currentGem?.media?.fileType || fileType,
    };
    setProcessing(true);
    let isSingleBkShared = null
    let isSelectedCollectionShared = null
    let isCurrentCollectionShared = null

    if (currentGem) {
      isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem.id)
      isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
      isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)
      if(isSingleBkShared && !isSelectedCollectionShared){
          setProcessing(false)
          message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT)
          return;
      }

      if(isSelectedCollectionShared){
        finalObj ={
          ...finalObj,
          author: isSelectedCollectionShared?.data?.author?.id
        }
      }

      const isCollectionChanged =
      currentGem?.parent.id !== obj.selectedCollection.id;
      const o = {
        ...finalObj,
        tags: obj.selectedTags,
      };
      if (isCollectionChanged) {
        o["collection_id"] = obj.selectedCollection.id;
        o["collection_gems"] = obj.selectedCollection;
      }
      await dispatch(updateGem(currentGem?.id, { data: finalObj }));
      if(isSelectedCollectionShared){
        dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '',isCurrentCollectionShared))
        dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : finalObj))
        setProcessing(false)
        return navigate("/search-bookmark")
      }
      dispatch(
        updateBookmarkWithExistingCollection(
          currentGem ? { ...currentGem, ...o } : finalObj,
          obj.selectedCollection,
          isCollectionChanged,
          "update",
          currentGem?.parent
        )
      );
      setProcessing(false);
      setAttachImage('')
      return navigate("/search-bookmark");
    }

    let finalSrc;
    let finalSrcAudio;
    let finalSrcVideo;

    if(testimonialType === 'image') {
          if (imageFile && fileType === 'file') {
            const formData = new FormData();
            formData.append("files", imageFile);
            const imgRes = await dispatch(uploadScreenshots(formData));
            if (imgRes.error === undefined && imgRes.payload?.error === undefined) {
              const { data } = imgRes.payload;
              if (data && data.length !== 0) {
                const src = data[0];
                finalSrc = src;
                setAttachImage(src)
              }
            }
          }

          if(fileType === 'url'){
            finalSrc = attachImage
          }
        }

        if(testimonialType === 'audio'){
          if(fileType === 'file'){
            const formData = new FormData();
            formData.append("file", audioFile);
            const imgRes = await dispatch(uploadAllTypeFileInS3(formData));
            if (imgRes.error === undefined) {
              const { data } = imgRes.payload;
              finalSrcAudio = data || ''
            }
          }

          if(fileType === 'record'){
            const formData = new FormData();
            formData.append("file", audioRecordSrc);
            const imgRes = await dispatch(uploadAllTypeFileInS3(formData));
            if (imgRes.error === undefined) {
              const { data } = imgRes.payload;
              finalSrcAudio = data || ''
            }
          }

          if(fileType === 'url'){
            finalSrcAudio = url
          }
        }

        if(testimonialType === 'video'){
          if(fileType === 'file'){
            const formData = new FormData();
            formData.append("file", videoFile);
            const imgRes = await dispatch(uploadAllTypeFileInS3(formData));
            if (imgRes.error === undefined) {
              const { data } = imgRes.payload;
              finalSrcVideo = data || ''
            }
          }

          if(fileType === 'url'){
            finalSrcVideo = url
          }
        }

    finalObj={
      ...finalObj,
      media: {
        ...finalObj?.media,
        attachImage: finalSrc || '',
        attachAudio: finalSrcAudio || '',
        fileType: fileType,
        attachVideo: finalSrcVideo || '',
        testimonialType: testimonialType,
        html: html
      }
    }
    isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
                finalObj ={
                    ...finalObj,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
        }
    const gemRes = await dispatch(addGem({ data: finalObj }));
    if (gemRes.error === undefined && gemRes.payload.error === undefined) {
      const { data } = gemRes.payload;
      if (data.data) {
        const d = data.data;
        const g = {
          ...d,
          id: d.id,
          title: d.title,
          media: d.media,
          media_type: d.media_type,
          url: d.url,
          remarks: d.remarks,
          metaData: d.metaData,
          post_type: d.post_type,
          platfrom: d.platfrom,
          description: d.description,
          S3_link: d.S3_link,
          is_favourite: d.is_favourite,
          collection_id: obj.selectedCollection.id,
          tags: obj.selectedTags,
          socialfeed_obj: d?.socialfeed_obj,
          showThumbnail: d?.showThumbnail,
        };
        if(isSelectedCollectionShared){
          dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
          setProcessing(false)
          return navigate("/search-bookmark")
        }
        dispatch(
          updateBookmarkWithExistingCollection(
            g,
            obj.selectedCollection,
            false,
            "add",
            null
          )
        );
      }
    }
    setAttachImage('')
    setProcessing(false);
    return navigate("/search-bookmark");
  };

  const onPlatformChange = (e) => {
    setSelectedPlatform(
      PLATFORMS.filter((platform) => platform.value === e)[0]
    );
    setShowPlatform(false);
    setOpen(false)
  };

  const onHighlightBlur = () => {
    if (highlightRef) {
      setTestimonial(highlightRef.current.innerText);
    }
  };
  const onFileChange = (e) => {
    const { files } = e.target;
    const file = files[0];
    const fileSize = file.size / 1024 / 1024; 
    if (fileSize > 25) {
      message.error("File size must be less than 25MB");
      // setSelectedFile(null);
      return;
    }
    // const url = URL.createObjectURL(file);
    // setSelectedFile(file);
    // setAttachImage(url);
    // URL.revokeObjectURL(file);
    if(testimonialType === 'image'){
        const url = URL.createObjectURL(file)
        setImageFile(file)
        setAttachImage(url)
        URL.revokeObjectURL(file)
        return;
        }
        if(testimonialType === 'audio'){
        setAudioFile(file)
        setAudioSrc(URL.createObjectURL(file))
        return;
        }
        if(testimonialType === 'video'){
        setVideoFile(file)
        setVideoSrc(URL.createObjectURL(file))
        return;
        }
  };
  const onUploadFileClick = () => {
    if (fileRef) {
      fileRef.current.click();
    }
  };
  const onImageLoadCompleted = () => {
    setShowImageLoader(false);
  };

  const renderFileUpload = () => {
    return (
      <>
        <input
            type={"file"}
            className={"hidden"}
            onChange={onFileChange}
            ref={fileRef}
            accept={testimonialType === 'image'? "image/*" : testimonialType === 'audio' ? 'audio/*' : 'video/*'}
          />
      </>
    );
  };

  const dropdownnRender = () => {
    return(
      <ComboBoxSelect
              inputShown={showPlatform}
                hideInput={(e) => setShowPlatform(e)}
                tweetData={PLATFORMS}
                onTweetChange={onPlatformChange}
                selectedTweet={selectedPlatform}
                error={false}
            />
    )
  }

  const onUploadFileTestimonialAvatarClick = () => {
      if (fileAvatarRef) {
        fileAvatarRef.current.click();
      }
  };

  const renderFileTestimonialAvatarUpload = () => {
      return (<>
          <input
            type={"file"}
            className={"hidden"}
            onChange={onFileTestimonialAvatarChange}
            ref={fileAvatarRef}
            accept="image/*"
          />
        </>)
  };

  const onFileTestimonialAvatarChange = async (e) => {
        const { files } = e.target
        const file = files[0]
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        if (fileSize > 25) {
            message.error('File size must be less than 25MB');
            setTestimonialAvatarImage(null)
            return
        }
        
        const url = URL.createObjectURL(file)
        setTestimonialAvatarImage(file)
        setTestimonialAvatarImageSrc(url)
        URL.revokeObjectURL(file)
        setTestimonialAvatar('')
        return;
  }

  const setCodeReset = () => {
        setTestimonial('')
        setAttachImage('')
        setAuthor('')
        setTagLine('')
        setProduct('')
        setUrl('')
        setRating('')
        setDate('')
        setTestimonialType('')
        setTestimonialAttachVideo('')
        setTestimonialAttachAudio('')
        setTestimonialAvatar('')
        setTestimonialAvatarImage('')
        setTestimonialAvatarImageSrc('')
        setAudioFile('')
        setAudioRecordSrc('')
        setAudioSrc('')
        setAudioOriginalText('')
        setImageFile('')
        setVideoFile('')
        setVideoSrc('')
        setFileType('')
        setSelectedPlatform('')
        setHtml('')
    }

    const handleUpdateInformation = (obj) => {
      setAttachImage(obj?.imageUrl)
    }

    const handleRefreshData = () => {
      setTagLine(socialObj?.title);
          setTestimonial(socialObj?.description);
          setUrl(socialObj?.url);
          setAuthor(socialObj?.author);
          setProduct(socialObj?.product);
          setRating(socialObj?.rating);
          setDate(socialObj?.dateAdded);
          setTestimonialIcon(socialObj?.testimonialIcon);
          setSelectedPlatform(
            PLATFORMS.filter(
              (platform) => platform.value === socialObj?.platform
            )[0]
          );
          if (Array.isArray(socialObj?.media?.covers) && socialObj?.media?.covers.length > 0) {
                setTestimonialAvatar(socialObj?.media?.covers[0])
              }
    }

    const handleChangeAssetUrl = (e) => {
    const {value} = e.target;
    setUrl(value)
    // if(selectedType?.name === 'Testimonial'){
    //   const obj = {
    //     type: 'url',
    //     value: value
    //   }
    //   getUpdateTestimonialInformation && getUpdateTestimonialInformation(obj)
    // }
  };

  const onKeyDownUrl = async(event) => {
    if (event.key === "Enter") {
      if (!url) return;
      const urlVal = normalizeUrl(url)
      setUrl(urlVal)
      if(Validator.validate('url',urlVal,true)){
      message.error(Validator.validate('url',urlVal,true))
      setCodeReset()
      return;
    }
    setFetching(true)
    const res = await readHtmlDocument(url)
    if (res) {
      setAttachImage(res.images.length !== 0 ? res.images[0] : "")
    }

    if((testimonialType === 'audio' && fileType === 'url') || (testimonialType === 'video' && fileType === 'url') || (testimonialType === 'image' && fileType === 'url')){
      const link     = encodeURIComponent(urlVal);
      const res = await dispatch(getBookmarkDetailsMicrolink(link))
      if(res?.payload?.data?.data?.iframely || (res?.payload?.data?.data?.microlink && res?.payload?.data?.data?.microlink?.status === 'success')){
        setHtml(res?.payload?.data?.data?.iframely?.html || null)
        const {links} = res?.payload?.data?.data?.iframely
        const imgData = (links?.thumbnail && links?.thumbnail?.length>0) ? links?.thumbnail[0]?.href :
                    (links?.icon && links?.icon?.length>0) ? links?.icon[0]?.href : ''
        const data  = res?.payload?.data?.data?.microlink && res?.payload?.data?.data?.microlink?.data;
        setAttachImage(imgData || data?.image?.url || '')
      }
    }

    setFetching(false)
    setDataFetched(true)
    setShowAssetUrlInput(false)
    }

  };

  const onAssetURLBlur = async () => {
    if (!url) return;
      const urlVal = normalizeUrl(url)
      setUrl(urlVal)
      if(Validator.validate('url',urlVal,true)){
      message.error(Validator.validate('url',urlVal,true))
      setCodeReset()
      return;
    }
    setFetching(true)
    const res = await readHtmlDocument(url)
    if (res) {
      setAttachImage(res.images.length !== 0 ? res.images[0] : "")
    }

    if((testimonialType === 'audio' && fileType === 'url') || (testimonialType === 'video' && fileType === 'url') || (testimonialType === 'image' && fileType === 'url')){
      const link     = encodeURIComponent(urlVal);
      const res = await dispatch(getBookmarkDetailsMicrolink(link))
      if(res?.payload?.data?.data?.iframely || (res?.payload?.data?.data?.microlink && res?.payload?.data?.data?.microlink?.status === 'success')){
        setHtml(res?.payload?.data?.data?.iframely?.html || null)
        const {links} = res?.payload?.data?.data?.iframely
        const imgData = (links?.thumbnail && links?.thumbnail?.length>0) ? links?.thumbnail[0]?.href :
                    (links?.icon && links?.icon?.length>0) ? links?.icon[0]?.href : ''
        const data  = res?.payload?.data?.data?.microlink && res?.payload?.data?.data?.microlink?.data;
        setAttachImage(imgData || data?.image?.url || '')
      }
    }

    setFetching(false)
    setDataFetched(true)
    setShowAssetUrlInput(false)
  }

  return (
    <OperationLayout
      currentGem={currentGem}
      processing={processing}
      onButtonClick={onSubmitBookmark}
      pageTitle={currentGem ? "Update feed" : "Add new feed"}
      isHideBackButton={false}
      isMenuItemEnabled={false}
      isScreenshotAdd={true}
      isFavouriteEnable={true}
      isAssetURLChangeable={currentGem ? false : true}
      onPanelClose={panelClose}
      mediaType={"Testimonial"}
      socialObj={socialObj}
      setResetData = {setCodeReset}
      getUpdateTestimonialInformation = {handleUpdateInformation}
      onOpenDialog={(parentFunc) => { openImg = parentFunc}}
      getUpdateInformation = {handleUpdateInformation}
      getRefreshData={handleRefreshData}
    >
      {/* <div className="pt-4">
        <h6 className="block text-xs font-medium text-gray-500 mb-1">URL</h6>
        <Input
          size="medium w-full mb-2"
          type="text"
          name="url"
          placeholder="Enter url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div> */}

      {/* <div className="pt-4">
        <h6 className="block text-xs font-medium text-gray-500 mb-1">Author</h6>
        <Input
          size="medium w-full mb-2"
          type="text"
          name="author"
          placeholder="Enter author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </div>
      <div className="pt-4">
        <h6 className="block text-xs font-medium text-gray-500 mb-1">
          Tag line
        </h6>
        <Input
          size="medium w-full mb-2"
          type="text"
          name="tagLine"
          placeholder="Enter tag line"
          value={tagLine}
          onChange={(e) => setTagLine(e.target.value)}
        />
      </div>
      <div className="pt-4">
        <h6 className="block text-xs font-medium text-gray-500 mb-1">
          Testimonial
        </h6>
        <div
          style={{ height: "300px", overflowY: "auto" }}
          contentEditable={!currentGem}
          ref={highlightRef}
          onBlur={onHighlightBlur}
          className={
            "flex-1 text-sm border-2 border-[#e5e7eb] p-2 outline-none w-full"
          }
        >
          {testimonial}
        </div>
      </div>

      <div className="pt-4">
        <h6 className="block text-xs font-medium text-gray-500 mb-1">
          Product
        </h6>
        <Input
          size="medium w-full mb-2"
          type="text"
          name="product"
          placeholder="Enter product"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
        />
      </div>

      <div className="pt-4">
        <div className="flex-1">
          <h6 className="block text-xs font-medium text-gray-500 mb-1">
            Platform
          </h6>
          <div className="ct-relative">
            <div className="w-full">
              <ComboBoxSelect
                inputShown={showPlatform}
                hideInput={(e) => setShowPlatform(e)}
                tweetData={PLATFORMS}
                onTweetChange={onPlatformChange}
                selectedTweet={selectedPlatform}
                error={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 star-rating">
        <h6 className="block text-xs font-medium text-gray-500 mb-1">Rating</h6>
        <Rate value={rating} onChange={(value) => setRating(value)} allowHalf />
      </div>

      <div className="pt-4">
        <h6 className="block text-xs font-medium text-gray-500 mb-1">Date</h6>
        <Input
          size="medium w-full mb-2"
          type="text"
          name="product"
          placeholder="Enter date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="pt-4">
        <div className="image-header">
          <h6 className="block text-xs font-medium text-gray-500 mb-1">
            Attach Image
          </h6>
        </div>
        <div className="bg-[#F8FBFF] rounded-t-[16px] imgWrapperContainer">
          <div>
            {showImageLoader && (
              <Spin spinning={showImageLoader} tip="Loading Image" />
            )}
            {!attachImage ? (
              renderFileUpload()
            ) : (
              <img
                src={attachImage ? attachImage : ""}
                alt=""
                onLoad={onImageLoadCompleted}
                style={{
                  display: showImageLoader ? "none" : "block",
                }}
              />
            )}
          </div>
        </div>
      </div> */}

      {fetching && 
                <div className="pt-4 flex w-full items-center justify-center">
                    <Spin tip="Fetching data" />
                </div>
        }

      {
      !fetching &&
      <>  
            <div>

          <div className="mb-4">
            <div className="flex items-center justify-between">

            {
            (testimonialAvatar || testimonialAvatarImageSrc) ?
            <div className="cursor-pointer relative border border-solid border-[#97A0B5] rounded-full mr-2 w-fit text-start flex items-center justify-center p-[6px] w-[55px] h-[50px]" onClick={e => {
              e.stopPropagation()
              onUploadFileTestimonialAvatarClick()
            }}
            style={{
              backgroundImage: `url(${testimonialAvatar || testimonialAvatarImageSrc || `${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png` })`,
              backgroundRepeat: "round"
            }}>
              {/* <img className={`w-[30px] h-[30px]  rounded-[3px]`} src={(testimonialAvatar || testimonialAvatarImageSrc)} alt={"Curateit - Curate, Save, Search gems of web, 10x your productivity"} onError={(e) => {
                e.target.onerror = null; 
                e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
              }}/> */}
              {renderFileTestimonialAvatarUpload()}
              <div className='cursor-pointer rounded-full bg-[#347AE2] p-1 absolute right-[-5px] bottom-[-6px]'>
                  <PiPencilSimple className="text-white h-3 w-3 aspect-square"/>
              </div>
            </div>
            :
            <div className="relative" onClick={e => {
              e.stopPropagation()
              onUploadFileTestimonialAvatarClick()
            }}>
              {renderFileTestimonialAvatarUpload()}
              <div className="border border-solid border-[#97A0B5] rounded-full w-fit p-2 cursor-pointer mr-2">
              <AiOutlineUser className="text-[#74778B] h-6 w-6 aspect-square"/>
              </div>
              <div className='cursor-pointer border border-solid border-[#97A0B5] bg-white rounded-full  p-1 absolute right-[3px] bottom-[-5px]'
              >
                  <PiPencilSimple className="h-3 w-3 aspect-square"/>
              </div>
            </div>
            }
            
              <Input
              size="medium w-full"
              type="text"
              name="author"
              placeholder="Enter author name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className='!border-[#97A0B5] w-full rounded-md'
              />
          </div>

          <div className="w-full flex justify-end relative mt-4 ">
            <Dropdown
            trigger={["click"]}
            dropdownRender={() => dropdownnRender()}
            onOpenChange={handleOpen}
            open={open}
            >
              <div style={{background: getColorForProfilePlatform(selectedPlatform?.value || selectedPlatform)}} className="rounded w-7 h-7 flex items-center justify-center cursor-pointer relative">
              {PLATFORMS_ICON.filter(
                (t) => t.value === selectedPlatform?.value || t.name === selectedPlatform?.value
              )[0]?.icon}
              <div className='cursor-pointer rounded-full bg-[#347AE2] p-1 absolute right-[-10px] bottom-[-8px]'>
                <PiPencilSimple className="text-white h-3 w-3 aspect-square"/>
              </div>
              </div>
            </Dropdown>
          </div>
          </div>

         {((!testimonialType && !currentGem) || (!testimonialAttachAudio && !testimonialAttachImage && !testimonialAttachVideo)) && <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  max-md:px-5 px-16`} 
          >
          <>
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setTestimonialType('image')
                        setIsSocialObj(false)
                      }}
                      >
                        <PhotoIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">Image</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        setTestimonialType('audio')
                      }}
                      >
                        <SpeakerWaveIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Audio</div>
                  </div>

                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        setTestimonialType('video')
                      }}
                      >
                        <PlayCircleIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Video</div>
                  </div>
                </div>
          </>  
          </div>}

        {/* comes other options */}

        {
        !currentGem &&
        <>
        {
        testimonialType === 'image' &&
        <>
        {
        (attachImage || dataFetched) && 
        <div className="ct-relative">
                <div className="gradient-add-bookmark-div">
                  <img src={attachImage}
                    alt={tagLine || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
                </div>

                <div className={`md:mx-2 absolute top-[10px] left-2 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setAttachImage('')
                    setDataFetched(false)
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(details?.assetUrl || url ||'', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{url && getDomainFromURLForBookmark(details?.assetUrl || url)}</div>
                    </div>

                    <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                      // setShowShortEndInput(false)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" 
                    onClick={() => openImg("thumbnail")}
                    >
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

        </div>
        }
        {
        (!attachImage && !isSocialObj) &&
          <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        setFileType('url')
                        // handlefileTypeChange('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" 
                      onClick={() => {
                        onUploadFileClick()
                        // handlefileTypeChange('file')
                        setFileType('file')
                      }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={details?.assetUrl || url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }
        </div>
        }
        
        </>
        }

        {
        testimonialType === 'audio' &&
        <>
        {
        (fileType === 'url' && (attachImage || dataFetched)) ? 
        <div className="ct-relative">
                {/* <div className="gradient-add-bookmark-div">
                  <div className="px-1 md:px-2 flex items-center justify-center h-[100px]">
                    <audio src={url} autoPlay={false} controls>
                      <source src={audioSrc} />
                    </audio>
                  </div>
                </div> */}
                <div className="gradient-add-bookmark-div">
                  <img src={attachImage}
                    alt={tagLine || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
                </div>


                <div className={`md:mx-2 absolute top-[10px] left-2 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setAttachImage('')
                    setHtml('')
                    setDataFetched(false)
                    setTestimonialAttachAudio('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(url|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{url && getDomainFromURLForBookmark(url)}</div>
                    </div>

                    <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => openImg("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

        </div>
        :
        (fileType === 'file' && audioSrc) ?
        <div className="ct-relative">
                <div className="px-1 md:px-2 flex items-center justify-center h-[100px]">
                    <audio src={audioSrc} autoPlay={false} controls>
                      <source src={audioSrc} />
                    </audio>
                  </div>

                  <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setAudioSrc('')
                    setAudioFile('')
                    setTestimonialAttachAudio('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2 mt-4">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                </div>

        </div>
        :
        fileType === 'record' ?
        <>
        <div className="ct-relative">
            <TranslatorComponent
            audioRecordSrc={audioRecordSrc}
            setAudioRecordSrc={setAudioRecordSrc}
            showAudioTag={true}
            setAudioOriginalText={setAudioOriginalText}
            audioOriginalText={audioOriginalText}
            // onDownloadAudio={onDownloadAudio}
            showRecorder={!currentGem}
          />

          <div className={`md:mx-2 absolute top-[-30px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setAudioRecordSrc('')
                    setAudioOriginalText('')
                    setTestimonialType('')
                  }}>
              <TrashIcon className="text-red-400 h-4 w-4 " />
          </div>
        </div>
        {/* {
        testimonialAttachAudio &&
        <div className="ct-relative">
                <div className="px-1 md:px-2 flex items-center justify-center h-[100px]">
                    <audio src={testimonialAttachAudio} autoPlay={false} controls>
                      <source src={testimonialAttachAudio} />
                    </audio>
                  </div>

                  <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setAudioRecordSrc('')
                    setAudioOriginalText('')
                    setTestimonialAttachAudio('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2 mt-4">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                </div>

        </div>
        } */}
        </>
        :
        <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        // handlefileTypeChange('url')
                        setFileType('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
                        // handlefileTypeChange('file')
                        setFileType('file')
                        onUploadFileClick()
                      }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>

                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
                        // handlefileTypeChange('record')
                        setFileType('record')
                      }}
                      >
                        <MicrophoneIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Record</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }
        </div>
        }
        </>
        }

        {
        testimonialType === 'video' &&
        <>
        {
        (fileType === 'url' && (attachImage || dataFetched)) ? 
        <div className="relative">
                <div className="gradient-add-bookmark-div">
                  <img src={attachImage}
                    alt={tagLine || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
                </div>

                <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setAttachImage('')
                    setHtml('')
                    setDataFetched(false)
                    setTestimonialAttachVideo('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(url|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{url && getDomainFromURLForBookmark(url)}</div>
                    </div>

                    <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>
                    
                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => openImg("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

        </div>
        :
        (fileType === 'file' && videoSrc ) ?
        <div className="relative">
                <div className="gradient-add-bookmark-div after:h-[15%]">
                  <div className="px-1 md:px-2 flex items-center justify-center">
                    <video autoPlay={false} controls>
                      <source src={videoSrc} />
                    </video>
                  </div>
                </div>

                <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setVideoSrc('')
                    setVideoFile('')
                    setTestimonialAttachVideo('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">

                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => openImg("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

        </div>
        :
        <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        setFileType('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
                        setFileType('file')
                        onUploadFileClick()
                      }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }
        </div>
        }
        </>
        }
        </>
        }


        {
        currentGem &&
        <>
        {
        testimonialType === 'image' &&
        <>
        {
        (currentGem && testimonialAttachImage) && 
        <div className="ct-relative">
                <div className="gradient-add-bookmark-div">
                  <img src={testimonialAttachImage}
                    alt={tagLine || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
                </div>

                <div className={`md:mx-2 absolute top-[10px] left-2 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setTestimonialAttachImage('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(testimonialAttachImage ||'', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{url && getDomainFromURLForBookmark(testimonialAttachImage)}</div>
                    </div>
                  </div>

                </div>

        </div>
        }
        {/* {
        (!attachImage && !isSocialObj) &&
          <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        setFileType('url')
                        // handlefileTypeChange('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" 
                      onClick={() => {
                        onUploadFileClick()
                        // handlefileTypeChange('file')
                        setFileType('file')
                      }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={details?.assetUrl || url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }
        </div>
        } */}
        
        </>
        }

        {
        testimonialType === 'audio' &&
        <>
        {
        (fileType === 'url' && currentGem && testimonialAttachAudio) ? 
        <div className="ct-relative">
                <div className="gradient-add-bookmark-div">
                  <img src={imageUrl}
                    alt={tagLine || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
                </div>


                <div className={`md:mx-2 absolute top-[10px] left-2 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setHtml('')
                    setTestimonialAttachAudio('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(testimonialAttachAudio|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{testimonialAttachAudio && getDomainFromURLForBookmark(testimonialAttachAudio)}</div>
                    </div>

                  </div>

                </div>

        </div>
        :
        (fileType === 'file' && currentGem && testimonialAttachAudio) ?
        <div className="ct-relative">
                <div className="px-1 md:px-2 flex items-center justify-center h-[100px]">
                    <audio src={testimonialAttachAudio} autoPlay={false} controls>
                      <source src={testimonialAttachAudio} />
                    </audio>
                  </div>

                  <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setTestimonialAttachAudio('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2 mt-4">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                </div>

        </div>
        :
        fileType === 'record' ?
        <>
        {
        testimonialAttachAudio &&
        <div className="ct-relative">
                <div className="px-1 md:px-2 flex items-center justify-center h-[100px]">
                    <audio src={testimonialAttachAudio} autoPlay={false} controls>
                      <source src={testimonialAttachAudio} />
                    </audio>
                  </div>

                  <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setAudioRecordSrc('')
                    setAudioOriginalText('')
                    setTestimonialAttachAudio('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2 mt-4">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                </div>

        </div>
        }
        </>
        :
        // <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
        //       >
        //         {
        //         !showAssetUrlInput ?
        //         <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
        //           <div className="flex flex-col">
        //               <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
        //               onClick={(e) => {
        //                 e.stopPropagation()
        //                 setShowAssetUrlInput(true)
        //                 // handlefileTypeChange('url')
        //                 setFileType('url')
        //               }}
        //               >
        //                 <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
        //               </div>
        //               <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
        //           </div>
        //           <div className="flex flex-col">
        //               <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
        //                 // handlefileTypeChange('file')
        //                 setFileType('file')
        //                 onUploadFileClick()
        //               }}
        //               >
        //                 {renderFileUpload()}
        //                 <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
        //               </div>
        //               <div className="mt-2 text-sm text-gray-500">Upload</div>
        //           </div>

        //           <div className="flex flex-col">
        //               <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
        //                 // handlefileTypeChange('record')
        //                 setFileType('record')
        //               }}
        //               >
        //                 <MicrophoneIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
        //               </div>
        //               <div className="mt-2 text-sm text-gray-500">Record</div>
        //           </div>
        //         </div>
        //          :
        //         <div className="flex items-center w-full">
        //           <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
        //             size="large"
        //             type="text" 
        //             name="link" 
        //             value={url}
        //             onChange={handleChangeAssetUrl}
        //             onBlur={onAssetURLBlur}
        //             style={{background:'white'}}
        //             suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
        //             onClick={e => {
        //             e.stopPropagation()
        //             setShowAssetUrlInput(false)
        //           }}/>}
        //           onKeyDown={onKeyDownUrl}
        //           />
        //         </div>
        //         }
        // </div>
        <></>
        }
        </>
        }

        {
        testimonialType === 'video' &&
        <>
        {
        (fileType === 'url' && currentGem && testimonialAttachVideo) ? 
        <div className="relative">
                <div className="gradient-add-bookmark-div">
                  <img src={imageUrl}
                    alt={tagLine || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
                </div>

                <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setHtml('')
                    setTestimonialAttachVideo('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(testimonialAttachVideo|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{testimonialAttachVideo && getDomainFromURLForBookmark(testimonialAttachVideo)}</div>
                    </div>

                  </div>

                </div>

        </div>
        :
        (fileType === 'file' && currentGem && testimonialAttachVideo) ?
        <div className="relative">
                <div className="gradient-add-bookmark-div after:h-[15%]">
                  <div className="px-1 md:px-2 flex items-center justify-center">
                    <video autoPlay={false} controls>
                      <source src={testimonialAttachVideo} />
                    </video>
                  </div>
                </div>

                <div className={`md:mx-2 absolute top-[10px] left-0 border border-solid border-[#97A0B5] rounded-md w-fit p-1 cursor-pointer bg-white`} onClick={e => {
                    e.stopPropagation()
                    setTestimonialAttachVideo('')
                  }}>
                      <TrashIcon className="text-red-400 h-4 w-4 " />
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">

                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => openImg("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

        </div>
        :
        // <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
        //       >
        //         {
        //         !showAssetUrlInput ?
        //         <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
        //           <div className="flex flex-col">
        //               <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
        //               onClick={(e) => {
        //                 e.stopPropagation()
        //                 setShowAssetUrlInput(true)
        //                 setFileType('url')
        //               }}
        //               >
        //                 <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
        //               </div>
        //               <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
        //           </div>
        //           <div className="flex flex-col">
        //               <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
        //                 setFileType('file')
        //                 onUploadFileClick()
        //               }}
        //               >
        //                 {renderFileUpload()}
        //                 <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
        //               </div>
        //               <div className="mt-2 text-sm text-gray-500">Upload</div>
        //           </div>
        //         </div>
        //          :
        //         <div className="flex items-center w-full">
        //           <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
        //             size="large"
        //             type="text" 
        //             name="link" 
        //             value={url}
        //             onChange={handleChangeAssetUrl}
        //             onBlur={onAssetURLBlur}
        //             style={{background:'white'}}
        //             suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
        //             onClick={e => {
        //             e.stopPropagation()
        //             setShowAssetUrlInput(false)
        //           }}/>}
        //           onKeyDown={onKeyDownUrl}
        //           />
        //         </div>
        //         }
        // </div>
        <></>
        }
        </>
        }
        </>
        }
        </div>
      
              <Input
                size="medium w-full"
                type="text"
                name="tagLine"
                placeholder="Enter tag line"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                className='!border-[#97A0B5] w-full rounded-md mt-4'
              />

              <TextareaAutosize
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="Enter testimonial"
                minRows={4}
                className="textarea-border w-full rounded-md resize-none !outline-none !focus:outline-none my-4 !border-[#97A0B5]"
              />

              <Input
                size="medium w-full mb-2"
                type="text"
                name="product"
                placeholder="Enter product"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className='!border-[#97A0B5] w-full rounded-md'
              />

              <div className="flex items-center justify-between mt-4 w-full">
                <Rate value={rating} onChange={(value) => setRating(value)} allowHalf />
                <div className="bookStatus">
                    <DatePicker
                      value={
                        !date ? null : moment(date, "DD-MM-YYYY")
                      }
                      onChange={(date, dateStirng) => setDate(dateStirng)}
                      format={"DD-MM-YYYY"}
                      // allowClear={false}
                      showToday={false}
                      className="rounded-full border border-solid border-[#97A0B5] w-fit "
                    />
                </div>
              </div>
      </>
      }
    </OperationLayout>
  );
};

export default TestimonialsPage;
