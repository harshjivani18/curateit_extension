import "./ScreenshotOptionPage.css"
import React, { useState }              from "react";
import { Modal }                        from "antd";

import LayoutCommon                     from "../../components/commonLayout/LayoutCommon";
import { fetchCurrentTab }              from "../../utils/fetch-current-tab";
import { sendCaptureFullPageToChrome,
         sendCaptureSelectionToChrome,
        sendCaptureVisibleTabToChrome}  from "../../utils/screenshot-msgs";  

const ScreenshotsOptionPage = () => {

    const [showModal, setShowModal] = useState(false);

    const handleModalOpen = () => {
        setShowModal(true);
    }

    const handleOk = async () => {
        // Process to capture full screen
        sendCaptureFullPageToChrome(await fetchCurrentTab())
        setShowModal(false);
    }

    const handleCancel = () => {
        setShowModal(false);
    }

    const handleCaptureSelection = async () => {
        sendCaptureSelectionToChrome(await fetchCurrentTab())
    }

    const handleCaptureVisibleTab = async () => {
        sendCaptureVisibleTabToChrome(await fetchCurrentTab())
    }

    return (
        <LayoutCommon>
            <div id="tab-screenshot" className="video_tab_option screenshot_tab-option active in">
                <ul>
                    <li>

                        <label className="form-check-label cursor-pointer" onClick={handleModalOpen}>
                            <div className="video_tab_img">
                                <div className="video-tab-dark">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="40" viewBox="0 0 41 40" fill="none">
                                        <path
                                            d="M7.00258 26.6667H33.6693V8.33333H7.00258V26.6667ZM22.0026 30V33.3333H28.6693V36.6667H12.0026V33.3333H18.6693V30H5.32225C4.40933 30 3.66925 29.2518 3.66925 28.3208V6.67913C3.66925 5.75178 4.4281 5 5.32225 5H35.3496C36.2626 5 37.0026 5.7482 37.0026 6.67913V28.3208C37.0026 29.2482 36.2437 30 35.3496 30H22.0026Z"
                                            fill="#062046" />
                                    </svg>
                                </div>
                                {/* <div className="video-tab-light">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="40" viewBox="0 0 41 40" fill="none">
                                        <path
                                            d="M7.00258 26.6667H33.6693V8.33333H7.00258V26.6667ZM22.0026 30V33.3333H28.6693V36.6667H12.0026V33.3333H18.6693V30H5.32225C4.40933 30 3.66925 29.2518 3.66925 28.3208V6.67913C3.66925 5.75178 4.4281 5 5.32225 5H35.3496C36.2626 5 37.0026 5.7482 37.0026 6.67913V28.3208C37.0026 29.2482 36.2437 30 35.3496 30H22.0026Z"
                                            fill="#347ae2" />
                                    </svg>
                                </div> */}
                            </div>
                            <span className="video_tab_name">Full Screen</span>
                        </label>
                    </li>
                    <li >

                        <label className="form-check-label cursor-pointer" onClick={() => handleCaptureSelection()} >
                            <div className="video_tab_img">
                                <div className="video-tab-dark">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M5.16667 5H35.1667C36.0872 5 36.8333 5.7462 36.8333 6.66667V33.3333C36.8333 34.2538 36.0872 35 35.1667 35H5.16667C4.2462 35 3.5 34.2538 3.5 33.3333V6.66667C3.5 5.7462 4.2462 5 5.16667 5ZM6.83333 8.33333V31.6667H33.5V8.33333H6.83333Z"
                                            fill="#062046" />
                                        <path
                                            d="M23 13.25H27.5V17.75H26V14.75H23V13.25ZM12.5 13.25H17V14.75H14V17.75H12.5V13.25ZM26 25.25V22.25H27.5V26.75H23V25.25H26ZM14 25.25H17V26.75H12.5V22.25H14V25.25Z"
                                            fill="#062046" />
                                    </svg>
                                </div>
                                {/* <div className="video-tab-light">
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M5.16667 5H35.1667C36.0872 5 36.8333 5.7462 36.8333 6.66667V33.3333C36.8333 34.2538 36.0872 35 35.1667 35H5.16667C4.2462 35 3.5 34.2538 3.5 33.3333V6.66667C3.5 5.7462 4.2462 5 5.16667 5ZM6.83333 8.33333V31.6667H33.5V8.33333H6.83333Z"
                                            fill="#347ae2" />
                                        <path
                                            d="M23 13.25H27.5V17.75H26V14.75H23V13.25ZM12.5 13.25H17V14.75H14V17.75H12.5V13.25ZM26 25.25V22.25H27.5V26.75H23V25.25H26ZM14 25.25H17V26.75H12.5V22.25H14V25.25Z"
                                            fill="#347ae2" />
                                    </svg>
                                </div> */}
                            </div>
                            <span className="video_tab_name">Selected area</span>
                        </label>
                    </li>
                    <li >
                        <label className="form-check-label cursor-pointer" onClick={() => handleCaptureVisibleTab()}>
                            <div className="video_tab_img">
                                {/* <div className="video-tab-dark">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" id="tab"><path fill="none" d="M0 0h24v24H0V0zm0 0h24v24H0V0z"></path><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h9v3c0 .55.45 1 1 1h7v9c0 .55-.45 1-1 1z"></path></svg>
                                </div> */}
                                <div className="video-tab-light">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" id="tab"><path fill="none" d="M0 0h24v24H0V0zm0 0h24v24H0V0z"></path><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H4c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h9v3c0 .55.45 1 1 1h7v9c0 .55-.45 1-1 1z"></path></svg>
                                </div>
                            </div>
                            <span className="video_tab_name">Visible Tab</span>
                        </label>
                    </li>
                </ul>
            </div>
            {showModal && (
                <Modal title="Info!" open={showModal} onOk={handleOk} onCancel={handleCancel} okType="primary" className="ct-ant-modal">
                    Please do not scroll or move your mouse while capturing to get the best results.
                    To stop capturing screenshot click anywhere on the page.
                </Modal>
            )}
        </LayoutCommon>
    )
}

export default ScreenshotsOptionPage