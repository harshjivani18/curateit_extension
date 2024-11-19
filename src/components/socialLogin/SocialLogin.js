/*global chrome*/
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"
import { setSocialLogin } from "../../actions/login";
import { sendEnableFloatCodeMenuToChrome, sendEnableFloatImageMenuToChrome, sendSidebarPositionToChrome, sendSidebarViewType, sendThemeToChrome } from '../../utils/send-theme-to-chrome';
import { setWebsiteThemeMode, fetchUserDetails } from '../../actions/user';
import { updateMostVisitedApps,
         getSidebarOrder } from '../../actions/customApplication';
import session from '../../utils/session';
import { fetchCurrentTab } from '../../utils/fetch-current-tab'
import { getSharedCollections } from '../../actions/collection'
import { updateLocation } from '../../utils/update-location';
import  { setUserInformation,
          setDefaultCurateit } from '../../actions/login'
import { getAllHighlights } from '../../actions/highlights'
import { getVisitedHistory,
      setWebappStorage } from '../../utils/message-operations';
import { syncBookmarks } from '../../utils/sync-bookmarks';

const SocialLogin = () => {
      const dispatch = useDispatch();
      const navigate = useNavigate();

      const tabDetails = useSelector((state) => state.app.tab)

      useEffect(() => {
            window.addEventListener("message", onWindowListenMessage)
            return () => {
                  window.removeEventListener("message", onWindowListenMessage) 
            }
      })

      const onWindowListenMessage = async (e) => {
            if (!e.data || e.data.includes('MENU')) return;
            if (e.data && !e.data.startsWith("?")) {
                  const obj         = JSON.parse(e.data)
                  const uDetails    = obj.userDetails ? JSON.parse(obj.userDetails) : {}
                  if (obj.isSignedIn) {
                        if (uDetails.user?.isNewlyCreated) {
                              dispatch(setSocialLogin(uDetails));
                              navigate("/");
                              const updateUser = await dispatch(setUserInformation())
                              // await dispatch(setDefaultCurateit())
                              const sites = await getVisitedHistory()
                              await dispatch(getSidebarOrder())
                              await dispatch(getSharedCollections())
                              await dispatch(updateMostVisitedApps(sites))
                              // const resUser = await dispatch(fetchUserDetails())
                              const bio_collection = updateUser.payload.data.bio_collection
                              
                              chrome.storage.sync.set({
                                userData: {
                                  token: session.token,
                                  username: session.username,
                                  unfilteredCollectionId:
                                    session.unfiltered_collection_id,
                                  apiUrl: process.env.REACT_APP_API_URL,
                                  userId: session.userId,
                                  webappURL: process.env.REACT_APP_WEBAPP_URL,
                                  bioCollectionId: bio_collection,
                                  iframelyApi:
                                    process.env.REACT_APP_IFRAMELY_API_KEY,
                                  showImageMenu:
                                    uDetails?.user?.preferences
                                      ?.show_image_option === true
                                      ? "SHOW"
                                      : "HIDE",
                                  showCodeMenu:
                                    uDetails?.user?.preferences
                                      ?.show_code_option === true
                                      ? "SHOW"
                                      : "HIDE",
                                  showHighlightMenu:
                                    uDetails?.user?.preferences
                                      ?.show_highlight_option === false
                                      ? "HIDE"
                                      : "SHOW",
                                },
                              });
                              const tObj     = tabDetails || await fetchCurrentTab()
                              window.chrome.tabs.sendMessage(tObj.id, { type: "USER_LOGIN" })
                              const isSynced = uDetails?.user?.is_bookmark_sync
                              session.setIsBookmarkSynced(isSynced)
                              if (isSynced === true) {
                                    window.chrome.storage.local.remove("defaultBookmarks")
                              }
                              else {
                                    window.chrome.storage.local.get(["defaultBookmarks"], (result) => {
                                          if (result.defaultBookmarks) {
                                                syncBookmarks(result.defaultBookmarks, isSynced, navigate);
                                          }
                                    })
                              }

                              const imageOpt = uDetails.user?.preferences?.show_image_option === true ? 'SHOW' : 'HIDE'
                              sendEnableFloatImageMenuToChrome(imageOpt, tObj)
                              const codeOpt = uDetails.user?.preferences?.show_code_option === true ? "SHOW" : "HIDE"
                              sendEnableFloatCodeMenuToChrome( codeOpt, tObj)
                              sendSidebarPositionToChrome( uDetails.user?.preferences?.sidebar_position || 'right', tObj)
                              sendSidebarViewType(uDetails.user?.preferences?.sidebar_view || 'auto_hide', tObj)
                              session.setSidebarView(uDetails.user?.preferences?.sidebar_view || 'auto_hide')
                              await setWebappStorage(uDetails, true);
                        }
                        else if (uDetails.user) {
                              const isSynced = uDetails?.user?.is_bookmark_sync
                              session.setIsBookmarkSynced(isSynced)
                              if (isSynced === true) {
                                    // window.chrome.storage.local.remove("defaultBookmarks")
                              }
                              else {
                                    window.chrome.storage.local.get(["defaultBookmarks"], (result) => {
                                          if (result.defaultBookmarks) {
                                                syncBookmarks(result.defaultBookmarks, isSynced, navigate);
                                          }
                                    })
                              }
                              dispatch(setSocialLogin(uDetails));
                              await dispatch(getSidebarOrder())
                              await dispatch(getSharedCollections())
                              navigate("/search-bookmark");
                              const resUser = await dispatch(fetchUserDetails())
                              const tObj     = tabDetails || await fetchCurrentTab()
                              const response = await dispatch(getAllHighlights(tObj.url))
                              if(response.error === undefined && response.payload && response.payload.data && response.payload.data.length>0){
                                    const highlighData = response.payload.data
                                    window.chrome.tabs.sendMessage(tObj.id, { value: JSON.stringify(highlighData), type: "CT_HIGHLIGHT_DATA" })
                              }
                              session.setEmail(uDetails.user?.email);
                              session.setPassword(uDetails.user?.password);
                              sendThemeToChrome(uDetails.user?.preferences?.theme?.isDark || false, "Login Form", tabDetails || await fetchCurrentTab())
                              dispatch(setWebsiteThemeMode(uDetails.user?.preferences?.theme?.mode))
                              chrome.storage.sync.set({
                                userData: {
                                  token: session.token,
                                  userId: session.userId,
                                  username: session.username,
                                  unfilteredCollectionId:
                                    session.unfiltered_collection_id,
                                  apiUrl: process.env.REACT_APP_API_URL,
                                  webappURL: process.env.REACT_APP_WEBAPP_URL,
                                  iframelyApi:
                                    process.env.REACT_APP_IFRAMELY_API_KEY,
                                  imagesCdn:
                                    process.env.REACT_APP_STATIC_IMAGES_CDN,
                                  showImageMenu:
                                    resUser?.payload?.data?.preferences
                                      ?.show_image_option === true
                                      ? "SHOW"
                                      : "HIDE",
                                  showCodeMenu:
                                    resUser?.payload?.data?.preferences
                                      ?.show_code_option === true
                                      ? "SHOW"
                                      : "HIDE",
                                  showHighlightMenu:
                                    resUser?.user?.preferences
                                      ?.show_highlight_option === false
                                      ? "HIDE"
                                      : "SHOW",
                                },
                              });
                                    //SET COOKIES FOR WEB APP
                              chrome.cookies.set({
                                    url: process.env.REACT_APP_WEBAPP_URL,
                                    name: 'curateittoken',
                                    value: session.token
                              })
                              // document.cookie = `curateittoken=${session.token};domain=${process.env.REACT_APP_WEBAPP_URL}`
                              updateLocation(window.location.search, tObj, navigate, [])
                              window.chrome.tabs.sendMessage(tObj.id, { type: "USER_LOGIN" })

                              const imageOpt = resUser?.payload?.data?.preferences?.show_image_option === true ? 'SHOW' : 'HIDE'
                              sendEnableFloatImageMenuToChrome(imageOpt, tObj)
                              const codeOpt = resUser?.payload?.data?.preferences?.show_code_option === true ? "SHOW" : "HIDE"
                              sendEnableFloatCodeMenuToChrome( codeOpt, tObj)
                              sendSidebarPositionToChrome( resUser?.payload?.data?.preferences?.sidebar_position || 'right', tObj)
                              sendSidebarViewType(resUser?.payload?.data?.preferences?.sidebar_view || 'auto_hide', tObj)
                              session.setSidebarView(resUser?.payload?.data?.preferences?.sidebar_view || 'auto_hide')
                              await setWebappStorage(uDetails)    
                        }
                        else {
                              navigate("/login")
                        }
                  }
                  else {
                        navigate("/login")
                  }
            }
      }

      const onLogin = (e, url) => {
            window.open(url, window.location.href, 'height=500, width=500, modal=yes')
      }

      return (
            <div className='flex justify-evenly py-4' id="social-container">
                  <button onClick={(e) => onLogin(e, `${process.env.REACT_APP_API_URL}/api/connect/google`)}>
                        <div className='h-[48px] w-[48px] bg-white flex justify-center [align-items:center] rounded-xl hover:border-2 hover:border-blue-300'>
                              <img className="h-[21px]" src="/icons/google.png" alt="google" />
                        </div>
                  </button>
                  <button onClick={(e) => onLogin(e, `${process.env.REACT_APP_API_URL}/api/connect/linkedin`)}>
                        <div className='h-[48px] w-[48px] bg-white flex justify-center [align-items:center] rounded-xl hover:border-2 hover:border-blue-300'>
                              <img className="h-[21px]" src="/icons/linkedin.png" alt="linkedin" />
                        </div>
                  </button>
                  {/* <a onClick={(e) => onLogin(e, `${process.env.REACT_APP_API_URL}/api/connect/facebook`)}>
                        <div className='h-[48px] w-[48px] bg-white flex justify-center [align-items:center] rounded-xl hover:border-2 hover:border-blue-300'>
                              <img className="h-[21px]" src="/icons/facebook.png" alt="facebook" />
                        </div>
                  </a> */}
                  <button onClick={(e) => onLogin(e, `${process.env.REACT_APP_API_URL}/api/connect/twitter`) }>
                        <div className='h-[48px] w-[48px] bg-white flex justify-center [align-items:center] rounded-xl hover:border-2 hover:border-blue-300'>
                              <img className="h-[21px]" src="/icons/twitter.png" alt="twitter" />
                        </div>
                  </button>
             
            </div>
      )
}

export default SocialLogin