/*global chrome*/
import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  MagnifyingGlassIcon,
  MoonIcon,
  PlusIcon,
  CloudArrowUpIcon,
  SunIcon,
  BookmarkIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Divider, Tooltip, Dropdown, Tree } from "antd";

import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import { setWebsiteThemeMode, updateUser } from "../../actions/user";
import { sendThemeToChrome } from "../../utils/send-theme-to-chrome";
import {
  changeSidebarOrder,
  getSidebarOrder,
} from "../../actions/customApplication";
import { generateMenuTreeData } from "../../utils/generateTreeData";
import "./menuList.css";
import { setActiveHomeTab, showSingleFilePopup } from "../../actions/app";
import session from "../../utils/session";
import { DEFAULT_SIDEBAR_ARR, classifyIMDbURL } from "../../utils/constants";
import { getRecentURLDetails, getVisitedHistory, openProperPage } from "../../utils/message-operations";
import { getUserSyncData, setExpandedKeys, setLoadedKeys } from "../../actions/collection";
import { FaRobot, FaSyncAlt } from "react-icons/fa";
import { syncAiPromptAgain } from "../../actions/ai-brands";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MenuItem = ({
  collapsed,
  setCollapsed,
  tooltipPlacement = "leftTop",
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tabDetails = useSelector((state) => state.app.tab);
  const activeTab = useSelector((state) => state.app.activeTabKey);
  const themeMode = useSelector((state) => state.user.themeMode);
  const userDetails = useSelector((state) => state?.user?.userData);
  const isSyncing = useSelector((state) => state.app.isSyncing);
  const [isProcessDone, setProcessStatus] = useState(true);
  const [isBowserSync, setBrowserSync] = useState(false);

  const [mode, setThemeMode] = useState(themeMode);

  const sidebarOrder = useSelector(
    (state) => state.sidebarApplications.sidebarOrder
  );
  const [menuList, setMenuList] = useState([]);

  useEffect(() => {
    (async () => {
      const sites = await getVisitedHistory();
      let apps = [];
      if (sites && sites.length > 0) {
        apps = sites.map((site) => {
          return { ...site, type: "app" };
        });
      }
      if (session?.userId) {
        setMenuList(sidebarOrder);
      } else {
        if (session.sidebarOrder) {
          setMenuList([
            ...DEFAULT_SIDEBAR_ARR,
            ...apps,
            ...session.sidebarOrder,
          ]);
        } else {
          setMenuList([...DEFAULT_SIDEBAR_ARR, ...apps]);
        }
      }
    })();
  }, [sidebarOrder]);

  useEffect(() => {
    if (!session.userId && session.sidebarOrder) {
      (async () => {
        const sites = await getVisitedHistory();
        let apps = [];
        if (sites && sites.length > 0) {
          apps = sites.map((site) => {
            return { ...site, type: "app" };
          });
        }
        setMenuList([...DEFAULT_SIDEBAR_ARR, ...apps, ...session.sidebarOrder]);
      })();
    }
  }, [session.sidebarOrder]);

  const onModeChange = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isDark = themeMode === "dark";
    const m = isDark ? "light" : "dark";
    setProcessStatus(false);
    if (session.userId) {
      const res = await dispatch(
        updateUser({
          preferences: {
            ...userDetails?.preferences,
            theme: {
              mode: m,
              isDark: !isDark,
            },
          },
        })
      );
      if (res.error === undefined) {
        sendThemeToChrome(
          !isDark,
          "From Button",
          tabDetails || (await fetchCurrentTab())
        );
        setThemeMode(m);
        dispatch(setWebsiteThemeMode(m));
      }
    } else {
      sendThemeToChrome(
        !isDark,
        "From Button",
        tabDetails || (await fetchCurrentTab())
      );
      setThemeMode(m);
      dispatch(setWebsiteThemeMode(m));
    }
    setProcessStatus(true);
    return false;
  };

  const openSpotlight = async () => {
    const tabObj = tabDetails || (await fetchCurrentTab());
    if (tabObj) {
      window.chrome.tabs.sendMessage(tabObj.id, {
        type: "SHOW_OMNISEARCH",
        value: true,
      });
    }
    return false;
  };

  const onReaderViewClick = async (e) => {
    const tabObj = tabDetails || (await fetchCurrentTab());
    if (tabObj) {
      dispatch(setActiveHomeTab("search-bookmark"));
      window.chrome.tabs.sendMessage(tabObj.id, {
        type: "READER_VIEW",
        value: true,
      });
    }
    return false;
  };

  const onScreenshotClick = async (e) => {
    const tabObj = tabDetails || (await fetchCurrentTab());
    if (tabObj) {
      dispatch(setActiveHomeTab("search-bookmark"));
      window.chrome.tabs.sendMessage(tabObj.id, {
        type: "SCREENSHOT_VIEW",
        value: true,
        tabId: tabObj.id,
      });
    }
    return false;
  };

  const handleNavigate = async (url) => {
    const selectedMenu = menuList.filter((menu) => menu.url === url)[0];
    if (selectedMenu?.name) {
      dispatch(setActiveHomeTab(selectedMenu?.name));
    }
    if (collapsed) {
      const tab = tabDetails || (await fetchCurrentTab());
      window.chrome.tabs.sendMessage(tab.id, { type: "CT_PANEL_EXPAND" });
      setCollapsed(false);
      if (
        !session.userId &&
        (selectedMenu?.name === "Highlight" ||
          selectedMenu?.name === "Read Later" ||
          selectedMenu?.name === "Save tabs" ||
          selectedMenu?.name === "Text Expander")
      ) {
        navigate("/login");
      } else {
        navigate(url);
      }
    } else {
      if (
        !session.userId &&
        (selectedMenu?.name === "Highlight" ||
          selectedMenu?.name === "Read Later" ||
          selectedMenu?.name === "Save tabs" ||
          selectedMenu?.name === "Text Expander")
      ) {
        navigate("/login");
      } else {
        navigate(url);
      }
    }
  };

  // const onFullPageScreenshot = async () => {
  //   if (!session?.userId) {
  //     handleNavigate('/login')
  //     dispatch(setActiveHomeTab("Screenshot"));
  //   } else {
  //     const tab = tabDetails || await fetchCurrentTab()
  //     window.chrome.tabs.sendMessage(tab.id, { type: "CAPTURE_FULLPAGE_SCREENSHOT" })
  //     dispatch(setActiveHomeTab("Screenshot"));
  //   }
  // }

  // const onSelectionAreaClick = async () => {
  //   if (!session?.userId) {
  //     handleNavigate('/login')
  //     dispatch(setActiveHomeTab("Screenshot"));
  //   } else {
  //     const tab = tabDetails || await fetchCurrentTab()
  //     window.chrome.tabs.sendMessage(tab.id, { type: "CAPTURE_SCREENSHOT" })
  //     dispatch(setActiveHomeTab("Screenshot"));
  //   }
  // }

  const onBrowserSyncClick = async () => {
    setBrowserSync(true);
    const res = await dispatch(getUserSyncData());
    if (res.error === undefined) {
      const currentTab = tabDetails || (await fetchCurrentTab());
      window.chrome.tabs.sendMessage(currentTab.id, {
        type: "CT_SYNC_DATA",
        data: res.payload.data,
      }, (response) => {
        setBrowserSync(false);
      });
    }
  }

  const handleOpenCustomApp = async (item) => {
    const tab = tabDetails || (await fetchCurrentTab());
    window.chrome.tabs.sendMessage(tab.id, {
      type: "CT_OPEN_SIDEBAR_APP",
      url: item.url,
    });
  };

  const handleAddBookmark = async () => {
    await fetchCurrentTab().then((res) => {
      if (
        res?.url.startsWith("https://www.youtube.com/watch") ||
        res?.url.startsWith("https://vimeo.com/")
      ) {
        handleNavigate("/video-panel");
      } else if (
        res?.url.startsWith("https://www.amazon.in/") ||
        res?.url.startsWith("https://www.amazon.com/") ||
        res?.url.startsWith("https://www.amazon.co.uk/") ||
        res?.url.startsWith("https://www.amazon.co.in/")
      ) {
        handleNavigate("/product");
      }else if(res?.url.startsWith("https://www.imdb.com/")){
        const type = classifyIMDbURL(res?.url)
        if(type === 'Profile'){
            navigate("/profile-gem?imdb=true")
        }else if(type === 'Movie'){
            navigate('/movie')
        }else {
            navigate("/add-bookmark")
        }
      }
      else {
        openProperPage()
      }
      // } else {
      //   handleNavigate("/add-bookmark");
      // }
    });
  };

  const handleSingleFile = async () => {
    dispatch(showSingleFilePopup(true));
  }

  const cbs = {
    handleOpenCustomApp,
    handleNavigate,
    onReaderViewClick,
    onScreenshotClick,
    onModeChange,
    isProcessDone,
    mode,
    handleSingleFile
  };

  async function onDropMenu(info) {
    const { node, dragNode } = info;
    const dragIndex = [ ...curateitTreeData, ...appTreeData ].findIndex(
      (item) => item.key === dragNode.key
    );
    let dropIndex = [ ...curateitTreeData, ...appTreeData ].findIndex((item) => item.key === node.key);
    const newTreeData = [ ...curateitTreeData, ...appTreeData ];
    newTreeData.splice(dragIndex, 1);

    newTreeData.splice(dropIndex, 0, dragNode);

    const filtered = newTreeData.map((item) => item.label);

    setMenuList(filtered);
    const payload = {
      sidebar: filtered,
    };
    await dispatch(changeSidebarOrder(payload));
    await dispatch(getSidebarOrder());
  }

  const curateitTreeData = generateMenuTreeData(
    menuList?.filter((item) => item.type === "menu"),
    tooltipPlacement,
    cbs,
    [],
    activeTab
  );

  const appTreeData = generateMenuTreeData(
    menuList?.filter((item) => item.type === undefined || (item.type !== undefined && item.type === "app")),
    tooltipPlacement,
    cbs,
    [],
    activeTab
  );

  return (
    <>
      <div className="flex flex-col items-center justify-start h-[100%]">
        <div className="flex flex-col justify-start items-center h-fit w-[100%]">
          {/* <Tooltip placement={tooltipPlacement} title="Search"> */}
          <button
            onClick={openSpotlight}
            title="Search"
            className="cursor-pointer mb-2 p-1 rounded-md"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
          {/* </Tooltip> */}

          {/* <Tooltip placement={tooltipPlacement} title="Bookmark"> */}
          <button
            title="Bookmark"
            onClick={() => {
              dispatch(setActiveHomeTab("search-bookmark"));
              if (session?.userId) {
                dispatch(setLoadedKeys([]))
                dispatch(setExpandedKeys([]))
                handleNavigate("/search-bookmark");
              } else {
                handleNavigate("/login");
              }
            }}
            className={classNames(
              activeTab === "search-bookmark" ? "bg-[#347AE2] text-white" : "",
              "cursor-pointer mb-2 p-1 rounded-md"
            )}
          >
            <BookmarkIcon className="h-5 w-5" />
          </button>
          {/* </Tooltip> */}

          {/* ai btn */}
          <button
            title="Curateit-Ai"
            onClick={() => {
              dispatch(setActiveHomeTab("curateit-ai"));
              if (session?.userId) {
                dispatch(setLoadedKeys([]));
                dispatch(setExpandedKeys([]));
                dispatch(syncAiPromptAgain(true))
                handleNavigate("/ai");
              } else {
                handleNavigate("/login");
              }
            }}
            className={classNames(
              activeTab === "curateit-ai" ? "bg-[#347AE2] text-white" : "",
              "cursor-pointer mb-2 p-1 rounded-md"
            )}
          > 
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
            <path d="M19.3346 14.0026V16.0026C19.3346 16.3693 19.0346 16.6693 18.668 16.6693H18.0013V17.3359C18.0013 18.0759 17.408 18.6693 16.668 18.6693H7.33464C6.98101 18.6693 6.64188 18.5288 6.39183 18.2787C6.14178 18.0287 6.0013 17.6896 6.0013 17.3359V16.6693H5.33464C4.96797 16.6693 4.66797 16.3693 4.66797 16.0026V14.0026C4.66797 13.6359 4.96797 13.3359 5.33464 13.3359H6.0013C6.0013 10.7559 8.08797 8.66927 10.668 8.66927H11.3346V7.8226C10.9346 7.59594 10.668 7.1626 10.668 6.66927C10.668 5.93594 11.268 5.33594 12.0013 5.33594C12.7346 5.33594 13.3346 5.93594 13.3346 6.66927C13.3346 7.1626 13.068 7.59594 12.668 7.8226V8.66927H13.3346C15.9146 8.66927 18.0013 10.7559 18.0013 13.3359H18.668C19.0346 13.3359 19.3346 13.6359 19.3346 14.0026ZM18.0013 14.6693H16.668V13.3359C16.668 11.4959 15.1746 10.0026 13.3346 10.0026H10.668C8.82797 10.0026 7.33464 11.4959 7.33464 13.3359V14.6693H6.0013V15.3359H7.33464V17.3359H16.668V15.3359H18.0013V14.6693Z" fill={activeTab === "curateit-ai" ? "white" : "#4B4F5D"} />
            <path d="M14.332 15.6667C15.072 15.6667 15.6654 15.0733 15.6654 14.3333C15.6654 13.6 15.0654 13 14.332 13C13.5987 13 12.9987 13.5933 12.9987 14.3333C12.9987 15.0733 13.592 15.6667 14.332 15.6667Z" fill={activeTab === "curateit-ai" ? "white" : "#4B4F5D"} />
            <path d="M8.33203 14.3333C8.33203 13.6 8.93203 13 9.66536 13C10.4054 13 10.9987 13.5933 10.9987 14.3333C10.9987 15.0733 10.3987 15.6667 9.66536 15.6667C8.93203 15.6667 8.33203 15.0667 8.33203 14.3333Z" fill={activeTab === "curateit-ai" ? "white" : "#4B4F5D"} />
            </svg>
          </button>

          {/* <Tooltip
            title={mode === "dark" ? "Light mode" : "Dark mode"}
            placement={tooltipPlacement}
          > */}
          {/* <button
            className="cursor-pointer mb-2 p-1 rounded-md"
            title={mode === "dark" ? "Light Mode" : "Dark Mode"}
            onClick={onModeChange}
            disabled={!isProcessDone}
          >
            {mode === "dark" ? (
              <SunIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-700" />
            )}
          </button> */}
          {/* </Tooltip> */}

          <Divider className="m-0 w-[100%]" />
        </div>

        <div className="h-[65%] overflow-y-auto scrollbar-hide tree-menu">
          <Tree
            className="menu-tree-structure"
            treeData={curateitTreeData}
            draggable
            onDrop={onDropMenu}
            blockNode
            selectable={false}
          />
          <Divider className="m-0 w-[100%]" />
          <Tree
            className="menu-tree-structure"
            treeData={appTreeData}
            draggable
            onDrop={onDropMenu}
            blockNode
            selectable={false}
          />
        </div>

        <div
          className={`${
            collapsed ? "h-fit" : "h-[20%]"
          } flex flex-col items-center justify-center`}
        >
          {/* <Tooltip placement={tooltipPlacement} title="Add Application"> */}
          <PlusIcon
            className="h-5 w-5 cursor-pointer"
            title="Add Application"
            onClick={() => handleNavigate("/default-sidebar-apps")}
          />
          {/* </Tooltip> */}
          {/* {session?.userId && ( */}
          <div className="flex flex-col items-center shadow bg-[#347AE2] p-2 rounded-[8px] mt-2">
            {/* <Tooltip placement={tooltipPlacement} title="Add bookmark"> */}
            <button
              title="Add Bookmark"
              disabled={isSyncing}
              className="mb-2"
              onClick={async () => {
                if (session.userId) {
                  await getRecentURLDetails()
                  handleAddBookmark();
                } else {
                  navigate("/login");
                }
              }}
            >
              <img
                className="h-5 w-5 cursor-pointer"
                src="/icons/add-bookmark.svg"
                alt="add bookmark icon"
              />
            </button>
            {/* </Tooltip> */}

            {/* <Tooltip placement={tooltipPlacement} title="Save tabs"> */}
            <button
              title="Save Tabs"
              onClick={() => {
                if (session.userId) {
                  handleNavigate("/save-tabs");
                } else {
                  navigate("/login");
                }
              }}
              className="mb-2 cursor-pointer"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.12"
                  d="M3 8.8C3 7.11984 3 6.27976 3.32698 5.63803C3.6146 5.07354 4.07354 4.6146 4.63803 4.32698C5.27976 4 6.11984 4 7.8 4H16.2C17.8802 4 18.7202 4 19.362 4.32698C19.9265 4.6146 20.3854 5.07354 20.673 5.63803C21 6.27976 21 7.11984 21 8.8V10H3V8.8Z"
                  fill="white"
                />
                <path
                  d="M21 11.5V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H12.5M21 10H3M18 21V15M15 18H21"
                  stroke="white"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="7" cy="7" r="1" fill="white" />
                <circle cx="10" cy="7" r="1" fill="white" />
                <circle cx="13" cy="7" r="1" fill="white" />
              </svg>
            </button>
            {/* </Tooltip> */}

            {/* <Tooltip placement={tooltipPlacement} title="Upload"> */}
            <button
              disabled={isSyncing}
              title="Upload Bookmark"
              className="mb-2"
              onClick={() => {
                if (session.userId) {
                  handleNavigate("/");
                } else {
                  navigate("/login");
                }
              }}
            >
              <CloudArrowUpIcon className="h-5 w-5 text-white cursor-pointer" />
            </button>
            {/* <button
              disabled={isBowserSync}
              title="Sync with current browser"
              className={isBowserSync ? "ct-sync-animateion mb-2" : "mb-2"}
              onClick={onBrowserSyncClick}
            >
              <FaSyncAlt className="h-5 w-5 text-white cursor-pointer" />
            </button> */}
            {/* </Tooltip> */}
          </div>
          {/* // )} */}
        </div>
      </div>
    </>
  );
};

export default MenuItem;
