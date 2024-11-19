import React, { useEffect, useRef, useState } from "react";
import {
  FaInfoCircle,
  FaLink,
  FaRegCompass,
  FaRegImage,
  FaRegQuestionCircle,
  FaShareAlt,
} from "react-icons/fa";
import { BsJournalText } from "react-icons/bs";
import { ImParagraphLeft } from "react-icons/im";
import OverView from "./OverView";
import Headings from "./Headings";
import Images from "./Images";
import Links from "./Links";
import Schema from "./Schema";
import Socials from "./Socials";
import PageInsights from "./PageInsights"
import Info from "../../info/Info";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [activeComponent, setActiveComponent] = useState("Overview");
  const [pageUrl, setPageUrl] = useState("");

  const items = [
    {
      name: "Overview",
      id: "overview",
      icon: <FaRegCompass className="w-[1.5em] h-[1.5em]" />,
    },
    {
      name: "Headings",
      id: "headings",
      icon: <BsJournalText className="w-[1.5em] h-[1.5em]" />,
    },
    {
      name: "Links",
      id: "links",
      icon: <FaLink className="w-[1.5em] h-[1.5em]" />,
    },
    {
      name: "Images",
      id: "images",
      icon: <FaRegImage className="w-[1.5em] h-[1.5em]" />,
    },
    {
      name: "Schema",
      id: "schema",
      icon: <ImParagraphLeft className="w-[1.5em] h-[1.5em]" />,
    },
    {
      name: "Socials",
      id: "socials",
      icon: <FaShareAlt className="w-[1.5em] h-[1.5em]" />,
    },
    {
      name: "Page Insights",
      id: "pageInsights",
      icon: <FaRegQuestionCircle className="w-[1.5em] h-[1.5em]" />,
    },
  ];

  const renderComponent = () => {
    switch (activeComponent) {
      case "Overview":
        return <OverView pageUrl={pageUrl} />;
      case "Headings":
        return <Headings pageUrl={pageUrl} />;
      case "Images":
        return <Images pageUrl={pageUrl} />;
      case "Links":
        return <Links pageUrl={pageUrl} />;
      case "Schema":
        return <Schema pageUrl={pageUrl} />;
      case "Socials":
        return <Socials pageUrl={pageUrl} />;
      case "Page Insights":
        return <PageInsights pageUrl={pageUrl} />;
      default:
        return <div>Coming Soon</div>;
    }
  };

  useEffect(() => {
    if (window.chrome.tabs) {
      window.chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          var currentTab = tabs[0];
          if (currentTab && currentTab.url) {
            setPageUrl(currentTab.url);
          }
        }
      );
    }
  }, []);

  return (
    <div className="w-[23rem]">
      <div
        ref={headerRef}
        className="flex flex-row gap-3 mt-2 bg-blue-500 rounded-md p-4 text-gray-300 mb-4 justify-evenly"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-row gap-1 justify-center items-center cursor-pointer ${activeComponent === item.name ? "text-white" : ""
              }`}
            onClick={() => setActiveComponent(item.name)}
            title={item.name}
          >
            {item.icon}
          </div>
        ))}
      </div>
      {renderComponent()}
    </div>
  );
};

export default Header;
