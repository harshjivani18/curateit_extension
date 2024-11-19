import { fetchUrlData,
         setDataFromStorage,
         fetchingSiteData }     from '../actions/domain';
import store                    from '../store/index'
import session                  from './session'
import compareUrls              from 'compare-urls';

export const setCurrentSiteData = (currentTab) => {
    return new Promise((resolve, reject) => {
        if (currentTab) {
            session.setCurrentSiteProcessingLoader(true)
            const sentence = currentTab.url;
            const word = 'add-bookmark';
            let checkingUrl =  sentence.includes(word) ? true : false 
            if(checkingUrl){
                const words = sentence.split(word)
                var finalUrl = words[1].slice(17)
            }
            
            if (currentTab) {
                const url           = finalUrl 
                                        ?(finalUrl.charAt(finalUrl.length - 1) === "/" ? finalUrl : `${finalUrl}/` )
                                        :(currentTab.url.charAt(currentTab.url.length - 1) === "/" ? currentTab.url : `${currentTab.url}/`)
                const existingObj   = JSON.parse(session.currentSiteData)
                const existingURL   = existingObj && existingObj.url ? existingObj.url : ""
                if (session.currentSiteData !== null && existingURL !== "" && compareUrls(url, existingURL)) {
                    session.setCurrentSiteProcessingLoader(false)
                    const obj = JSON.parse(session.currentSiteData)
                    store.dispatch(setDataFromStorage(obj))
                    resolve(obj)
                }
                else {
                    store.dispatch(fetchingSiteData(true))
                    store.dispatch(fetchUrlData(url)).then((res) => {
                        session.setCurrentSiteProcessingLoader(false)
                        store.dispatch(setDataFromStorage(res?.payload?.data))
                        store.dispatch(fetchingSiteData(false))
                        resolve(res?.payload?.data)
                    })
                }
            }
            else {
                session.setCurrentSiteData("about:blank")
                session.setCurrentSiteProcessingLoader(false)
                resolve({ title: "about:blank" })
            }
        }
        else {
            reject("Tabs are not supported!")
        }
    })
}