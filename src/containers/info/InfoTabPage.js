/*global chrome*/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Info from "./Info";
import LayoutCommon from "../../components/commonLayout/LayoutCommon";
import { fetchUrlData } from "../../actions/domain";
import Loadingscreen from "../../components/Loadingscreen/Loadingscreen";
import OverView from "../seoInsights/seo/OverView";
import Headings from "../seoInsights/seo/Headings";
import Images from "../seoInsights/seo/Images";
import Links from "../seoInsights/seo/Links";
import Schema from "../seoInsights/seo/Schema";
import Socials from "../seoInsights/seo/Socials";
import PageInsights from "../seoInsights/seo/PageInsights";
import {
  FaInfoCircle,
  FaLink,
  FaRegCompass,
  FaRegImage,
  FaRegQuestionCircle,
  FaShareAlt,
} from "react-icons/fa";
import { ImParagraphLeft } from "react-icons/im";
import { BsJournalText } from "react-icons/bs";
import { IoMdRefresh } from "react-icons/io";

const DEFAULT_PARAMS = [
  "&email=true&phonenumber=true",
  "&brandcolor=true&screenshot=true",
  "&sociallink=true&category=true",
  "&text=true",
  "&technologystack=true&digitalrank=true",
];
const InfoTabPage = ({rendering}) => {
  const dispatch = useDispatch();
  const urlDetails = useSelector((state) => state.domain.urlData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  let currentParamEle = 0;
  const headerRef = useRef(null);
  const [activeComponent, setActiveComponent] = useState(
    rendering === "info" ? "Info" : "Overview"
  );
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if(rendering){
      setActiveComponent(rendering === "info" ? "Info" : "Overview");
    }
  },[rendering])

  const items = [
    {
      name: "Info",
      id: "info",
      icon: <FaInfoCircle className="w-[1.5em] h-[1.5em]" />,
    },
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

  const seoItems = [
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
    {
      name: "Info",
      id: "info",
      icon: <FaInfoCircle className="w-[1.5em] h-[1.5em]" />,
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
      case "Info":
        return error ? <RenderError /> : <Info pageUrl={pageUrl} />;
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

  const fecthDeomainDetails = useCallback(
    (params, url) => {
      setLoading(false);
      dispatch(fetchUrlData(url + params)).then((res) => {
        if (currentParamEle < DEFAULT_PARAMS.length + 1) {
          currentParamEle = currentParamEle + 1;
          if (DEFAULT_PARAMS[currentParamEle]) {
            fecthDeomainDetails(DEFAULT_PARAMS[currentParamEle], url);
          }
        } else {
          return false;
        }
      });
    },
    [currentParamEle]
  );

  useEffect(() => {
    setLoading(true);
    setError(false);
    chrome?.tabs?.query({ currentWindow: true, active: true }, function (tabs) {
      if (tabs.length > 0) {
        if (tabs[0].url === urlDetails?.url) {
          setLoading(false);
        } else {
          dispatch(fetchUrlData(tabs[0].url)).then((res) => {
            if (res?.type == "FETCH_URL_DATA_FAIL") {
              setError(true);
            } else if (res?.payload?.data?.SocialWebsites) {
              // Nothing to show error screen
              setError(true);
            } else {
              setError(false);
              if (currentParamEle < DEFAULT_PARAMS.length) {
                fecthDeomainDetails(DEFAULT_PARAMS[0], tabs[0].url);
              }
            }

            setLoading(false);
          });
        }
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(false);
    chrome?.tabs?.query({ currentWindow: true, active: true }, function (tabs) {
      if (tabs.length > 0) {
        if (tabs[0].url === urlDetails?.url) {
          setLoading(false);
        } else {
          dispatch(fetchUrlData(tabs[0].url)).then((res) => {
            if (res?.type == "FETCH_URL_DATA_FAIL") {
              setError(true);
            } else if (res?.payload?.data?.SocialWebsites) {
              // Nothing to show error screen
              setError(true);
            } else {
              setError(false);
              if (currentParamEle < DEFAULT_PARAMS.length) {
                fecthDeomainDetails(DEFAULT_PARAMS[0], tabs[0].url);
              }
            }

            setLoading(false);
          });
        }
      } else {
        setLoading(false);
      }
    });
  }

  const RenderError = () => (
    <div className="text-center py-10 mt-10">
      <div className="ct-relative mt-2">
        <img
          className="h-50 w-50 my-0 mx-auto"
          src="/icons/upload-error.svg"
          alt="Cloud ellipse icons"
        />
        <div className="absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400">
          No data found.
        </div>
      </div>
    </div>
  );

  const Header = () => {
    return (
      <div className="w-[23rem] m-auto">
        <div
          ref={headerRef}
          className="flex flex-row gap-3 mt-2 bg-blue-500 rounded-md p-4 text-gray-300 mb-4 justify-evenly"
        >
          {rendering === "info" ? (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-row gap-1 justify-center items-center cursor-pointer ${
                    activeComponent === item.name ? "text-white" : ""
                  }`}
                  onClick={() => setActiveComponent(item.name)}
                  title={item.name}
                >
                  {item.icon}
                </div>
              ))}
            </>
          ) : (
            <>
              {seoItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-row gap-1 justify-center items-center cursor-pointer ${
                    activeComponent === item.name ? "text-white" : ""
                  }`}
                  onClick={() => setActiveComponent(item.name)}
                  title={item.name}
                >
                  {item.icon}
                </div>
              ))}
            </>
          )}
        </div>
        <div className="w-full flex justify-end">
          <IoMdRefresh
            className="w-5 h-5 text-gray-700 hover:text-[#347AE2] cursor-pointer"
            onClick={handleRefresh}
          />
        </div>
        {renderComponent()}
      </div>
    );
  };

  return (
    <LayoutCommon>
      {loading ? <Loadingscreen showSpin={loading} /> : <Header />}
    </LayoutCommon>
  );
};

export default InfoTabPage;
