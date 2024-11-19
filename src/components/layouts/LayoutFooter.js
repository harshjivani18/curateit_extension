// import React, { useEffect, useState }           from 'react'
import React, { useState }                      from 'react'

import { useDispatch, useSelector }             from "react-redux"
import { useNavigate }                          from 'react-router-dom'
import { MoonIcon, SunIcon, BookOpenIcon,
         ArrowPathIcon }                        from '@heroicons/react/24/outline'
import { Tooltip }                              from 'antd';

// import {  Badge, Tooltip }                      from 'antd';

import ToggleWithLabel                          from '../toggleWithLabel/ToggleWithLabel'
import Button                                   from '../Button/Button'
import { sendThemeToChrome }                    from '../../utils/send-theme-to-chrome';
import { fetchCurrentTab }                      from '../../utils/fetch-current-tab'

import { setWebsiteThemeMode, updateUser }      from '../../actions/user'
// import { getAllHighlights }                     from '../../actions/highlights'
// import { getAllCodes }                          from '../../actions/code'
// import { getAllImages }                         from '../../actions/image'

const LayoutFooter = (props) => {
    const { 
        toggleLabel,
        showOnlyButton,
        processing,
        onButtonClick,
        showSubmitBtn,
        buttonLabelText
    }                       = props
    const navigate          = useNavigate()
    const dispatch          = useDispatch()

    const themeMode         = useSelector((state) => state.user.themeMode)
    // const pageHighlights    = useSelector((state) => state.highlights.highlights);
    // const pageCodes         = useSelector((state) => state.codes.codes);
    // const pageImages        = useSelector((state) => state.images.images);
    const tabDetails        = useSelector((state) => state.app.tab)
    const isSyncing         = useSelector((state) => state.app.isSyncing)
    // const highlightsLength  = (pageHighlights && pageHighlights[0]?.media && pageHighlights[0]?.media?.length) || 0
    // const codesLength       = (pageCodes && pageCodes[0]?.media && pageCodes[0]?.media?.length) || 0
    // const imagesLength      = (pageImages && pageImages.length) || 0
    
    const [isProcessDone, setProcessStatus]   = useState(true)
    const [mode, setThemeMode]                = useState(themeMode)
    const [modeState,setModeState]            = useState(false)

    // useEffect(() => {
    //     const getCall = async () => {
    //         const tabObj        = tabDetails || await fetchCurrentTab()
    //         if (tabObj) {
    //           if (highlightsLength === 0) await dispatch(getAllHighlights(tabObj.url))
    //           if (codesLength === 0) await dispatch(getAllCodes(tabObj.url))
    //           if (imagesLength === 0) await dispatch(getAllImages(tabObj.url))
    //         }
    //     }
        
    //     getCall()
    // }, [])

    const onModeChange = async (e) => {
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
        if (res.error === undefined) {
            sendThemeToChrome(!isDark, "From Button", tabDetails || await fetchCurrentTab())
            setThemeMode(m)
            dispatch(setWebsiteThemeMode(m))
        }
        setProcessStatus(true)
        return false
    }

    // const onHoverMode =(e)=>{
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if(mode === "light" && !modeState){
    //         setThemeMode("dark")
    //     }
    //     else if(mode === "dark" && !modeState){
    //         setThemeMode("light")
    //     }
    //     setModeState(true)
    // }

    // const onModeLeave = (e) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     if(mode === "light" && modeState){
    //         setThemeMode("dark")
    //     }
    //     else if(mode === "dark" && modeState){
    //         setThemeMode("light")
    //         setModeState(false)
    //     }
    //     setModeState(false)
    // }

    const onReaderViewClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const tabObj = tabDetails || await fetchCurrentTab()
        if (tabObj) {
            window.chrome.tabs.sendMessage(tabObj.id, { type: "READER_VIEW", value: true })
        }
        return false
    }

    const renderOnlyButton = () => {
        return (
            <div className='flex justify-between items-center'>
                <div className='flex justify-between items-center fixed mb-10'>
                    <div>
                        <Button variant="primary small text-xs" onClick={onButtonClick}>
                            {processing ? 'Loading' : `Save to collection`}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const renderSync = () => {
        return (
            <div className='flex justify-end items-center main-footer'>
                <ArrowPathIcon className='arrow-icon' />
                Syncing ...
            </div>
        )
    }

    const renderOtherOptions = () => {
        return (
            <div className={"footer-btn-container"}>
                <div className='footer-btns'>
                    {toggleLabel !== undefined && toggleLabel !== "" && <div className='flex-1 flex justify-end items-center gap-4'>
                        <ToggleWithLabel label={toggleLabel} />
                    </div>}
                    {/* <Tooltip title="Highlight">
                        <Badge count={highlightsLength + codesLength + imagesLength}>
                        <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={() => navigate("/all-highlights")}>
                            <img className='h-5 w-5' src="/icons/pencil-icon.svg" alt="pencil icon" />
                        </button>
                        </Badge>
                    </Tooltip> */}
                    {/* <Tooltip title="Screenshot">
                        <button className='bg-[#FFFFFF] p-[2px] rounded-sm'>
                        <img className='h-8 w-8' src="/icons/screenshot.svg" alt="screenshot icon" />
                        </button>
                    </Tooltip> */}
                    {/* <Tooltip title="curateAI">
                        <button className='bg-[#FFFFFF] p-[2px] rounded-sm'>
                            <img className='h-8 w-8' src="/icons/robbot.svg" alt="robot icon" />
                        </button>
                    </Tooltip> */}
                    <Tooltip title="Reader’s view">
                        <button className='bg-[#F8FBFF] p-[2px] rounded-sm' onClick={onReaderViewClick}>
                            <BookOpenIcon className='h-5 w-5' />
                        </button>
                    </Tooltip>
                    <Tooltip title="Save tabs" placement='left'>
                        <button className='flex justify-start items-center bg-[#FFFFFF] p-[2px] rounded-sm' onClick={() => navigate("/save-tabs")}>
                            <img src="/icons/Tabs-plus-01.svg" alt="tab icon" className='h-5 w-5' />
                        </button>
                    </Tooltip>
                    {!(showSubmitBtn === false) && <button className='bg-[#347AE2] p-2 rounded-md text-xs text-white' disabled={processing} onClick={onButtonClick ? onButtonClick : () => navigate("/select-collection")}>
                        {processing ? 'Loading...' : buttonLabelText !== undefined && buttonLabelText !== "" ? `Save ${buttonLabelText}` : "Save"}
                    </button>}
                </div>
            </div>
        )
    }

    if (showOnlyButton) return renderOnlyButton()
    return (
        <div className='flex justify-between items-center main-footer'>
            <div>
                <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'} placement="right">
                    <button onClick={onModeChange} disabled={!isProcessDone}>
                        {mode === 'dark' ? <MoonIcon className='h-6 w-6 text-gray-700' />  : <SunIcon className='h-6 w-6 text-gray-700' />}
                    </button>
                </Tooltip>
            </div>
            {isSyncing ? renderSync() : renderOtherOptions()}
        </div>
    )
}

export default LayoutFooter

