import axios from "axios";
import { v4 as uuidv4 } from "uuid"
const { parser } = require('html-metadata-parser');

const addNodes = (elems, arr) => {
    elems.forEach((el) => {
        const elChild    = Array.from(el.children)
        const dtElems    = elChild.filter((e) => { return e.tagName === "DT" })
        dtElems.forEach((dt) => {
            const dtChild    = Array.from(dt.children)
            const headers    = dtChild.filter((e) => { return e.tagName === "H3" })
            const subFolders = dtChild.filter((d) => { return d.tagName === "DL" })
            
            if (headers.length !== 0) {
                headers.forEach((h) => {
                    const oId        = uuidv4()
                    h.parentElement.setAttribute("id", oId)
                    const o = {
                        title: h.innerText,
                        folders: [],
                        bookmarks: [],
                        o_id: oId
                    }
                    if (subFolders.length !== 0) {
                        o.folders = addNodes(subFolders, [])
                    }
                    arr.push(o)
                })
            }
        })
    })
    return arr
}

const setNullIcons = (link) => {
    return new Promise((resolve, reject) => {
       parser(link).then((res) => {
          resolve(res?.og?.image)
       }).catch((err) => {
          resolve(null)
       })
    })
}

export const getScreenshot = async (link, key) => {
    const response = await axios.post(`${process.env.REACT_APP_SCREENSHOT_URL}/take-screenshot`, {
        url: link,
        storageKey: key
    })
    if (response.error === undefined) {
        return response.data.screenshotUrl
    }
    return `${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-200x200.png`
}


export const addBookmarks = async (objs, htmlDoc) => {
    // objs.forEach((o, index) => {
        for(const index in objs) {
            const o = objs[index]
            const elem   = htmlDoc.getElementById(o.o_id)
            const eChild = Array.from(elem.children).filter((e) => { return e.tagName === "DL" })
            
            for(const eIdx in eChild) {
                const el = eChild[eIdx]
                const bChild = Array.from(el.children).filter((p) => { return p.tagName === "DT" && p.id === "" })

                for (const bIdx in bChild) {
                    const d = bChild[bIdx]
                    const links = Array.from(d.children).filter((c) => { return c.tagName === "A" })
                    if (links.length !== 0) {
                        for (const lIdx in links) {
                            const l = links[lIdx]
                            // const bookmarkIcon = l.getAttribute("icon") ? l.getAttribute("icon") : l.getAttribute("icon_uri") ? l.getAttribute("icon_uri") : null
                            
                            objs[index].bookmarks = [
                                ...objs[index].bookmarks,
                                {
                                    title: l.innerText,
                                    link: l.href,
                                    icon: `https://www.google.com/s2/favicons?domain=${l.href}`,
                                }
                            ]
                            objs[index].bookmarks = [ ...objs[index].bookmarks ]
                            objs                  = [ ...objs ]
                        }
                    }
                }
            }

            if (o.folders.length !== 0) {
                addBookmarks(o.folders, htmlDoc)
            }
        }

        // eChild.forEach((el) => {
        //     bChild.forEach((d) => {
        //         if (links.length !== 0) {
        //             links.forEach((l) => {
        //                 const bookmarkIcon = l.getAttribute("icon") ? l.getAttribute("icon") : l.getAttribute("icon_uri") ? l.getAttribute("icon_uri") : null
                        
        //                 objs[index].bookmarks = [
        //                     ...objs[index].bookmarks,
        //                     {
        //                         title: l.innerText,
        //                         link: l.href,
        //                         icon: bookmarkIcon,
        //                     }
        //                 ]
        //                 objs[index].bookmarks = [ ...objs[index].bookmarks ]
        //                 objs                  = [ ...objs ]

                    
                        


        //             })
        //         }
        //     })
        // })
        
    // })
    return objs
} 

export const processBookmarkJson = async (htmlDoc) => {
    if (htmlDoc.body === undefined) return []
    const mainBodyElems = Array.from(htmlDoc.body.children).filter((c) => { return c.tagName === "DL" })
    const objs          = addNodes(mainBodyElems, [])
    return await addBookmarks(objs, htmlDoc)
}