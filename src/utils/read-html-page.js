import { parser }       from 'html-metadata-parser'
import axios            from "axios";

const getDocument = (url) => {
    return new Promise((resolve, reject) => {
        axios.get(url, { responseType: "document" })
             .then((res) => {
                console.log("Res ===>", res.data)
                resolve(res.data)
             })
             .catch((error) => {
                console.log("Error reading html page ==>", error)
                resolve(null)
             })
    })
}

const getDocumentImages = (doc) => {
    // 
    const images = []
    Array.from(doc.images).forEach((i) => {
        // 
        images.push(i.src)
    })
    return images
}

const getDocumentKeywords = (doc, limit) => {
    const metaKeywordElem = doc.querySelector("meta[name='keywords']")
    if (metaKeywordElem) {
        return metaKeywordElem.getAttribute("content").split(",")
    }
    const allWords        = doc.body.outerText.toLowerCase().replace(/[^A-Za-z]/gm, " ").split(/\s+/gm)
    const wordsObj    = {}
    allWords.forEach((w) => {
        if (wordsObj[w]) {
            wordsObj[w]++
        }
        else if (w.length > 5) {
            wordsObj[w] = 1
        }
    })
    const sortedValues = Object.values(wordsObj).sort((a, b) => b - a);
    const maxN         = sortedValues[limit - 1]
    const highest      = Object.entries(wordsObj).reduce((wordsObj, [k, v]) => v >= maxN ? { ...wordsObj, [k]: v } : wordsObj, {});
    return Object.keys(highest).map((o) => { return o })
}

export const readHtmlDocument = (url, limit=5) => {
    return new Promise((resolve, reject) => {
        getDocument(url)
            .then((res) => {
                if (res) {
                    const images    = getDocumentImages(res)
                    const keywords  = getDocumentKeywords(res, limit)
                    parser(url).then((parseRes) => {
                        if (parseRes) {
                            const { meta } = parseRes
                            if (meta) {
                                resolve({
                                    title: meta.title,
                                    description: meta.description,
                                    images,
                                    keywords
                                })
                            }
                            resolve(null)
                        }
                        resolve(null)
                    })
                }
            })
            .catch((err) => {
                resolve(null)
            })
    })
}