import Folder from "../components/folderList/Folder"

export const processNestedTabs = (collections, callbacks) => {
    const newArr        = []
    collections?.forEach((c, key) => {
        const k = `Folder-${c.id}`
        const o = {
          key: k,
          title: <Folder obj={c} modalEdit={callbacks.onModalEdit} modalDelete={callbacks.onModalDelete} sharedCollections={[]}/>,
          children: [],
          isLeaf: (c?.gems_count === 0 && c?.folders?.length === 0),
          label: c,
          isLoading: false, 
          page: 0, 
          hasMore: c?.gems_count > 0, 
          gems_count: c?.gems_count,
        }
        if (c?.folders?.length !== 0) {
          o.children = processNestedTabs(c.folders, callbacks)
        }
        newArr.push(o)
    })
    return newArr
}

export const processNewNestedTabs = (collections, callbacks) => {
  const allParentCollections = []
  collections?.forEach((c, key) => {
    if (c.collection === null) {
      allParentCollections.push(c)
    }
    else if (c.collection !== null && allParentCollections.findIndex((cl) => cl.id === c.collection.id) === -1) {
      allParentCollections.push(c.collection)
    }
  })
  allParentCollections.forEach((c, key) => {
    c.folders = []
    collections?.forEach((cc, key) => {
      if (cc.collection && cc.collection.id === c.id) {
        c.folders.push(cc)
      }
    })
  })
  return processNestedTabs(allParentCollections, callbacks)
}