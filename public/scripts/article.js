// const openBookmark = () => {
//     window.panelToggle("?add-bookmark", true)
// }

// openBookmark()

const docObj     = document.querySelector("script[type='application/ld+json']")?.innerText || null
const aObj       = docObj ? JSON.parse(docObj) : null
let finalObj     = null

if (aObj) {
    finalObj = {
        author: {
            name: aObj.author?.name,
            url: aObj?.author?.url
        },
        datePublished: aObj.datePublished,
        publisher: {
            name: aObj.publisher?.name,
            url: aObj.publisher?.url,
            logo: aObj.publisher?.logo
        },
        name: aObj?.name,
        headline: aObj?.headline,
        description: aObj?.description,
        identifier: aObj?.identifier
    }
}

chrome.storage.local.set({
    articleDetails: finalObj,
    articleText: document.body.innerHTML
})
window.panelToggle("?add-article", true)