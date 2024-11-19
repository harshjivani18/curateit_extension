import Gems from "../containers/gems/Gems";
import AllHighlights from "../containers/page-highlights/AllHighlights";
import { css } from "@codemirror/lang-css";
import { cpp } from "@codemirror/lang-cpp";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { php } from "@codemirror/lang-php";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";

import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { dracula } from "@uiw/codemirror-theme-dracula";

//ICONS
import {
  DiCss3,
  DiCodeBadge,
  DiHtml5,
  DiJavascript1,
  DiJava,
  DiPhp,
  DiPython,
  DiRust,
  DiHackernews,
} from "react-icons/di";
import { VscJson } from "react-icons/vsc";
import { SiImdb, SiMysql, SiSubstack } from "react-icons/si";

import {
  BookmarkIcon,
  InformationCircleIcon,
  ClockIcon,
  PencilIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { getAllISOCodes } from "iso-country-currency";
import { NEW_URL_PATTERN } from "./patterns";
import { RiDiscordFill, RiFacebookLine, RiGithubLine, RiGitlabFill, RiInstagramLine, RiLinkedinFill, RiMastodonFill, RiMediumLine, RiPinterestFill, RiProductHuntLine, RiRedditLine, RiSteamFill, RiTelegramFill, RiThreadsFill, RiTumblrFill, RiTwitchFill, RiTwitterXFill, RiWhatsappFill, RiYoutubeLine,RiTwitterLine, RiSnapchatFill } from "react-icons/ri";
import { PiGoodreadsLogoFill } from "react-icons/pi";
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

//LANGUAGES
export const LANGUAGES = [
  {
    id: 1,
    name: "CSS",
    mode: "css",
    lng: css(),
    iconComponent: <DiCss3 className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 2,
    name: "C++",
    mode: "cpp",
    lng: cpp(),
    iconComponent: <DiCodeBadge className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 3,
    name: "HTML",
    mode: "html",
    lng: html(),
    iconComponent: <DiHtml5 className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 4,
    name: "Java",
    mode: "java",
    lng: java(),
    iconComponent: <DiJava className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 5,
    name: "JavaScript",
    mode: "javascript",
    lng: javascript(),
    iconComponent: <DiJavascript1 className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 6,
    name: "Json",
    mode: "json",
    lng: json(),
    iconComponent: <VscJson className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 7,
    name: "Php",
    mode: "php",
    lng: php(),
    iconComponent: <DiPhp className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 8,
    name: "Python",
    mode: "python",
    lng: python(),
    iconComponent: <DiPython className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 9,
    name: "Rust",
    mode: "rust",
    lng: rust(),
    iconComponent: <DiRust className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
  {
    id: 10,
    name: "Sql",
    mode: "sql",
    lng: sql(),
    iconComponent: <SiMysql className="h-5 w-5 text-white mr-2" />,
    code: "<!--Paste your code here -- >",
  },
];

//THEMES
export const THEMES = [
  {
    id: 1,
    name: "Dark",
    mode: "dark",
    theme: "dark",
  },
  {
    id: 2,
    name: "Light",
    mode: "light",
    theme: "light",
  },
  {
    id: 3,
    name: "Dracula",
    mode: "dracula",
    theme: dracula,
  },
  {
    id: 4,
    name: "Okaidia",
    mode: "okaidia",
    theme: okaidia,
  },
];

export const FONT_FAMILY = [
  {
    id: 1,
    name: "Monospace",
  },
  {
    id: 2,
    name: "Roboto",
  },
  {
    id: 3,
    name: "Nunito Sans",
  },
  {
    id: 4,
    name: "Poppin",
  },
  {
    id: 5,
    name: "Inter",
  },
  {
    id: 6,
    name: "Moon Dance",
  },
];

export const FONT_SIZE = [
  {
    id: 1,
    size: 16,
    name: "16",
  },
  {
    id: 2,
    size: 18,
    name: "18",
  },
  {
    id: 3,
    size: 22,
    name: "22",
  },
  {
    id: 4,
    size: 26,
    name: "26",
  },
  {
    id: 5,
    size: 30,
    name: "30",
  },
  {
    id: 6,
    size: 32,
    name: "32",
  },
  {
    id: 7,
    size: 34,
    name: "34",
  },
];

export const NOT_AUTHORIZED = 401;
export const UNAUTHORIZED_ACTION_TYPES = [
  "FETCH_LOGIN",
  "FORGOT_PASSWORD",
  "RESET_PASSWORD",
  "SIGNUP",
  "FORGOT",
  "FETCH_URL_DATA",
  "ADD_UPLOAD_FILE",
  "FETCH_URL_SCREENSHOT",
  "GET_ALL_PUBLIC_SIDEBAR_APPS",
];
export const FIELD_REQUIRED = "This field is required.";
export const NO_SPACES = "Spaces are not allowed in Username.";
export const NO_SPECIAL_CHARS = "Username must not have Special Characters.";
export const LESS_THAN_15_CHARS = "Username must be less than 15 Characters.";
export const CONFRIM_MATCH = "Confirm password needs to match password";
export const VALUE_TOO_SHORT = "Given value is too short";
export const VALUE_TOO_LONG = "Given value is too long";
export const EMAIL_NOT_VALID = "Email is not valid";
export const INVALID_VALUE = "Invalid value";
export const INVALID_QUANTITY = "Invalid Quantity";
export const INVALID_QUANTITY_MAX = "Quantity should be less than < 100000";
export const SUCCESS_OK = 200;
export const NO_STATUS_CODE = 0;
export const URL_REQUIRED           = "Please provide url";
export const INVALID_URL            = "Please provide valid url. Ensure it has protocol (https) and hostname (https://www.example.com).";

export const FILE_TYPES = ["image/jpg", "image/jpeg", "image/png"];

export const SETTING_MENU = [
  // {
  //   id: 1,
  //   name: "Setting",
  //   link: "#",
  //   icon: "setting-icon.svg",
  //   alt: "setting icon"

  // },
  // {
  //   id: 2,
  //   name: "Download app",
  //   link: "#",
  //   icon: "file-donwload.svg",
  //   alt: "download icon"
  // },
  // {
  //   id: 3,
  //   name: "Help & Support",
  //   link: "#",
  //   icon: "help-octagon.svg",
  //   alt: "help octagon icon"
  // },
  // {
  //   id: 4,
  //   name: "What's New?",
  //   link: "#",
  //   icon: "bookopen-icon.svg",
  //   alt: "Book open icon"
  // },
  {
    id: 5,
    name: "Report Bug",
    link: "#",
    icon: "bug.svg",
    alt: "Bug icon",
  },
  {
    id: 6,
    name: "Logout",
    link: "#",
    icon: "log-out.svg",
    alt: "logout icon",
  },
];

export const BOOKMARK_SAVE_OPTIONS = [
  {
    id: 1,
    name: "Save tabs",
    link: "/",
    icon: "Tabs-plus-01.svg",
    alt: "setting icon",
  },
  {
    id: 2,
    name: "Upload file",
    link: "#",
    icon: "arrow-up.svg",
    alt: "download icon",
  },
  {
    id: 3,
    name: "Add highlights",
    link: "#",
    icon: "pencil-icon.svg",
    alt: "pencil icon",
  },
];

export const KEY_CODES = {
  comma: 188,
  enter: 13,
};

export const FEEDBACK_TYPES = [
  {
    id: "Feature Request",
    name: "Feature Request",
  },
  {
    id: "Report Bug",
    name: "Report Bug",
  },
  {
    id: "Question",
    name: "Question",
  },
  {
    id: "Appreciate",
    name: "Appreciate",
  },
];

export const IMPORT_FILE_TYPE = ["HTML", "CSV", "TXT"];

export const HIGHLIGHTED_COLORS = [
  {
    id: 1,
    border: "border-l-violet-500",
    bg: "#C1C1FF",
    text: "text-violet-500",
    colorCode: "#C1C1FF",
    className: "violet-hl",
  },
  {
    id: 2,
    border: "border-l-pink-500",
    bg: "#FFAFED",
    text: "text-pink-500",
    colorCode: "#FFAFED",
    className: "pink-hl",
  },
  {
    id: 3,
    border: "border-l-green-300",
    bg: "#D2F9C8",
    text: "text-green-300",
    colorCode: "#D2F9C8",
    className: "green-hl",
  },
  {
    id: 4,
    border: "border-l-yellow-200",
    bg: "#FFFAB3",
    text: "text-yellow-200",
    colorCode: "#FFFAB3",
    className: "yellow-hl",
  },
];

export const MAIN_PAGE_TABS = [
  {
    key: 1,
    label: "Gems",
    children: <Gems />,
  },
  {
    key: 2,
    label: "Highlights",
    children: (
      <div className="p-[15px] pt-0">
        <AllHighlights />
      </div>
    ),
  },
  // {
  //   key: 3,
  //   label: "Comments",
  //   children: "No Comments!"
  // },
  // {
  //   key: 4,
  //   label: "Curateit AI",
  //   children: "Curateit AI"
  // }
];

export const HIGHLIGHT_MENU = [
  {
    id: 1,
    name: "Edit",
    icon: "setting-icon.svg",
    alt: "setting icon",
  },
  {
    id: 2,
    name: "Delete",
    icon: "file-donwload.svg",
    alt: "download icon",
  },
];

export const HIGHLIGHT_TAB_KEY = 2;
export const GEMS_TAB_KEY = 1;

export const PDF_IMG_LINK =
  "https://curateit-static-files.s3.amazonaws.com/images/pdf.png";

export const SIDEBAR_MENU = [
  {
    name: "Bookmark",
    url: "/search-bookmark",
    icon: <BookmarkIcon className="h-5 w-5 cursor-pointer" />,
    imgUrl: "",
    type: "menu",
  },
  {
    name: "Info",
    url: "/info",
    icon: <InformationCircleIcon className="h-5 w-5 cursor-pointer" />,
    imgUrl: "",
    type: "menu",
  },
  {
    icon:  "",
    imgUrl:  "/icons/Tabs-plus-01.svg",
    name: "Tabs Manager",
    type: "menu",
    url:  "/all-save-tabs"
  },
  {
    name: "Highlight",
    url: "/all-highlights",
    icon: <PencilIcon className="h-5 w-5 cursor-pointer" />,
    imgUrl: "",
    type: "menu",
  },
  {
    name: "Read Later",
    url: "/all-article",
    icon: <ClockIcon className="h-5 w-5 cursor-pointer" />,
    imgUrl: "",
    type: "menu",
  },
];

export const DEFAULT_SIDEBAR_ARR = [
  {
    url: "/all-highlights",
    icon: '<PencilIcon className="h-5 w-5 cursor-pointer" />',
    name: "Highlight",
    type: "menu",
    imgUrl: "",
  },
  {
    url: "/all-article",
    icon: '<ClockIcon className="h-5 w-5 cursor-pointer" />',
    name: "Read Later",
    type: "menu",
    imgUrl: "",
  },
  {
    icon:  "",
    imgUrl:  "/icons/Tabs-plus-01.svg",
    name: "Tabs Manager",
    type: "menu",
    url:  "/all-save-tabs"
  },
  {
    url: "/info",
    icon: '<InformationCircleIcon className="h-5 w-5 cursor-pointer" />',
    name: "Info",
    type: "menu",
    imgUrl: "",
  },
  {
    url: "",
    icon: '<BookOpenIcon className="h-5 w-5 cursor-pointer" />',
    name: "Reader view",
    type: "menu",
    imgUrl: "",
  },
  {
    url: "/screenshot-options",
    icon: "",
    name: "Screenshot",
    type: "menu",
    imgUrl: "/icons/screenshot1.svg",
  },
  {
    url: "/all-text-expanders",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 17H17V14.5L20.5 18L17 21.5V19H7V21.5L3.5 18L7 14.5V17ZM13 6V15H11V6H5V4H19V6H13Z"></path></svg>',
    name: "Text Expander",
    type: "menu",
    imgUrl:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 17H17V14.5L20.5 18L17 21.5V19H7V21.5L3.5 18L7 14.5V17ZM13 6V15H11V6H5V4H19V6H13Z"></path></svg>',
  },
];

export const TEXT_MESSAGE = {
  ERROR_TEXT: "Error Occured.Try again",
  ERROR_UPLOAD_LOGO_APP_USER:
    "Error Occured while uploading app logo.Try again",
  SIDEBAR_APP_CREATE_TEXT: "App added to sidebar successfully",
  SIDEBAR_APP_DELETE_TEXT: "App deleted successfully",
  CURATEIT_APP_CREATE_TEXT: "Curateit app added to sidebar successfully",
  CURATEIT_APP_DELETE_TEXT: "Curateit app removed from sidebar successfully",
  SIDEBAR_APP_UPDATE_TEXT: "App updated successfully",
  COLLECTION_CREATE_TEXT: "Collection created successfully",
  COLLECTION_UPDATE_TEXT: "Collection updated successfully",
  COLLECTION_DELETE_TEXT: "Collection deleted successfully",
  SHARED_COLLECTION_GEM_ERROR_TEXT:
    "You cant move shared collection gem to own collection",
  FILE_SIZE_ERROR: "File size must be less than 5MB",
  TOO_MANY_TAB: "Too many tabs to open",
  REMOVE_BLOCKED_DOMAIN_CONFIRMATION: 'Are you sure you want to remove this domain from blocked list',
  SEO_UPDATE: "SEO updated successfully",
};

export const HIGHLIGHT_MEDIA_TYPES = ["Highlight", "Image", "Code"];

export const curateitApps = [
  {
    url: "/all-highlights",
    icon: "",
    name: "Highlight",
    type: "menu",
    imgUrl: "/icons/pencil-icon.svg",
  },
  {
    url: "/all-article",
    icon: '<ClockIcon className="h-5 w-5 cursor-pointer" />',
    name: "Read Later",
    type: "menu",
    imgUrl: "",
  },
  {
    url: "/all-save-tabs",
    icon: "",
    name: "Tabs Manager",
    type: "menu",
    imgUrl: "/icons/Tabs-plus-01.svg",
  },
  {
    url: "/info",
    icon: '<InformationCircleIcon className="h-5 w-5 cursor-pointer" />',
    name: "Info",
    type: "menu",
    imgUrl: "",
  },
  {
    url: "/seo",
    icon: '<InformationCircleIcon className="h-5 w-5 cursor-pointer" />',
    name: "SEO",
    type: "menu",
    imgUrl: "",
  },
  {
    url: "",
    icon: '<BookOpenIcon className="h-5 w-5 cursor-pointer" />',
    name: "Reader view",
    type: "menu",
    imgUrl: "",
  },
  {
    url: "/screenshot-options",
    icon: "",
    name: "Screenshot",
    type: "menu",
    imgUrl: "/icons/screenshot1.svg",
  },
  {
    url: "/all-text-expanders",
    icon: "",
    name: "Text Expander",
    type: "menu",
    imgUrl: "/icons/text-spacing.svg",
  },
  {
    "url": "",
    "icon": "<MoonIcon className='h-6 w-6 text-gray-700' />",
    "name": "Dark/Light mode",
    "type": "menu",
    "imgUrl": ""
  },
  {
    url: "",
    icon: "",
    name: "Save offline",
    type: "menu",
    imgUrl: "/icons/file-download.png",
  },

  // {
  //   url: "/seo",
  //   icon: '<DocumentMagnifyingGlassIcon className="h-5 w-5 cursor-pointer" />',
  //   name: "Seo",
  //   type: "menu",
  //   imgUrl: "",
  // },
  // {
  //   url: "/flashcards",
  //   icon: "",
  //   name: "Flashcards",
  //   type: "menu",
  //   imgUrl:
  //     "https://d3jrelxj5ogq5g.cloudfront.net/webapp/flashcards.png",
  // },
  // {
  //   url: "/quiz",
  //   icon: "",
  //   name: "Quiz",
  //   type: "menu",
  //   imgUrl:
  //     "https://d3jrelxj5ogq5g.cloudfront.net/webapp/quiz.png",
  // },
  // {
  //   url: "/summary",
  //   icon: "",
  //   name: "Summary",
  //   type: "menu",
  //   imgUrl:
  //     "https://d3jrelxj5ogq5g.cloudfront.net/webapp/summary.png",
  // },
];

export const MONTHNAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const countriesCurreny = getAllISOCodes();

export function getCurrencyAndPrice(value) {
  if (!value) return { symbol: "", price: "" };
  const symbolMatch = value.match(/^\D+/);
  const priceMatch = value.match(/\d+(\.\d+)?/);

  const symbol = symbolMatch ? symbolMatch[0] : null;
  const price = priceMatch ? priceMatch[0] : null;

  return { symbol, price };
}

export function debounceFunction(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

export const GALLEY_UPLOAD_COLORS = [
  {
    id: 1,
    bg: "#fac96c",
  },
  {
    id: 2,
    bg: "#ee7070",
  },
  {
    id: 3,
    bg: "#3ea9d5",
  },
];

export function rgbToHex(rgb) {
  const regex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/;
  const parts = regex.exec(rgb);

  if (!parts) return rgb; // Return original string if it doesn't match

  const r = parseInt(parts[1], 10);
  const g = parseInt(parts[2], 10);
  const b = parseInt(parts[3], 10);
  const a = parts[4] ? Math.round(parseFloat(parts[4]) * 255) : undefined;

  let hexColor =
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0");

  if (a !== undefined) hexColor += a.toString(16).padStart(2, "0");

  return hexColor;
}

export const getDomainFromURL = (url) => {
    if (url) {
      const urlObj = new URL(url)
      return urlObj.hostname.replace("www.", "")
    }
    return ''
}

export const getDomainFromURLForBookmark = (url) => {
    if (url && url.match(NEW_URL_PATTERN)) {
      const urlObj = new URL(url)
      return urlObj.hostname.replace("www.", "")
    }
    return ''
}

export const getDomainFromURLForBookBookmark = (url) => {
    const pattern = new RegExp(
      '^([a-zA-Z]+:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', // fragment locator
      'i'
    )
    if (url && pattern.test(url)) {
      const urlObj = new URL(url)
      return urlObj.hostname.replace("www.", "")
    }
    return ''
}

export const getColorForProfilePlatform = (platform) => {
  if(platform === 'Twitter'){
    return '#000000'
  }
  if(platform === 'LinkedIn'){
    return '#0077B5'
  }
  if(platform === 'Reddit'){
    return '#FF4500'
  }
  if(platform === 'Producthunt'){
    return '#DA552F'
  }
  if(platform === 'Medium'){
    return '#3b82f6'
  }
  if(platform === 'Hacker News'){
    return '#FF6600'
  }
  if(platform === 'Github'){
    return '#181717'
  }
  if(platform === 'Tiktok'){
    return '#000000'
  }
  if(platform === 'Instagram'){
    return '#F50C96'
  }
  if(platform === 'Youtube'){
    return '#FF0000'
  }
  if(platform === 'Threads'){
    return '#000000'
  }
  if(platform === 'Facebook'){
    return '#1877F2'
  }
  if(platform === 'Twitch'){
    return '#6441A4'
  }
  if(platform === 'Substack'){
    return '#FF6719'
  }
  if(platform === 'Pinterest'){
    return '#E60023'
  }
  if(platform === 'Discord'){
    return '#5865F2'
  }
  if(platform === 'Whatsapp'){
    return '#25D366'
  }
  if(platform === 'Telegram'){
    return '#26A5E4'
  }
  if(platform === 'Steam'){
    return '#000000'
  }
  if(platform === 'Tumblr'){
    return '#34526f'
  }
  if(platform === 'Gitlab'){
    return '#FC6D26'
  }
  if(platform === 'Goodreads'){
    return '#372213'
  }
  if(platform === 'Mastodon'){
    return '#3088D4'
  }
  if(platform === 'Quora'){
    return '#B92B27'
  }
  if(platform === 'PlayStore'){
    return '#414141'
  }
  if(platform === 'G2'){
    return '#00AB6C'
  }
  if(platform === 'Capterra'){
    return '#0084BF'
  }
  if(platform === 'Trustpilot'){
    return '#000'
  }
  if(platform === 'Google'){
    return '#4285F4'
  }
  if(platform === 'AppSumo'){
    return '#40A944'
  }
  if(platform === 'TripAdvisor'){
    return '#00AF87'
  }
  if(platform === 'Yelp'){
    return '#D32323'
  }
  if(platform === 'Shopify'){
    return '#96BF48'
  }
  if(platform === 'Snapchat'){
    return '#FFFC00'
  }
  if(platform === 'Amazon'){
    return '#FF9900'
  }
  if(platform === 'AppStore'){
    return '##007AFF'
  }
  return '#000'
}

export const PROFILE_PLATFORMS_ICON = [
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
          alt="tiktok"
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
      name: "Youtube",
      value: "Youtube",
      icon: (
        <RiYoutubeLine className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    {
      id: 11,
      name: "Threads",
      value: "Threads",
      icon: (
        <RiThreadsFill className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    {
      id: 12,
      name: "Facebook",
      value: "Facebook",
      icon: (
        <RiFacebookLine className="h-5 w-5 text-white" aria-hidden="true" />
      )
    },
    {
      id: 13,
      name: "Twitch",
      value: "Twitch",
      icon: <RiTwitchFill className="h-5 w-5 text-white" aria-hidden="true" />,
    },
    {
      id: 14,
      name: "Substack",
      value: "Substack",
      icon: <SiSubstack className="h-5 w-5 text-white" aria-hidden="true" />,
    },
    {
      id: 15,
      name: "Pinterest",
      value: "Pinterest",
      icon: (
        <RiPinterestFill className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    {
      id: 16,
      name: "Discord",
      value: "Discord",
      icon: (
        <RiDiscordFill className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    {
      id: 17,
      name: "Whatsapp",
      value: "Whatsapp",
      icon: (
        <RiWhatsappFill className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    {
      id: 18,
      name: "Telegram",
      value: "Telegram",
      icon: (
        <RiTelegramFill className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    {
      id: 19,
      name: "Steam",
      value: "Steam",
      icon: <RiSteamFill className="h-5 w-5 text-white" aria-hidden="true" />,
    },
    {
      id: 20,
      name: "Tumblr",
      value: "Tumblr",
      icon: <RiTumblrFill className="h-5 w-5 text-white" aria-hidden="true" />,
    },
    {
      id: 21,
      name: "Gitlab",
      value: "Gitlab",
      icon: <RiGitlabFill className="h-5 w-5 text-white" aria-hidden="true" />,
    },
    {
      id: 22,
      name: "Goodreads",
      value: "Goodreads",
      icon: (
        <PiGoodreadsLogoFill className="h-5 w-5 text-white" aria-hidden="true"/>
      ),
    },
    {
      id: 23,
      name: "Mastodon",
      value: "Mastodon",
      icon: (
        <RiMastodonFill className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    {
      id: 24,
      name: "Imdb",
      value: "Imdb",
      icon: (
        <SiImdb className="h-5 w-5 text-white" aria-hidden="true" />
      ),
    },
    ]

export const PLATFORMS = [
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
];

export function normalizeUrl(inputUrl) {
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
        inputUrl = 'https://' + inputUrl;
    }
    const parsedUrl = new URL(inputUrl);
    
    parsedUrl.protocol = 'https:';
    
    parsedUrl.hostname = parsedUrl.hostname.replace('www.', '');
    return parsedUrl.toString();
}

export const platformsArray = [
  'Twitter', 'LinkedIn', 'Reddit', 'Producthunt', 'Medium', 'Hacker News',
  'Github', 'Tiktok', 'Instagram', 'Youtube', 'Threads', 'Facebook',
  'Twitch', 'Substack', 'Pinterest', 'Discord', 'Whatsapp', 'Telegram',
  'Steam', 'Tumblr', 'Gitlab', 'Goodreads', 'Mastodon', 'Quora', 'PlayStore',
  'G2', 'Capterra', 'Trustpilot', 'Google', 'AppSumo', 'TripAdvisor', 'Yelp',
  'Shopify', 'Snapchat', 'Amazon', 'AppStore','Imdb'
];


export function getPlatformFromURL(url) {
  const normalizedUrl = url.toLowerCase();
  const foundPlatform = platformsArray.find(platform => normalizedUrl.includes(platform.toLowerCase()));

  return foundPlatform || 'Twitter';
}

export function classifyIMDbURL(url) {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname === "www.imdb.com") {
    if (parsedUrl.pathname.startsWith("/title")) {
      return "Movie";
    }
    else if (parsedUrl.pathname.startsWith("/name")) {
      return "Profile";
    }
  }
  return null;
}

export const getTutorialVideoForMediaTypes = (mediaType) => {
  if(mediaType === "Text Expander"){
    return 'https://www.youtube.com/watch?v=ilH1-_Xg9sw'
  }
  if(mediaType === "SocialFeed"){
    return 'https://www.youtube.com/watch?v=cFW4G9bV82c'
  }
  if(mediaType === "Book"){
    return 'https://www.youtube.com/watch?v=Vbede7l1tCE'
  }
  if(mediaType === "Profile"){
    return 'https://www.youtube.com/watch?v=mWBZp2qXSSk'
  }
  if(mediaType === "Movie"){
    return 'https://www.youtube.com/watch?v=2yO0xLvFmww'
  }
  if(mediaType === "Note"){
    return 'https://www.youtube.com/watch?v=etlQ8r04ldE'
  }
  if(mediaType === "Quote"){
    return 'https://www.youtube.com/watch?v=N7_wIQGUIKs'
  }
  if(mediaType === "Ai Prompt"){
    return 'https://www.youtube.com/watch?v=OHiJPmQty6U'
  }
  if(mediaType === "Product"){
    return 'https://www.youtube.com/watch?v=JN-m200qDnw'
  }
  if(mediaType === "App"){
    return 'https://www.youtube.com/watch?v=9mXqgBVaSnk'
  }
  if(mediaType === "Screenshot"){
    return 'https://www.youtube.com/watch?v=8hKjzNTziN0'
  }
  if(mediaType === "Audio"){
    return 'https://www.youtube.com/watch?v=C94RAVGmcFg'
  }
  if(mediaType === "Image"){
    return 'https://www.youtube.com/watch?v=ZEP7IjCkP_8'
  }
  if(mediaType === "Video"){
    return 'https://www.youtube.com/watch?v=kUFmHL583S4'
  }
  if(mediaType === "PDF"){
    return 'https://www.youtube.com/watch?v=tALdOq2o5hA'
  }
  if(mediaType === "Article"){
    return 'https://www.youtube.com/watch?v=NnmIfNA7qNY'
  }
  if(mediaType === "Highlight"){
    return 'https://www.youtube.com/watch?v=N6l58HK3ic4'
  }
  if(mediaType === "Code"){
    return 'https://www.youtube.com/watch?v=o6S7HxsZiyc'
  }
  if(mediaType === "Link"){
    return 'https://www.youtube.com/watch?v=Y5uBhec8IbU'
  }
  if(mediaType === "Citation"){
    return ''
  }
  if(mediaType === "Testimonial"){
    return 'https://www.youtube.com/watch?v=fwH4D44dav4'
  }
}

export const MEDIUM_REGEX = /resize:fill:\d+:\d+/gi
export const MEDIUM_REPLACEMENT_STR = "resize:fit:2400"

export const SLUG_REGEX = /[\s&,+()$~%.'":*?<>|{}/\/]/gm
