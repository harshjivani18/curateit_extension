// import { v4 as uuidv4 } from 'uuid';
import Folder from '../components/folderList/Folder';
import Bookmark from '../components/folderList/Bookmark'

export const searchData = (collections, callbacks) => {
    
    const newArr = []
    
    function isEmptyObject(obj) {
        return JSON.stringify(obj) === '{}'
    }
    // 
    collections?.forEach((c, key) => {
        // 
        // 
        // 
        // 
        let isCollectionAvailable = isEmptyObject(c.collection)
        let isGemAvailable = isEmptyObject(c.gem)
        let isTagAvailable = isEmptyObject(c.tag)

        if (!isCollectionAvailable) {
            const k = `Folder-${c.id}`
            const o = {
                key: k,
                title: <Folder obj={c.collection} modalEdit={callbacks.modalEdit} modalDelete={callbacks.modalDelete} />,
                children: []
            }
            newArr.push(o)
        }  
        if (!isGemAvailable) {
            // if (c.gem.media_type === "Link") {
                if(c.gem.gems.length > 0){
                c.gem.gems.forEach((c)=>{
                    const   o = {
                        key: `Bookmark-${c.id}`,
                        title: <Bookmark obj={c} editGem={callbacks.editGem} deleteGems={callbacks.deleteGems} parentId={c.id} parent={c} modalDelete={callbacks.modalDelete} />,
                        children: []
                    }
                    newArr.push(o)
                })}else{
                    const   o = {
                        key: `Bookmark-${c.id}`,
                        title: <Bookmark obj={c.gem} editGem={callbacks.editGem} deleteGems={callbacks.deleteGems} parentId={c.id} parent={c} modalDelete={callbacks.modalDelete} />,
                        children: []
                    }
                    newArr.push(o)
                }
            // }
        } 
        //  if (!isTagAvailable) {

        // }

        // if (c?.folders?.length !== 0) {
        //     o.children = processNestedBookmarks(c.folders, callbacks)
        // }
        // if (c?.bookmarks?.length !== 0) {
        //     c?.bookmarks?.forEach((b) => {
        //         if (b.media_type === "Link") {
        //             o.children.push({
        //                 key: `Bookmark-${b.id}`,
        //                 title: <Bookmark obj={b} editGem={callbacks.editGem} deleteGems={callbacks.deleteGems} parentId={c.id} parent={c} modalDelete={callbacks.modalDelete} />,
        //                 children: []
        //             })
        //         }
        //     })
        // }
    })
    // 
    return newArr
}