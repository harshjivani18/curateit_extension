import { v4 as uuidv4 }             from "uuid"

import store                        from "../store"
import session                      from "./session"
// import { fetchCurrentTab }          from "./fetch-current-tab"

import { addImportCollection }      from "../actions/collection"
import { importGemsWithIcon }       from "../actions/gem"
import { setCurrentImportStatus, 
         setCurrentUploadItems, 
         setIsSyncing, 
         setPercentageData, 
         setSyncingCollection }     from "../actions/app"
import { updateUserSyncStatus }     from "../actions/user"

let processedCount  = 0;
let totalItems      = 0;
let processedItems  = 0; 

const calculateProcessedItems = (collection) => {
    let count = 1; 
    count += collection.bookmarks.length;
    collection.folders.forEach(folder => {
        count += calculateProcessedItems(folder); 
    });
    return count;
};

const updateProgress = (processed, total) => {
    const percentage = Math.round((processed / total) * 100);
    store.dispatch(setPercentageData(percentage));
};

// const fetchFavicon = (url) => {
//     return new Promise((resolve, reject) => {
//         fetchCurrentTab().then((tab) => {
//             window.chrome.tabs.sendMessage(tab.id, { type: "FETCH_FAVICON", url: url }, (response) => {
//                 resolve(response)
//             })
//         })
//     })
// }

const prepareImportJSON = async (defaultBookmarks) => {
    // perform recursive function to prepare the bookmarks
    const newArr = []
    for (const f of defaultBookmarks) {
        const oId     = uuidv4()
        const newObj  = {
            o_id: oId,
            title: f.title,
            bookmarks: [],
            folders: [],
            isProcessed: false
        }
        const bArr        = f.children?.filter((l) => { return l.url !== undefined })
        const bookmarkArr = []
        for (const u of bArr) {
            // const favRes = await fetchFavicon(`chrome://favicon/${u.url}`)
            bookmarkArr.push({
                title: u.title,
                link: u.url,
                icon: `https://www.google.com/s2/favicons?domain=${u.url}`,
                // icon: `${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`,
                isProcessed: false
            })
        }
        const folderArr  = f.children?.filter((l) => { return l.children !== undefined && l.children.length !== 0 })
        newObj.bookmarks = bookmarkArr
        newObj.folders   = await prepareImportJSON(folderArr)
        newArr.push(newObj)
    }
    return newArr
}

const syncWithDatabase = async (folder, parentId, parentCollectionName, index, navigate, totalCount, isAutoBtnClicked) => {
    let finalCollection   = {}
    const cRes            = await store.dispatch(addImportCollection({
        data: {
            name: folder.title,
            is_sub_collection: parentId ? true : false,
            collection: parentId ? parentId : null,
            parent_collection_name: parentCollectionName ? parentCollectionName : null,
            isBulk: true,
            isBookmarkImport: isAutoBtnClicked ? false : true,
            isBasicImport: true,
            author: parseInt(session.userId)
        }
    }))
    if (index === "0" && cRes.error === undefined) {
        navigate("/search-bookmark")
    }

    if (store?.getState()?.app?.isSyncing === false) return

    if (cRes.error === undefined) {
        finalCollection = {
            ...cRes.payload.data.data,
            isPassed: true,
            bookmarks: [],
            folders: []
        }
        if (cRes.payload.data?.data?.id) {
            if (folder.bookmarks.length !== 0) {
                const collectionGems = folder.bookmarks.map((b) => {
                    return {
                        title: b.title,
                        link: b.link,
                        icon: b.icon,
                        collection_gems: cRes.payload.data?.data?.id,
                        isBookmarkImport: isAutoBtnClicked ? false : true,
                    }
                })

                if (collectionGems.length <= 20) {
                    if (store?.getState()?.app?.isSyncing === false) return;
                    const res = await store.dispatch(importGemsWithIcon({ data: collectionGems }))
                    processedItems += collectionGems.length
                    store.dispatch(setCurrentImportStatus({ processedItems, totalItems }))
                    updateProgress(processedItems, totalItems);
                    if (res.error === undefined) {
                        finalCollection.bookmarks = res.payload.data?.data?.map((r) => { return { ...r, showThumbnail: true } }) || []
                    }
                }
                else if (collectionGems.length > 20) {
                    const chunkSize = 10
                    const chunks    = []
                    for (let i = 0; i < collectionGems.length; i += chunkSize) {
                        chunks.push(collectionGems.slice(i, i + chunkSize))
                    }
                    for (const index in chunks) {
                        if (store?.getState()?.app?.isSyncing === false) break;
                        const chunkRes = await store.dispatch(importGemsWithIcon({ data: chunks[index] }))
                        if (chunkRes.error === undefined) {
                            processedItems += chunks[index].length
                            store.dispatch(setCurrentImportStatus({ processedItems, totalItems }))
                            updateProgress(processedItems, totalItems);
                            const newChunk = chunkRes.payload.data?.data?.map((r) => { return { ...r, showThumbnail: true } })
                            finalCollection.bookmarks = [...finalCollection.bookmarks, ...newChunk]
                        }
                    }
                }
            }

            if (folder.folders.length !== 0) {
                for (const index in folder.folders) {
                    if (store?.getState()?.app?.isSyncing === false) break;
                    const folderRes = await syncWithDatabase(folder.folders[index], cRes.payload.data?.data?.id, cRes.payload.data?.data?.name, index, navigate, totalCount, isAutoBtnClicked)
                    if (folderRes.error === undefined) {
                        processedItems += 1
                        store.dispatch(setCurrentImportStatus({ processedItems, totalItems }))
                        updateProgress(processedItems, totalItems);
                        finalCollection.folders = [...finalCollection.folders, folderRes]
                    }
                }
            }
        }
    }


    return finalCollection
}

const calculateTotalItems = (collections) => {
    let total = collections.length;
    collections.forEach(collection => {
        total += collection.bookmarks.length;
        const countFolders = (folders) => {
            folders.forEach(folder => {
                total++;
                total += folder.bookmarks.length;
                if (folder.folders.length > 0) {
                    countFolders(folder.folders);
                }
            });
        };
        countFolders(collection.folders);
    });
    return total;
};

export const syncBookmarks = async (defaultBookmarks, isSyncEnabled, navigate, isAutoBtnClicked=false) => {
    if (isSyncEnabled === true) {
        // window.chrome.storage.local.remove("defaultBookmarks")
        return;
    }
    const newBookmarks = await prepareImportJSON(defaultBookmarks?.[0]?.children);
    let totalCount     = calculateTotalItems(newBookmarks);
    totalItems         = totalCount;
    processedItems     = 0;
    store.dispatch(setCurrentImportStatus({ processedItems, totalItems }))
    store.dispatch(updateUserSyncStatus())
    store.dispatch(setSyncingCollection(true))
    session.setIsBookmarkSynced(true)
    for (const index in newBookmarks) {
        if (store?.getState()?.app?.isSyncing === false) {
            store.dispatch(setSyncingCollection(false)) 
            store.dispatch(setIsSyncing(false))
            break;
        }
        const folder = newBookmarks[index]
        await syncWithDatabase(folder, null, null, index, navigate, totalCount, isAutoBtnClicked)
        processedCount += calculateProcessedItems(folder); 
        processedItems += 1
        store.dispatch(setCurrentImportStatus({ processedItems, totalItems }))
        updateProgress(processedItems, totalCount); 
    }  
    store.dispatch(setIsSyncing(false))
    store.dispatch(setSyncingCollection(false)) 
    store.dispatch(setCurrentImportStatus(null))
    store.dispatch(setCurrentUploadItems(null))
    navigate("/search-bookmark?refetch=refetch-gem")

    // window.chrome.storage.local.remove("defaultBookmarks")
}