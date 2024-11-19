import moment from "moment"
import session from "./session"

export const addNewOrUpdateGemInCollection = (collections, gem, parent, action) => {
    collections.forEach((c, index) => {
        if (c.id === parent.id) {
            if (action === "add") {
                collections[index].bookmarks = [
                    ...collections[index].bookmarks,
                    gem
                ]
                // collections[index].gems = [
                //     ...collections[index].gems,
                //     gem
                // ]
            }
            else {
                const bidx = collections[index].bookmarks.findIndex((b) => { return b.id === gem.id })
                // const gidx = collections[index].gems.findIndex((g) => { return g.id === gem.id })
                if (bidx !== -1) {
                    collections[index].bookmarks[bidx] = { ...gem }
                }
                // if (gidx !== -1) {
                //     collections[index].gems[gidx] = { ...gem }
                // }
            }
            // collections[index].gems       = [ ...collections[index].gems ]
            collections[index].bookmarks  = [ ...collections[index].bookmarks ]
            collections = [ ...collections ]
            return collections
        }
        else if (c.folders.length !== 0) {
            addNewOrUpdateGemInCollection(c.folders, gem, parent, action)
        }        
    })
    return collections
}

export const updateAndGetNewCollection = (collections, id, newValue=null) => {
    if (newValue !== null) {
        collections.forEach((c, index) => {
            if (c.id === id) {
                collections[index] = {
                    ...collections[index],
                    name: newValue
                }
                collections = [ ...collections ]
            }
            else if (c.folders.length !== 0) {
                updateAndGetNewCollection(c.folders, id, newValue)
            }
        })
    }
    else {
        collections.forEach((c, index) => {
            if (c.id === id) {
                collections.splice(index, 1)
                collections = [ ...collections ]
            }
            else if (c.folders.length !== 0){
                updateAndGetNewCollection(c.folders, id, null)
            }
        })
    }

    return collections
}

export const removeGemFromCollections = (collections, gemId, collectionId) => {
    collections.forEach((c, index) => {
        if (c.id === collectionId) {
            const idx = c.bookmarks.findIndex((f) => { return f.id === gemId})
            if (idx !== -1) {
                collections[index].bookmarks.splice(idx, 1)
                collections[index].bookmarks = [ ...collections[index].bookmarks ]
                collections = [ ...collections ]
            }
            return collections
        }
        else if (c.folders.length !== 0) {
            removeGemFromCollections(c.folders, gemId, collectionId)
        }
    })

    return collections
}

const removeGemOrCollection = (collections, dragObj, dropObj, isRemoved) => {
    collections.forEach((c, index) => {
        // consider as folder
        if (dragObj.collection && dragObj.collection.id === c.id) {
            const idx = c.folders.findIndex((f) => { return f.id === dragObj.id })
            if (idx !== -1) {
                collections[index].folders.splice(idx, 1)
                collections[index].folders = [ ...collections[index].folders ]
                collections = [ ...collections ]
                isRemoved   = true
            } 
        }
        else if (dragObj.collection === null && dragObj.media === undefined && dragObj.id === c.id) {
            collections.splice(index, 1)
            collections = [ ...collections ]
            isRemoved   = true
        }
        // consider as bookmark
        else if (dragObj.collection === undefined && dragObj.media) {
            collections[index].gems_count = (collections[index].gems_count > 0) ? collections[index].gems_count - 1 : 0;
                collections = [ ...collections ]
                isRemoved   = true
            // const dIdx = c.bookmarks.findIndex((b) => { return b.id === dragObj.id })
            // if (dIdx !== -1) {
            //     collections[index].bookmarks.splice(dIdx, 1)
            //     collections[index].bookmarks = [ ...collections[index].bookmarks ] 
            // }
        }

        if (isRemoved === false && c.folders.length !== 0) {
            removeGemOrCollection(c.folders, dragObj, dropObj, isRemoved)
        }
    })
    return collections
}

const addGemOrCollection = (collections, dragObj, dropObj, isAdded) => {
    collections.forEach((c, index) => {
        if (dropObj.id === c.id) {
            if (dragObj.folders !== undefined) {
                collections[index].folders = [
                    ...collections[index].folders,
                    dragObj
                ]
            }
            else {
                // collections[index].bookmarks = [
                //     ...collections[index].bookmarks,
                //     dragObj
                // ]
                // collections[index].gems = [
                //     ...collections[index].gems,
                //     dragObj
                // ]
                collections[index].gems_count = collections[index].gems_count + 1
            }
            collections = [ ...collections ]
            isAdded     = true
        }

        if (isAdded === false && c.folders.length !== 0) {
            addGemOrCollection(c.folders, dragObj, dropObj, isAdded)
        }
    })
    return collections
}

export const manageMove = (collections, dragObj, dropObj) => {
    const finalDragObj        = (dragObj.folders !== undefined) ? { ...dragObj, collection: { ...dropObj }, is_sub_collection: true } : { ...dragObj }
    const filteredCollections = removeGemOrCollection(collections, dragObj, dropObj, false)
    if (dropObj === null) {
        return [ ...filteredCollections, { ...dragObj, collection: null, is_sub_collection: false } ]
    }
    return addGemOrCollection(filteredCollections, finalDragObj, dropObj, false)
}

export const addMultipleGems = (collections, gems, parent) => {
    collections.forEach((c, index) => {
        if (c.id === parent.id) {
            collections[index].bookmarks = [
                ...collections[index].bookmarks,
                ...gems
            ]
                
            collections[index].bookmarks  = [ ...collections[index].bookmarks ]
            collections = [ ...collections ]
            return collections
        }
        else if (c.folders.length !== 0) {
            addMultipleGems(c.folders, gems, parent)
        }        
    })
    return collections
}

export const getAllCollectionWithSub = (collectionData, arr=[]) => {
    collectionData.forEach((c) => {
        if (c.folders.length !== 0) {
            getAllCollectionWithSub(c.folders, arr)
        }
        c.folders.forEach((f) => {
            arr.push(f)
        })
        if (!c.collection) {
            arr.push(c)
        }
    })
    return arr
}

export const updateMediaInBookmark = (collections, gemId, mediaObj) => {
    collections.forEach((c, index) => {
        if (c.bookmarks.length !== 0) {
            const bIdx = c.bookmarks.findIndex((b) => { return b.id === parseInt(gemId) })
            if (bIdx !== -1) {
                collections[index].bookmarks[bIdx] = {
                    ...collections[index].bookmarks[bIdx],
                    media: {
                        ...collections[index].bookmarks[bIdx].media,
                        ...mediaObj
                    }
                }
                collections[index].bookmarks = [ ...collections[index].bookmarks ]
                collections = [ ...collections ]
                return collections
            }
        }
        if (c.folders.length !== 0) {
            updateMediaInBookmark(c.folders, gemId, mediaObj)
        }
    })
    return collections
}

export const checkGemExists = (collections, url) => {
    let obj = null
    collections.forEach((c) => {
        if (c.bookmarks && c.bookmarks.length !== 0) {
            c.bookmarks.forEach((b) => {
                if (b.url === url) {
                    obj = { gem: b, collection: c }
                }
            })
        }
        if (c.folders?.length && !obj) {
            obj = checkGemExists(c.folders, url)
        }
    })
    return obj
}

export const checkBookmarkExists = (collections, url) => {
    let isExist = false
    collections.forEach((c) => {
        if(c.id === session.unfiltered_collection_id){
            collections["folders"] = []
        }
        if (c.bookmarks && c.bookmarks.length !== 0) {
            c.bookmarks.forEach((b) => {
                // if (b.url === url) {
                //     isExist = true
                // }
                if (b.url === url && b.media_type === "Link") {
                    isExist = true
                }
            })
        }
        if (c.folders?.length && !isExist) {
            isExist = checkBookmarkExists(c.folders, url)
        } 
    })
    return isExist
}

export const checkCollectionExists = (collections,query) => {
    let isExist = false
    collections.forEach((c) => {
        if(c.name === query){
            isExist = true
        }
    })
    return isExist
}

export const getCollectionById = (collections, collectionId) => {
    let collection = null
    collections.forEach((c) => {
        if (c.id === Number(collectionId)) {
            collection = c
        }
        else if (c.folders.length !== 0 && !collection) {
           collection = getCollectionById(c.folders, collectionId)
        }
    })
    return collection
}

export const getShortLinks = (collections, arr) => {
    collections?.forEach((c) => {
        if (c.folders.length !== 0) {
            getShortLinks(c.folders, arr)
        }
        if (c.bookmarks.length !== 0) {
            c.bookmarks.forEach((b) => {
                if (b.expander && b.expander.length !== 0) {
                    b.expander.forEach((e) => {
                        const arrIdx = arr.findIndex((a) => { return a.keyword === e.keyword && a.type === e.type })
                        if (arrIdx === -1) {
                            arr.push({ ...e, gemId: b.id })
                        }
                    })
                }
            })
        }
    })
    return arr
}


export const checkGemExistsById = (collections, gemId) => {
    let obj = null
    collections.forEach((c) => {
        if (c.bookmarks && c.bookmarks.length !== 0) {
            c.bookmarks.forEach((b) => {
                if (b.id === gemId) {
                    obj = { gem: b, collection: c }
                }
            })
        }
        if (c.folders?.length && !obj) {
            obj = checkGemExistsById(c.folders, gemId)
        }
    })
    return obj
}

export const modifyCollection = (collections, id, data) => {
    collections?.forEach((c, index) => {
            if (c.id === id) {
                collections[index] = {
                    ...collections[index],
                    ...data
                }
                collections = [ ...collections ]
            }
            else if (c.folders.length !== 0) {
                modifyCollection(c.folders, id, data)
            }
    })
    return collections
}



export const filterAllKindleHighlightIds = (collections) => {
    let allGems = [];
    collections?.forEach((c) => {
        if (c.bookmarks && c.bookmarks.length !== 0) {
            c.bookmarks.forEach((b) => {
                if (b.media_type === "Highlight" && b?.media?.text && b?.highlightId) {
                    allGems.push(b?.highlightId);
                }
            })
        }
        if (c.folders?.length) {
            filterAllKindleHighlightIds(c.folders)
        }
    })
    return allGems
}

export const removeBookmarkById = (data, collectionId, bookmarkId) => {
    const searchAndRemove = (array) => {
        for (const item of array) {
            if (item.id === Number(collectionId)) {
                const index = item.bookmarks.findIndex(b => b.id === Number(bookmarkId));
                if (index !== -1) {
                    item.bookmarks.splice(index, 1);
                    return true;  
                }
            }
            
            if (item.folders && item.folders.length > 0) {
                if (searchAndRemove(item.folders)) {
                    return true;  
                }
            }
        }
        return false; 
    };

    searchAndRemove(data);

    return data;
};

export function getBookmarkPermissions(data, targetBookmarkId) {
    function hasBookmarkInFolders(folders, targetId) {
        for (const folder of folders) {
            if (folder.bookmarks.some(bookmark => bookmark.id === Number(targetId))) {
                return true;
            }
            
            if (hasBookmarkInFolders(folder.folders, targetId)) {
                return true;
            }
        }
        return false;
    }

    for (const collection of data) {
        if (collection.bookmarks.some(bookmark => bookmark?.id === Number(targetBookmarkId))) {
            return collection.permissions;
        }
        if (hasBookmarkInFolders(collection.folders, targetBookmarkId)) {
            return collection.permissions;
        }
    }

    return null;
}

export const getAllLevelCollectionPermissions = (data, idToFind, topLevelAccess=null, topLevelPermissions=null,topLevel=true) => {
  for (const item of data) {
    if (item.id === Number(idToFind)) {
      return {
        accessType: item.accessType || topLevelAccess,
        permissions: item.permissions || topLevelPermissions,
        data: item,
        topLevel:topLevel
      };
    }
    
    if (item.folders && item.folders.length > 0) {
      const nextTopLevelAccess = item.accessType || topLevelAccess;
      const nextTopLevelPermissions = item.permissions || topLevelPermissions;
      const result = getAllLevelCollectionPermissions(item.folders, idToFind, nextTopLevelAccess, nextTopLevelPermissions,false);
      
      if (result) {
        return result;
      }
    }
  }
  
  return null;
};

export function moveGemFromOwnToSharedCollection(data, targetCollectionId, newBookmark) {
    function addBookmarkToFolders(folders) {
        for (const folder of folders) {
            if (folder.id === Number(targetCollectionId)) {
                folder.bookmarks.push(newBookmark);
                return true; 
            }

            if (addBookmarkToFolders(folder.folders)) {
                return true; 
            }
        }
        return false; 
    }

    for (const collection of data) {
        if (collection.id === Number(targetCollectionId)) {
            collection.bookmarks.push(newBookmark);
            return data; 
        }
    
        if (addBookmarkToFolders(collection.folders)) {
            return data; 
        }
    }

    return data;
}

export function updateBulkBookmarksShared(data, arrayToUpdate) {
    function findAndRemoveBookmark(bookmarkId) {
        let removedBookmark = null;

        function removeRecursive(folders) {
            for (const folder of folders) {
                const idx = folder.bookmarks.findIndex(b => b.id === bookmarkId);
                if (idx !== -1) {
                    removedBookmark = folder.bookmarks.splice(idx, 1)[0];
                    return removedBookmark;
                }
                const foundBookmark = removeRecursive(folder.folders);
                if (foundBookmark) return foundBookmark;
            }
            return null;
        }

        for (const collection of data) {
            const idx = collection.bookmarks.findIndex(b => b.id === bookmarkId);
            if (idx !== -1) {
                removedBookmark = collection.bookmarks.splice(idx, 1)[0];
                return removedBookmark;
            }

            const foundBookmark = removeRecursive(collection.folders);
            if (foundBookmark) return foundBookmark;
        }
        return removedBookmark;
    }
    function addBookmarkToCollection(folders, collectionId, bookmark) {
        for (const folder of folders) {
            if (folder.id === collectionId) {
                folder.bookmarks.push(bookmark);
                return true;
            }
            if (addBookmarkToCollection(folder.folders, collectionId, bookmark)) return true;
        }
        return false;
    }

    arrayToUpdate.forEach(update => {
        const bookmark = findAndRemoveBookmark(update.id);
        
        if (!bookmark) return; 
        
        let added = false;

        for (const collection of data) {
            if (collection.id === update.collection_gems) {
                collection.bookmarks.push(bookmark);
                added = true;
                break;
            }
        }

        if (!added) {
            for (const collection of data) {
                if (addBookmarkToCollection(collection.folders, update.collection_gems, bookmark)) break;
            }
        }
    });

    return data;
}

export const removeGemFromCollectionsShared = (collections, gemId, collectionId) => {
    collections.forEach((c, index) => {
        if (c.id === Number(collectionId)) {
            const idx = c.bookmarks.findIndex((f) => { return f.id === Number(gemId)})
            if (idx !== -1) {
                collections[index].bookmarks.splice(idx, 1)
                collections[index].bookmarks = [ ...collections[index].bookmarks ]
                collections = [ ...collections ]
            }
            return collections
        }
        else if (c.folders.length !== 0) {
            removeGemFromCollectionsShared(c.folders, gemId, collectionId)
        }
    })

    return collections
}

export function manageMoveShared(data, collectionId, objectToAdd) {
    function addRecursive(folders) {
        for (let folder of folders) {
            if (folder.id === Number(collectionId)) {
                folder.folders = [...folder.folders, objectToAdd];
                return true;
            }
            if (addRecursive(folder.folders)) return true;
        }
        return false;
    }

    for (let collection of data) {
        if (collection.id === Number(collectionId)) {
            collection.folders = [...collection.folders, objectToAdd];
            return data;
        }
    }

    for (let collection of data) {
        if (addRecursive(collection.folders)) return data;
    }

    return data;
}

export function modifySharedCollection(data, collectionId, updatedObj) {
    // Recursive function to find and update the collection
    function findAndUpdate(collection) {
        if (!collection) return false;

        // If the collection ID matches, update it
        if (collection.id === Number(collectionId)) {
            Object.assign(collection, updatedObj);
            return true;
        }

        if (collection.folders) {
            for (let folder of collection.folders) {
                if (findAndUpdate(folder)) return true;
            }
        }

        return false;
    }

    // Traverse the top-level and then go deeper using the recursive function
    for (let collection of data) {
        if (findAndUpdate(collection)) break;
    }

    return data;
}

export function sharedCollectionRoot(data, collectionId, updatedObj) {
    // Recursive function to find and remove the collection
    function findAndRemove(parentArray, collectionId) {
        for (let i = 0; i < parentArray.length; i++) {
            if (parentArray[i].id === Number(collectionId)) {
                parentArray.splice(i, 1);
                return true;
            }
            
            if (parentArray[i].folders && findAndRemove(parentArray[i].folders, collectionId)) {
                return true;
            }
        }
        return false;
    }

    // Remove the collection
    findAndRemove(data, collectionId);

    // Add the updated object at the top level
    data.push(updatedObj);

    return data;
}

export function moveAndUpdateSharedCollection(data, sourceCollectionId, destinationCollectionId, updatedSourceObject) {
    // Recursive function to find and remove the source folder
    function findAndRemove(collection) {
        if (!collection || !collection.folders) return;

        for (let i = 0; i < collection.folders.length; i++) {
            if (collection.folders[i].id === Number(sourceCollectionId)) {
                collection.folders.splice(i, 1);
                return true;
            }
            if (findAndRemove(collection.folders[i])) return true;
        }

        return false;
    }

    // Recursive function to find the destination and append the updated source folder
    function findAndInsert(collection) {
        if (!collection || !collection.folders) return;

        if (collection.id === Number(destinationCollectionId)) {
            collection.folders.push(updatedSourceObject);
            return true;
        }

        for (let folder of collection.folders) {
            if (findAndInsert(folder)) return true;
        }

        return false;
    }

    // First, traverse the top-level and then go deeper using recursive function for source collectionId
    for (let collection of data) {
        if (collection.id === Number(sourceCollectionId)) {
            data.splice(data.indexOf(collection), 1);
            break;
        }
        if (findAndRemove(collection)) break;
    }

    // Then, traverse again for the destination collectionId and insert the updated source folder
    for (let collection of data) {
        if (findAndInsert(collection)) break;
    }

    return data;
}

export function removeSharedCollection(collections,id){
    collections.forEach((c, index) => {
            if (c.id === Number(id)) {
                collections.splice(index, 1)
                collections = [ ...collections ]
            }
            else if (c.folders.length !== 0){
                updateAndGetNewCollection(c.folders, id, null)
            }
        })
    
    return collections
}

export const getBookmarkAccessType = (data, idToFind, topLevelAccess=null, topLevelPermissions=null) => {
  for (const item of data) {
    if (item.bookmarks) {
      const bookmark = item.bookmarks.find(bm => bm.id === Number(idToFind));
      if (bookmark) {
        return {
          accessType: item.accessType || topLevelAccess,
          permissions: item.permissions || topLevelPermissions,
          data: item,
        };
      }
    }


    if (item.folders && item.folders.length > 0) {
      const nextTopLevelAccess = item.accessType || topLevelAccess;
      const nextTopLevelPermissions = item.permissions || topLevelPermissions;
      const result = getBookmarkAccessType(item.folders, idToFind, nextTopLevelAccess, nextTopLevelPermissions);
      
      if (result) {
        return result;
      }
    }
  }
  
  return null;
};

export function decrementGemCount(data, currentCollectionId) {
    return data.map(collection => {
        if (collection.id === currentCollectionId) {
            collection.gems_count = (collection.gems_count > 0) ? collection.gems_count - 1 : 0;
        }

        if (collection.folders && collection.folders.length > 0) {
            collection.folders = decrementGemCount(collection.folders, currentCollectionId);
        }

        return collection;
    });
}

export function incrementCollectionCount(dataArray, collectionId) {
    let updatedArray = dataArray?.map(item => {
        let newItem = { ...item, folders: item.folders ? [...item.folders] : [] };

        if (newItem.id === Number(collectionId)) {
            newItem.gems_count += 1;
        } else if (newItem.folders.length > 0) {
            newItem.folders = incrementCollectionCount(newItem.folders, collectionId);
        }

        return newItem;
    });

    return updatedArray;
}

export function incDecGemCount(data, sourceCollectionId,destinationCollectionId) {
    return data.map(collection => {
        if (collection.id === Number(sourceCollectionId)) {
            collection.gems_count = (collection.gems_count > 0) ? collection.gems_count - 1 : 0;
        }

        if (collection.id === Number(destinationCollectionId)) {
            collection.gems_count += 1;
        }

        if (collection.folders && collection.folders.length > 0) {
            collection.folders = incDecGemCount(collection.folders, sourceCollectionId,destinationCollectionId);
        }

        return collection;
    });
}

export function addGemsCount(obj) {
  if ('bookmarks' in obj) {
    obj.gems_count = obj.bookmarks.length;
  }
  
  if ('folders' in obj) {
    obj.folders.forEach(folder => addGemsCount(folder));
  }

  return obj;
}

export function incrementMultipleGems(dataArray, collectionId,value) {
    let updatedArray = dataArray?.map(item => {
        let newItem = { ...item, folders: item.folders ? [...item.folders] : [] };

        if (newItem.id === Number(collectionId)) {
            newItem.gems_count = newItem.gems_count + value;
        } else if (newItem.folders.length > 0) {
            newItem.folders = incrementMultipleGems(newItem.folders, collectionId,value);
        }

        return newItem;
    });

    return updatedArray;
}

export const getShortLinksForAiandText = (bookmarks, arr) => {
    bookmarks.forEach((b) => {
    if (b.expander && b.expander.length !== 0) {
        b.expander.forEach((e) => {
            const arrIdx = arr.findIndex((a) => { return a.keyword === e.keyword && a.type === e.type })
                if (arrIdx === -1) {
                    arr.push({ ...e, gemId: b.id })
                }
            })
        }
    })
    return arr
}

export function groupByParentAndCollection(arr) {
  const groupedByParent = {};

  arr.forEach((item) => {
    const parent = item["Parent Collection"] || "";
    const collection =
      item.Collection || `Import - ${moment().format("MM-DD-YYYY")}`;

    if (parent) {
      if (!groupedByParent[parent]) {
        groupedByParent[parent] = {
          title: parent,
          folders: {},
          bookmarks: [],
        };
      }

      if (!groupedByParent[parent].folders[collection]) {
        groupedByParent[parent].folders[collection] = {
          title: collection,
          folders: [],
          bookmarks: [],
        };
      }

      groupedByParent[parent].folders[collection].bookmarks.push({ ...item });
    } else {
      if (!groupedByParent[collection]) {
        groupedByParent[collection] = {
          title: collection,
          folders: [],
          bookmarks: [],
        };
      }

      groupedByParent[collection].bookmarks.push({ ...item });
    }
  });

  const result = Object.values(groupedByParent).map((parentGroup) => {
    if (parentGroup.folders) {
      parentGroup.folders = Object.values(parentGroup.folders);
      parentGroup.folders.forEach((folder) => {
        folder.folders = folder.folders.map((subfolder) => subfolder);
      });
    }
    return parentGroup;
  });

  return result;
}