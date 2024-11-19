import axios from "axios";
import { getActiveTabURL } from "./send-theme-to-chrome";
import session from "./session";

export const takeScreenshotOfGivenPage = (pageURL) => {
    return new Promise((resolve, reject) => {
        getActiveTabURL()
            .then((tab) => {
                if (tab.url === pageURL) {
                    window.chrome.tabs.sendMessage(tab.id, { type: "CT_CLOSE_PANEL" }).then((response) => {
                        window.chrome.tabs.captureVisibleTab(tab.windowId, { format : "png", quality : 100 }).then((image) => {
                            const payload = {
                                base64: image
                            }
                            window.chrome.tabs.sendMessage(tab.id, "CT_SHOW_CAPTURE_IMAGE_LOADER").then((res) => {
                                fetch(`${process.env.REACT_APP_API_URL}/api/upload-base64-img`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${session.token}`
                                    },
                                    body: JSON.stringify(payload)
                                })
                                .then(resp => {
                                    return resp.json()
                                })
                                .then(response => {
                                    window.chrome.tabs.sendMessage(tab.id, "CT_HIDE_CAPTURE_IMAGE_LOADER").then((res) => {
                                        window.chrome.tabs.sendMessage(tab.id, "toggle").then((res) => {
                                            resolve(response.message)
                                        })
                                    })
                                })
                                .catch(error => {
                                    resolve({ status: 400, message: "An error occured while taking screenshot of the page." })
                                });
                            })
                        })
                    })
                }
                else {
                    axios({ 
                        method: "POST",
                        url: `${process.env.REACT_APP_SCREENSHOT_URL}/take-screenshot`,
                        data: {
                            url: pageURL,
                            storageKey: `common/screenshots/${new Date().getTime()}.jpg`
                        }
                    })
                        .then((res) => {
                            if (res.data) {
                                resolve(res.data.screenshotUrl)
                            }
                            else {
                                resolve({ status: 400, message: "An error occured while taking screenshot of the page." });
                            }
                        })
                        .catch((error) => {
                            resolve({ status: 400, message: "An error occured while taking screenshot of the page." });
                        });
                }
            })
    });
}