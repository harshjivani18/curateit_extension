/*global chrome*/
import { useEffect, useState } from "react";
import { ArrowLeftOnRectangleIcon, Cog6ToothIcon, UserCircleIcon, ArrowRightOnRectangleIcon, AdjustmentsHorizontalIcon, MegaphoneIcon, ArrowDownTrayIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";

import { Avatar, Dropdown, Switch } from "antd";
import session from "../../utils/session";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { changeSidebarPosition, changeEnableFloatMenu, updateUser } from "../../actions/user";
import { sendEnableFloatCodeMenuToChrome, sendEnableFloatImageMenuToChrome, sendEnableFloatMenuToChrome, sendSidebarPositionToChrome, sendSidebarViewType, sendThemeToChrome } from "../../utils/send-theme-to-chrome";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import { resetCollectionData } from "../../actions/collection";
import { useNavigate } from "react-router-dom";
import { RiDashboard2Fill, RiSideBarFill, RiSideBarLine } from "react-icons/ri";
import { getSuperAdminConfiguration } from "../../actions/user"
import { FaRegCreditCard } from "react-icons/fa";

const Footer = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const userDetails = useSelector((state) => state?.user)
  const sidebarPosition = useSelector((state) => state.user.sidebarPosition)
  const enableFloatMenu = useSelector((state) => state.user.enableFloatMenu)
  const sidebarView = useSelector(state => state?.user.sidebar_view);
  const tabDetails = useSelector((state) => state.app.tab)
  const [pinedType, setPinnedType] = useState(session?.sidebarView || 'auto_hide');

  

  useEffect(() => {
    if (!session.userId && session?.sidebarView) {
      setPinnedType(session?.sidebarView);
    }
  }, [session?.sidebarView])

  const handlePositionChange = async (e, value) => {
    e.preventDefault()
    e.stopPropagation()

    sendSidebarPositionToChrome(value, tabDetails || (await fetchCurrentTab()))
    dispatch(changeSidebarPosition(value))
    const newState = {
      preferences: {
        ...userDetails.userData?.preferences,
        sidebar_position: value,
      },
    }
    if (session.userId) {
      dispatch(updateUser(newState))
    }
  }

  const handlePin = async (e, value) => {
    e.preventDefault()
    e.stopPropagation()

    sendSidebarViewType(value, tabDetails || (await fetchCurrentTab()))
    session.setSidebarView(value);
    setPinnedType(value);
    if (session.userId) {
      const newState = {
        preferences: {
          ...userDetails.userData?.preferences,
          sidebar_view: value,
        },
      }
      dispatch(updateUser(newState))
    }
  }

  const handleEnableFloatMenu = async (checked) => {
    const value = checked === true ? "SHOW" : "HIDE"
    sendEnableFloatMenuToChrome(value, tabDetails || (await fetchCurrentTab()))
    dispatch(changeEnableFloatMenu(checked))
  }

  const logout = async () => {
    const tab = tabDetails || (await fetchCurrentTab())
    // localStorage.removeItem("CT_HIGHLIGHT_DATA")
    // localStorage.removeItem("bookmarkFetchingStatus")
    // localStorage.removeItem("show_spinner")
    // localStorage.removeItem("collectionData")
    // localStorage.removeItem("userId")
    // localStorage.removeItem("DATA")
    // localStorage.removeItem("CT_THEME")
    // localStorage.removeItem("token")
    // localStorage.removeItem("socialTrue")
    // localStorage.removeItem("sidebarPosition")
    // localStorage.removeItem("enableFloatMenu")
    // localStorage.removeItem("sidebarOrder")
    // localStorage.removeItem("unfiltered_collection_id")
    // localStorage.removeItem("mode")
    // localStorage.removeItem("username")
    // localStorage.removeItem("color-theme")
    localStorage.clear()
    dispatch(resetCollectionData())
    sendThemeToChrome(false, "Logout", tab)
    sendSidebarPositionToChrome("right", tab)
    sendEnableFloatImageMenuToChrome(true, tab)
    sendEnableFloatCodeMenuToChrome(true, tab)
    sendSidebarViewType("right", tab)
    sendEnableFloatMenuToChrome(true, tab)
    chrome.storage.sync.set({
      curateitBookmarks: [], expires: ""
    })
    chrome.storage.sync.set({
      userData: {
        token: "",
        unfilteredCollectionId: "",
      },
    })
    chrome.storage.sync.remove(["CT_SHORT_LINKS"])
    //Remove COOKIES FOR WEB APP
    chrome.cookies.remove({
      url: process.env.REACT_APP_WEBAPP_URL,
      name: 'curateittoken',
    })
    window.chrome.tabs.sendMessage(tab.id, {
      value: JSON.stringify([]),
      type: "CT_HIGHLIGHT_DATA",
    })
    window.chrome.tabs.sendMessage(tab.id, { type: "LOGOUT_EXPAND_IFRAME" })
    navigate("/login")
  }

  const navigateToUrl = async (url) => {
    if (collapsed) {
      const tab = tabDetails || await fetchCurrentTab()
      window.chrome.tabs.sendMessage(tab.id, { type: "CT_PANEL_EXPAND" })
      setCollapsed(false)
      navigate(url)
    } else {
      navigate(url)
    }
  }

  const onReportBugClick = async () => {
    await navigateToUrl("/report-bug")
  }

  const onSettingClick = async () => {
    await navigateToUrl("/setting")
  }

  const onTutorialClick = async () => {
    const tabObj = tabDetails || (await fetchCurrentTab());
    let uConfig  = userDetails?.userConfig
    if (!uConfig) {
      const res = await dispatch(getSuperAdminConfiguration())
      if (res.error === undefined && res.payload?.data?.data?.length > 0) {
        const config = res.payload.data.data[0]?.attributes
        if (config) {
          uConfig = {
            video_url: config.tutorial_video_url,
            thumbnail_url: config.tutorial_video_thumbnail,
            extension_url: config.extension_url,
            embed_code: config.tutorial_video_embed_code
          }
        }
      }
    }
    if (tabObj) {
      window.chrome.tabs.sendMessage(tabObj.id, {
        type: "SHOW_TUTORIAL_MODAL",
        userConfig: uConfig,
      });
    }
    return false;
  }

  const onReadMeClick = async () => {
    const tab = tabDetails || await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tab.id, {
      tabURLs: ["https://link.curateit.com/onboardguide"],
      id: "CT_OPEN_WINDOW"
    })
  }

  const onRateUsClick = async () => {
    const tab = tabDetails || await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tab.id, {
      tabURLs: ["https://chrome.google.com/webstore/detail/curateit-save-share-manag/hhofkocnlefejficdipgkefgfmnenpbk"],
      id: "CT_OPEN_WINDOW"
    })
  }

  const onDashboardClick = async () => {
    const tab = tabDetails || await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tab.id, {
      tabURLs: [`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/all-bookmarks`],
      id: "CT_OPEN_WINDOW"
    })
  }

  const onDownloadExtension = async () => {
    const tab = tabDetails || await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tab.id, {
      tabURLs: ["https://chrome.google.com/webstore/detail/curateit-save-share-manag/hhofkocnlefejficdipgkefgfmnenpbk"],
      id: "CT_OPEN_WINDOW"
    })
  }

  const onWhatsNewClick = async () => {
    const tab = tabDetails || await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tab.id, {
      tabURLs: [`https://web.curateit.com/whats-new`],
      id: "CT_OPEN_WINDOW"
    })
  }

  const onBillingClick = async () => {
    const tab = tabDetails || await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tab.id, {
      tabURLs: [`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/edit-profile?billing=true`],
      id: "CT_OPEN_WINDOW"
    })
  }

  const handleNavigateToProfile = async () => {
    const tab = tabDetails || await fetchCurrentTab()
    if (session.userId) {
      window.chrome.tabs.sendMessage(tab.id, {
        tabURLs: [`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}?userId=${session.userId}`],

        id: "CT_OPEN_WINDOW"
      })
    } else {
      await navigateToUrl("/login")
    }
  }

  const settingItems = [
    // {
    //   label: <div className="flex items-center justify-between">
    //     <img className='h-5 w-5 mr-[5px]' src="/icons/file-donwload.svg" alt="download icon" />
    //     <span>Download app</span>
    //   </div>,
    //   key: '0',
    // },
    // {
    //   label: <div className="flex items-center justify-between">
    //     <img className='h-5 w-5 mr-[5px]' src="/icons/help-octagon.svg" alt="help icon" />
    //     <span>Help & Support</span>
    //   </div>,
    //   key: '1',
    // },
    // {
    //   label: <div className="flex items-center justify-between">
    //     <img className='h-5 w-5 mr-[5px]' src="/icons/bookopen-icon.svg" alt="new icon" />
    //     <span>What's New?</span>
    //   </div>,
    //   key: '2',
    // },
    // {
    //   label: <div className="flex items-center justify-between">
    //     <img className='h-5 w-5 mr-[5px]' src="/icons/file-donwload.svg" alt="download icon" />
    //     <span>Download app</span>
    //   </div>,
    //   key: '0',
    // },
    // {
    //   label: <div className="flex items-center justify-between">
    //     <img className='h-5 w-5 mr-[5px]' src="/icons/help-octagon.svg" alt="help icon" />
    //     <span>Help & Support</span>
    //   </div>,
    //   key: '1',
    // },
    // {
    //   label: <div className="flex items-center justify-between">
    //     <img className='h-5 w-5 mr-[5px]' src="/icons/bookopen-icon.svg" alt="new icon" />
    //     <span>What's New?</span>
    //   </div>,
    //   key: '2',
    // },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onSettingClick}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-[5px]" />
          <span>Settings</span>
        </div>
      ),
      key: "2",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onDashboardClick}
        >
          <RiDashboard2Fill className="h-5 w-5 mr-[5px]"/>
          <span>Dashboard</span>
        </div>
      ),
      key: "3",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onRateUsClick}
        >
          <img
            className="h-5 w-5 mr-[5px]"
            src="/icons/single-star.svg"
            alt="star icon"
          />
          <span>Rate Us</span>
        </div>
      ),
      key: "4",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onReadMeClick}
        >
          <img
            className="h-5 w-5 mr-[5px]"
            src="/icons/star.svg"
            alt="star icon"
          />
          <span>Read Me</span>
        </div>
      ),
      key: "5",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onReportBugClick}
        >
          <img
            className="h-5 w-5 mr-[5px]"
            src="/icons/bug.svg"
            alt="bug icon"
          />
          <span>Report Bug</span>
        </div>
      ),
      key: "6",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onWhatsNewClick}
        >
          <MegaphoneIcon className="h-5 w-5 mr-[5px]"/>
          <span>What's new?</span>
        </div>
      ),
      key: "7",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onTutorialClick}
        >
          <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-[5px]" />
          <span>Tutorial</span>
        </div>
      ),
      key: "8",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onBillingClick}
        >
          <FaRegCreditCard className="h-5 w-5 mr-[5px]" />
          <span>Billing</span>
        </div>
      ),
      key: "9",
    },
    {
      label: (
        <div
          className="flex items-center"
          onClick={onDownloadExtension}
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-[5px]" />
          <span>Download Extension</span>
        </div>
      ),
      key: "10",
    },
    {
      label: (
        <div className="flex items-center" onClick={logout}>
          <img
            className="h-5 w-5 mr-[5px]"
            src="/icons/log-out.svg"
            alt="logout icon"
          />
          <span>Logout</span>
        </div>
      ),
      key: "11",
    },
  ]

  const settingItemsCollapsed = [
    // {
    //   label: <img className='h-5 w-5' src="/icons/file-donwload.svg" alt="download icon" />,
    //   key: '0',
    // },
    // {
    //   label: <img className='h-5 w-5' src="/icons/help-octagon.svg" alt="help icon" />,
    //   key: '1',
    // },
    // {
    //   label: <img className='h-5 w-5' src="/icons/bookopen-icon.svg" alt="new icon" />,
    //   key: '2',
    // },
    {
      label: <AdjustmentsHorizontalIcon className="h-5 w-5 mr-[5px]" onClick={onSettingClick} />,
      key: "2",
    },
    {
      label: <RiDashboard2Fill className="h-5 w-5 mr-[5px]" onClick={onDashboardClick} />,
      key: "3",
    },
    {
      label: <img className="h-5 w-5" src="/icons/single-star.svg" alt="star icon" onClick={onRateUsClick} />,
      key: "4",
    },
    {
      label: <img className="h-5 w-5" src="/icons/star.svg" alt="star icon" onClick={onReadMeClick} />,
      key: "5",
    },
    {
      label: (<img className="h-5 w-5" src="/icons/bug.svg" alt="bug icon" onClick={onReportBugClick}
      />
      ),
      key: "6",
    },
    {
      label: (<MegaphoneIcon className="h-5 w-5" onClick={onWhatsNewClick}
      />
      ),
      key: "7",
    },
    {
      label: (
        <ChatBubbleBottomCenterTextIcon className="h-5 w-5 mr-[5px]" onClick={onTutorialClick} />
      ),
      key: "8",
    },
    {
      label: (
        <ArrowDownTrayIcon className="h-5 w-5" onClick={onDownloadExtension} />
      ),
      key: "9",
    },
    {
      label: (<img className="h-5 w-5" src="/icons/log-out.svg" alt="logout icon" onClick={logout}
      />
      ),
      key: "10",
    },
  ]

  return (
    <>
      {collapsed ? (
        <div className="flex flex-col w-[50px] items-center justify-center h-fit bg-white border-2 border-solid border-[#E6F0FF] p-[0px] py-[5px]">
          <Avatar
            size="small"
            onClick={handleNavigateToProfile}
            // icon={<UserCircleIcon />}
            icon={session?.userProfileImage && session?.userProfileImage !== "null" ? <img className="object-scale-down" src={session?.userProfileImage} alt={session?.username} /> : <UserCircleIcon />}
            className="cursor-pointer mb-[5px]"
          />
          {session.userId && <Dropdown
            menu={{
              items: settingItemsCollapsed,
            }}
            placement="top"
            overlayClassName="dropdown-w-max-content"
            trigger={["click"]}
          >
            <Cog6ToothIcon className="h-5 w-5 cursor-pointer mb-[5px]" />
          </Dropdown>}
          {sidebarPosition === "right" ? (
            <ArrowLeftOnRectangleIcon
              className="h-5 w-5 cursor-pointer mb-[5px]"
              onClick={(e) => handlePositionChange(e, "left")}
            />
          ) : (
            <ArrowRightOnRectangleIcon
              className="h-5 w-5 cursor-pointer"
              onClick={(e) => handlePositionChange(e, "right")}
            />
          )}
          {session?.userId ? (
            <>
              {
                sidebarView === 'pinned' ?
                  <RiSideBarFill classNameh='h-5 w-5 text-[#337AE2]' onClick={(e) => handlePin(e, "auto_hide")}
                    style={{ cursor: 'pointer', height: '22px', width: '20px', color: '#337ae2' }}
                  />
                  :
                  <RiSideBarLine classNameh='h-5 w-5' onClick={(e) => handlePin(e, "pinned")}
                    style={{ cursor: 'pointer', height: '22px', width: '20px' }}
                  />
              }
            </>
          ) : (
            <>
              {
                pinedType === 'pinned' ?
                  <RiSideBarFill classNameh='h-5 w-5 text-[#337AE2]' onClick={(e) => handlePin(e, "auto_hide")}
                    style={{ cursor: 'pointer', height: '22px', width: '20px', color: '#337ae2' }}
                  />
                  :
                  <RiSideBarLine classNameh='h-5 w-5' onClick={(e) => handlePin(e, "pinned")}
                    style={{ cursor: 'pointer', height: '22px', width: '20px' }}
                  />
              }
            </>
          )}

        </div>
      ) : (
        <div className="flex items-center justify-between bg-white border-2 border-solid border-[#E6F0FF] py-[8px] px-[16px]">

          <div className="flex items-center mr-2 cursor-pointer" onClick={handleNavigateToProfile}>
            <Avatar
              size="small"
              icon={session?.userProfileImage && session?.userProfileImage !== "null" ? <img className="object-scale-down" src={session?.userProfileImage} alt={session?.username} /> : <UserCircleIcon />}
              className="mr-2 cursor-pointer"
              // onClick={handleNavigateToProfile}
            />
            <div className="flex flex-col items-start justify-start">
              <span className="text-[#062046] font-medium">
                {session?.username || "Sign in"}
              </span>
              {/* <span className="text-[#7C829C]">My account</span> */}
            </div>
          </div>

          <div className="flex items-center justify-center">
            {session.userId && <Dropdown
              menu={{
                items: settingItems,
              }}
              placement="top"
              overlayClassName="dropdown-w-max-content"
              trigger={["click"]}
            >
              <Cog6ToothIcon className="h-5 w-5 cursor-pointer" />
            </Dropdown>}

            {session?.userId ? (
              <>
                {
                  sidebarView === 'pinned' ?
                    <RiSideBarFill onClick={(e) => handlePin(e, "auto_hide")}
                      style={{ cursor: 'pointer', height: '22px', width: '20px', color: '#337ae2', margin: '0px 8px' }} />
                    :
                    <RiSideBarLine onClick={(e) => handlePin(e, "pinned")} style={{ cursor: 'pointer', height: '22px', width: '20px', margin: '0px 8px' }} />
                }
              </>
            ) : (
              <>
                {
                  pinedType === 'pinned' ?
                    <RiSideBarFill onClick={(e) => handlePin(e, "auto_hide")}
                      style={{ cursor: 'pointer', height: '22px', width: '20px', color: '#337ae2', margin: '0px 8px' }} />
                    :
                    <RiSideBarLine onClick={(e) => handlePin(e, "pinned")} style={{ cursor: 'pointer', height: '22px', width: '20px', margin: '0px 8px' }} />
                }
              </>
            )}



            {sidebarPosition === "right" ? (
              <ArrowLeftOnRectangleIcon
                className="h-5 w-5 cursor-pointer"
                onClick={(e) => handlePositionChange(e, "left")}
              />
            ) : (
              <ArrowRightOnRectangleIcon
                className="h-5 w-5 cursor-pointer"
                onClick={(e) => handlePositionChange(e, "right")}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Footer;
