const getUserBrowserData = () => {
    return new Promise((resolve, reject) => {
        let timer = null
        timer = setInterval(() => {
            chrome.storage.local.get(['defaultBookmarks'], (result) => {
                if (result.defaultBookmarks) {
                    clearInterval(timer)
                    resolve(result.defaultBookmarks)
                }
            })
        }, 100)
    })
}

const searchBookmark = async (bookmark, parentId) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "FIND_BOOKMARK", url: bookmark.url, parentId: parentId }, (response) => {
            resolve(response)
        })
    })
}

const searchIndexWiseFolder = async (folder, index) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "SEARCH_INDEX_WISE_FOLDER", title: folder.name, index: index }, (response) => {
            resolve(response)
        })
    })
}

const createBrowserFolder = async (folder, index) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "CREATE_BROWSER_FOLDER", title: folder.name, index: index }, (response) => {
            resolve(response)
        })
    })
}

const syncData = async (existingData, browserData) => {
    if (browserData === null) return
    
    for (const index in existingData) {
        const collection = existingData[index]
        if (collection.folders.length !== 0) {
            await syncData(collection.folders, browserData)
        }
        let newFolder        = null
        const existingFolder = await searchIndexWiseFolder(index, collection)
        if (existingFolder.length === 0) {
            const newRes = await createBrowserFolder(collection, index)
            console.log("New Folder Created ===>", newRes)
            newFolder    = newRes.id
        }
        else {
            newFolder = existingFolder?.[0]?.id
        }

        if (newFolder !== null && collection.bookmarks.length > 0) {
            for (const bookmark of collection.bookmarks) {
                const existingBookmark = await searchBookmark(bookmark, newFolder)
                if (existingBookmark.length === 0) {
                    console.log('Bookmark not found, creating new bookmark')
                    chrome.runtime.sendMessage({
                        parentId: newFolder,
                        bookmark,
                        type: "CREATE_BOOKMARK"
                    }, (res) => {
                        console.log('Bookmark created ===>', res)
                    })
                }
            }
        }
    }

    console.log('Syncing done ===>',  await getUserBrowserData())

}

window.syncWithCurrentBrowser = async (existingData) => {
    const browserData         = await getUserBrowserData()
    console.log('Existing Data ===>', existingData, 'Browser Data ===>', browserData)
    await syncData(existingData, browserData && browserData?.length > 0 ? browserData?.[0] : null)
}