import { getDomain }    from 'tldts'

const getActiveTabURL = () => {
    return new Promise((resolve, reject) => {
        window.chrome.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
            if (tabs.length !== 0) {
                resolve(tabs[0])
            }
            reject(null)
        })
    })
}

export const openProperPage = async () => {
    const tab = await getActiveTabURL()
    await window.chrome.tabs.sendMessage(tab.id, { type: "CT_OPEN_PROPER_PAGE"})
}

export const getRecentURLDetails = async () => {
    const tab = await getActiveTabURL()
    await window.chrome.tabs.sendMessage(tab.id, { type: "CT_UPDATE_RECENT_URL_DETAILS"})
}

export const getAudioMediaStream =  ()=>{
    return new Promise((resolve, reject) => { 
        getActiveTabURL().then((tab) => { 
            window.chrome.tabs.sendMessage(tab.id, { type: "FETCH_TAB_AUDIO_STREAM" }, (res) => {
              resolve(res)
            })
        })
   })
}

export const getCurrentWindowURL = () => {
    return new Promise((resolve, reject) => {
        window.chrome.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
            if (tabs.length !== 0) {
                resolve(tabs[0])
            }
            reject(null)
        })
    })
}

export const copyText = async (text) => {
    const tab = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tab.id, { type: "COPY_TEXT", copyImgText: text }, (res) => {
        if (window.chrome.runtime.lastError) {
            console.log("Error Happended!", res)
        }
        return true
    })
}

export const popMessage = async (text) => {
    const tab = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tab.id, { type: "CT_SHOW_MESSAGE", text }, (res) => {
        if (window.chrome.runtime.lastError) {
            console.log("Error Happended!", res)
        }
        return true
    })
}

export const panelClose = async () => {
    const tab = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tab.id, { type: "CT_CLOSE_PANEL" }, (res) => {
        if (window.chrome.runtime.lastError) {
            console.log("Error Happended!", res)
        }
        return true
    })
}

export const getVisitedHistory = async (limit=3) => {
    const visitedSites     = await window.chrome.history.search({ text: "", maxResults: 1000 })
    const mostVisited      = visitedSites.sort((a, b) => b.visitCount - a.visitCount)
    const sitesArr         = []
    for (const v in mostVisited) {
        const o     = mostVisited[v]
        if (sitesArr.length === limit) break
        const host  = getDomain(o.url)
        
        const index = sitesArr.findIndex((s) => { return s.url.includes(host) })
        if (index === -1 && sitesArr.length < limit) {
            sitesArr.push({
                url: o.url,
                name: o.title || host,
                icon: `https://www.google.com/s2/favicons?domain=${host}`
            })
        }
    }
    return sitesArr
}


export const copyLinkToHighlight = async (url, text) => {
    if(!url || !text) return false;
    let currentUrl = url;
    // If URL already has a fragment identifier, remove it
    if (currentUrl.indexOf("#") > -1) {
        currentUrl = currentUrl.substring(0, currentUrl.indexOf("#"));
    }

    const splitArr = text.split(' ');
    //If highlighted words are more than 50 split it to smaller words
    if (splitArr.length > 50) {
        const firstWords = splitArr.slice(0, 3).join(' ');
        const LastWords = splitArr.slice(-3).join(' ');
        currentUrl += `#:~:text=${encodeURIComponent(firstWords)},${encodeURIComponent(LastWords)}`;
    } else {
        currentUrl += `#:~:text=${encodeURIComponent(text)}`;
    }
    
    const tab = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tab.id, { type: "COPY_TEXT", copyImgText: currentUrl }, (res) => {
        if (window.chrome.runtime.lastError) {
            console.log("Error Happended!", res)
        }
        return true
    })
}


export const openLinkToHighlight = async (url, text) => {
    if(!url || !text) return false;
    let currentUrl = url;
    // If URL already has a fragment identifier, remove it
    if (currentUrl.indexOf("#") > -1) {
        currentUrl = currentUrl.substring(0, currentUrl.indexOf("#"));
    }

    const splitArr = text.split(' ');
    //If highlighted words are more than 50 split it to smaller words
    if (splitArr.length > 50) {
        const firstWords = splitArr.slice(0, 3).join(' ');
        const LastWords = splitArr.slice(-3).join(' ');
        currentUrl += `#:~:text=${encodeURIComponent(firstWords)},${encodeURIComponent(LastWords)}`;
    } else {
        currentUrl += `#:~:text=${encodeURIComponent(text)}`;
    }
    
    const tab = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tab.id, { id: "CT_OPEN_WINDOW", tabURLs: [currentUrl] })
}

//Get amazon image url
export const getAmazonItemUrl = async () => {
    const tab = await getActiveTabURL()
    return new Promise((resolve, reject) => {
        window.chrome.tabs.sendMessage(tab.id, { type: "GET_AMAZON_ITEM_URL" }, (res) => {
            resolve(res);
        })
    })
}

export const setWebappStorage = (userInformation,isRegister=false) => {
    if(isRegister){
        return new Promise((resolve, reject) => {
          getActiveTabURL().then((tab) => {
            window.chrome.tabs.sendMessage(tab.id, {
              type: "SET_CT_COOKIE_REGISTER",
              cookieObj: userInformation,
              webappURL: process.env.REACT_APP_WEBAPP_URL,
            });
          });
        });
    }
    return new Promise((resolve, reject) => {
        getActiveTabURL().then((tab) => {
            window.chrome.tabs.sendMessage(tab.id, { type: "SET_CT_COOKIE", cookieObj: userInformation, webappURL: process.env.REACT_APP_WEBAPP_URL })
        })
    })
}

export const getTabImageAndDescription = (tabid) => {
    return new Promise((resolve, reject) => {
        try {
            window.chrome.tabs.sendMessage(tabid, { type: "CT_SAVE_TAB_DETAILS" }, (res) => {
                resolve(res)
            })
        }
        catch (err) {
            console.log("Error ===>", err)
            resolve(null)
        }
    })
}

export const getAllWindows = () => {
    return new Promise((resolve, reject) => {
        window.chrome.windows.getAll({ populate: true }, (windows) => {
            resolve(windows)
        })
    })
}
