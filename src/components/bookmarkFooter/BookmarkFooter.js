/*global chrome*/
import React, { useState } from 'react'
import Button from '../Button/Button'
import ToggleWithLabel from '../toggleWithLabel/ToggleWithLabel'
import { BookOpenIcon } from "@heroicons/react/24/outline"
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
// import { BiDotsVerticalRounded } from "react-icons/bi"
import { useNavigate } from 'react-router-dom'
// import MenuList from '../menuList/MenuList'
// import { Menu } from '@headlessui/react'
// import { useTheme } from '../../hooks/useTheme'
// import session from '../../utils/session'
import { sendThemeToChrome } from '../../utils/send-theme-to-chrome';
import { setWebsiteThemeMode, updateUser } from '../../actions/user'
// import { toggleDarkMode } from '../../utils/toggle-dark-mode';
import { useDispatch, useSelector } from "react-redux";

// import {  Badge, Tooltip } from 'antd';
import {  Tooltip } from 'antd';
// import { getAllHighlights } from '../../actions/highlights'
// import { getAllCodes } from '../../actions/code'
// import { getAllImages } from '../../actions/image'
// import { getAllHighlights } from '../../actions/highlights'
// import { getAllCodes } from '../../actions/code'
// import { getAllImages } from '../../actions/image'
// import session from '../../utils/session'
const BookmarkFooter = ({ page, hideSync = false, numberOfTabs = 0, footerMenuList, submitHandler, loading}) => {
  const navigate = useNavigate()
  const dispatch    = useDispatch();
  // const { theme, setTheme } = useTheme();
  const themeMode            = useSelector((state) => state.user.themeMode)
  const [ isProcessDone, setProcessStatus] = useState(true)
  const [mode, setThemeMode] = useState(themeMode)
  // const [modeState,setModeState] =useState(false)

  // const pageHighlights       = useSelector((state) => state.highlights.highlights);
  // const pageCodes            = useSelector((state) => state.codes.codes);
  // const pageImages       = useSelector((state) => state.images.images);

  // const pageHighlightsLength = (pageHighlights && pageHighlights[0]?.media && pageHighlights[0]?.media?.length) || 0
  // const pageCodesLength = (pageCodes && pageCodes[0]?.media && pageCodes[0]?.media?.length) || 0
  // const pageImagesLength = (pageImages && pageImages.length) || 0

  // useEffect(() => {
  //   const getCall = async () => {
  //       const tabs        = await window.chrome.tabs.query({ active: true, currentWindow: true })
  //       if (tabs.length !== 0) {
  //         await dispatch(getAllHighlights(tabs[0].url))
  //         await dispatch(getAllCodes(tabs[0].url))
  //         await dispatch(getAllImages(tabs[0].url))
  //       }
  //   }

  //   getCall()
  // },[])


  const setSiteMode = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const isDark = themeMode === "dark"
    const m      = isDark ? "light" : "dark"

    setProcessStatus(false)
    const res    = await dispatch(updateUser({
      preferences: {
        theme: {
          mode: m,
          isDark: !isDark
        }
      }
    }))
    // session.setMode(m)
    if (res.error === undefined) {
      sendThemeToChrome(!isDark, "From Button")
      dispatch(setWebsiteThemeMode(m))
      setThemeMode(m)
    }

    setProcessStatus(true)
    return false
    // toggleDarkMode(isDark)
  }
//   const mouseEnter =(e)=>{
//     e.preventDefault();
//     e.stopPropagation();
//     if(mode === "light" && !modeState){
//     setThemeMode("dark")
//     }else if(mode === "dark" && !modeState){
//       setThemeMode("light")
//     }
//     setModeState(true)
//   }
// const mouseLeave = (e) => {
//   e.preventDefault();
//   e.stopPropagation();
//   if(mode === "light"&& modeState){
//     setThemeMode("dark")
//   }else if(mode === "dark"&& modeState){
//     setThemeMode("light")
//     setModeState(false)
//   }
//   setModeState(false)
// }

  const handleReader = async() =>{
    const tabs = await window.chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs.length !== 0) {
      window.chrome.tabs.sendMessage(tabs[0].id, { type: "READER_VIEW", value: true })
    }
  }

  return (
    <>
      {
        page === 'search-bookmark' ? 
        <div className='flex justify-between items-cente'>
          <div>
            <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'} placement="right">
              <button onClick={(e) => setSiteMode(e)} disabled={!isProcessDone}>
                {mode === 'dark' ? <MoonIcon className='h-6 w-6 text-gray-700' />  : <SunIcon className='h-6 w-6 text-gray-700' />}
              </button>
            </Tooltip>
          </div>
            <div className='flex-1 flex justify-end items-center gap-4'>
              {/* <Tooltip title="Highlight">
                <Badge count={pageHighlightsLength + pageCodesLength + pageImagesLength}>
                  <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={() => navigate("/all-highlights")}>
                    <img className='h-5 w-5' src="/icons/pencil-icon.svg" alt="pencil icon" />
                  </button>
                </Badge>
              </Tooltip> */}
              <Tooltip title="Screenshot">
                <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                >
                  <img className='h-8 w-8' src="/icons/screenshot.svg" alt="screenshot icon" />
                </button>
              </Tooltip>
              {/* <Tooltip title="curateAI">
                <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                >
                  <img className='h-8 w-8' src="/icons/robbot.svg" alt="robot icon" />
                </button>
              </Tooltip> */}
              <Tooltip title="Reader’s view">
                <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={handleReader}>
                  <BookOpenIcon className='h-5 w-5' />
                </button>
              </Tooltip>
              <Tooltip title="Save tabs">
                <button className='flex justify-start items-center bg-[#FFFFFF] p-[2px] rounded-sm' onClick={() => navigate("/save-tabs")}>
                  <img src="/icons/Tabs-plus-01.svg" alt="tab icon" className='h-5 w-5' />
                </button>
              </Tooltip>
              {
                numberOfTabs > 0 && (
                  <button className='bg-[#347AE2] p-2 rounded-md text-xs text-white' onClick={() => navigate("/select-collection")}>
                    {loading ? 'Loading...' : `Save ${numberOfTabs} tabs`}
                  </button>
                )
              }
            </div>
        </div> 
          : page === 'highlights' ? 
          <div className='flex justify-between items-center'>
                <button onClick={(e) => setSiteMode(e)} disabled={!isProcessDone}>
                  {themeMode === 'dark' ? <MoonIcon className='h-6 w-6 text-gray-700' /> : <SunIcon className='h-6 w-6 text-gray-700' />}
                </button>
                    <div className='flex-1 flex justify-end items-center gap-4'>
                  <Tooltip title="Screenshot">
                    <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                    >
                      <img className='h-8 w-8' src="/icons/screenshot.svg" alt="screenshot icon" />
                    </button>
                  </Tooltip>
                  <Tooltip title="curateAI">
                    <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                    >
                      <img className='h-8 w-8' src="/icons/robbot.svg" alt="robot icon" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Reader’s view">
                    <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={handleReader}>
                      <BookOpenIcon className='h-5 w-5' />
                    </button>
                  </Tooltip>
                  <Tooltip title="Save tabs">
                    <button className='flex justify-start items-center bg-[#FFFFFF] p-[2px] rounded-sm' onClick={() => navigate("/save-tabs")}>
                      <img src="/icons/Tabs-plus-01.svg" alt="tab icon" className='h-5 w-5' />
                    </button>
                  </Tooltip>
                  <button className='bg-[#347AE2] p-2 rounded-md text-xs text-white' onClick={submitHandler}>
                    {loading ? 'Loading' : `Save`}
                  </button>
                </div>
          </div>
          : 
           page === 'save-tabs' ? 
           <div className='flex justify-between items-center'>
                    <button onClick={(e) => setSiteMode(e)} disabled={!isProcessDone}>
                      {themeMode === 'dark' ? <MoonIcon className='h-6 w-6 text-gray-700' /> : <SunIcon className='h-6 w-6 text-gray-700' />}
                    </button>
                    <div>
                      {!hideSync && <ToggleWithLabel label="Bookmark Sync" />}
                    </div>
                    <div className='flex-1 flex justify-end items-center gap-4'>
                      
                      {/* <Tooltip title="Highlight">
                        <Badge count={pageHighlightsLength + pageCodesLength + pageImagesLength}>
                        <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={() => navigate("/all-highlights")}>
                          <img className='h-5 w-5' src="/icons/pencil-icon.svg" alt="pencil icon" />
                        </button>
                        </Badge>
                      </Tooltip> */}
                      {/* <Tooltip title="Screenshot">
                        <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                        >
                          <img className='h-8 w-8' src="/icons/screenshot.svg" alt="screenshot icon" />
                        </button>
                      </Tooltip> */}
                      {/* <Tooltip title="curateAI">
                        <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                        >
                          <img className='h-8 w-8' src="/icons/robbot.svg" alt="robot icon" />
                        </button>
                      </Tooltip> */}
                      <Tooltip title="Reader’s view">
                        <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={handleReader}>
                          <BookOpenIcon className='h-5 w-5' />
                        </button>
                      </Tooltip>
                      {/* <button className='bg-[#FFFFFF] p-[2px] rounded-sm'>
                        <img className='h-5 w-5' src="/icons/link-external.svg" alt="pencil icon" />
                      </button> */}
                      {
                        numberOfTabs > 0 && (
                          <button className='bg-[#347AE2] p-2 rounded-md text-xs text-white' onClick={submitHandler}>
                            {loading ? 'Loading' : `Save ${numberOfTabs} tabs`}
                          </button>
                        )
                      }
                    </div>
           </div> 
            : 
            (page === 'highlightPanel' || page === 'codeSnippetPanel') ?
            <div className='flex justify-between items-center fixed mb-10'>
              <div>
                <Button variant="primary small text-xs" onClick={submitHandler}>
                  {loading ? 'Loading' : `Save to collection`}
                </Button>
              </div>
            </div >
            : 
            <div className='flex justify-between items-center fixed mb-10 bg-white'>
                      <button onClick={(e) => setSiteMode(e)} disabled={!isProcessDone}>
                        { themeMode === 'dark' ? <MoonIcon className='h-6 w-6 text-gray-700' /> : <SunIcon className='h-6 w-6 text-gray-700' />}
                      </button>
                      {/* <button className='flex justify-start items-center bg-[#FFFFFF] p-1 rounded-sm' onClick={() => navigate("/save-tabs")}> */}
                      {/* <img src="/icons/Tabs-plus-01.svg" alt="tab icon" className='h-4' /> */}
                      {/* <span className='ml-1 text-xs'>Add tabs</span> */}
                      {/* </button> */}
                      <div className='px-5 flex-1 flex justify-end items-center gap-4 ml-5'>
                        <Tooltip title="Save tabs">
                          <button className='flex justify-start items-center bg-[#FFFFFF] p-[2px] rounded-sm' onClick={() => navigate("/save-tabs")}>
                            <img src="/icons/Tabs-plus-01.svg" alt="tab icon" className='h-5 w-5' />
                          </button>
                        </Tooltip>
                        {/* <Tooltip title="Highlight">
                          <Badge count={pageHighlightsLength + pageCodesLength + pageImagesLength}>
                          <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={() => navigate("/all-highlights")}>
                            <img className='h-5 w-5' src="/icons/pencil-icon.svg" alt="pencil icon" />
                          </button>
                          </Badge>
                        </Tooltip> */}
                        <Tooltip title="Screenshot">
                          <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                          >
                            <img className='h-8 w-8' src="/icons/screenshot.svg" alt="screenshot icon" />
                          </button>
                        </Tooltip>
                        <Tooltip title="curateAI">
                          <button className='bg-[#FFFFFF] p-[2px] rounded-sm'
                          >
                            <img className='h-8 w-8' src="/icons/robbot.svg" alt="robot icon" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Reader’s view">
                          <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={handleReader}>
                            <BookOpenIcon className='h-5 w-5' />
                          </button>
                        </Tooltip>
                      </div>
                      <div className='ml-2'>
                        <Button variant="primary small text-xs" onClick={submitHandler}>
                          {loading ? 'Loading' : `Save to collection`}
                        </Button>
                      </div>
            </div >
      }
    </>
  )
}
export default BookmarkFooter