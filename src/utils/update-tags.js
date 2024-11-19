import store                from "../store"
import session              from "./session"
import { addTag }           from "../actions/tags"
import { updateUserTags }   from "../actions/user"
import { toggleExceedPopup } from "../actions/app"

const addAllTags = (tag, userTags) => {
    return new Promise((resolve, reject) => {
        const existingIdx = userTags ? userTags.findIndex((t) => { return t.tag === tag.text }) : -1
        if (existingIdx !== -1) {
            const tagObj = userTags[existingIdx]
            resolve({
                isAlreadyExist: true,
                obj: {
                    id: tagObj.id,
                    tag: tagObj.tag
                }
            })
        }
        else {
            store.dispatch(addTag({ data: { tag: tag.text, users: session.userId, media_type: "Link" }})).then((res) => {
                store.dispatch(updateUserTags(res.payload?.data?.data))
                resolve(res)
            })
            .catch((err) => {
                store.dispatch(toggleExceedPopup(true, "Your Tag Limit exceeded, please upgrade your plan, buy add-ons or earn some credits to unlock more!"))
            })
        }
    })
}

export const updateTags = (tags, userTags, limit=5) => {
    return new Promise((resolve, reject) => {
        if (!tags) resolve([])
        const selectedTagPromises = []
        const selectedTagObjs     = []
        const finalLimit          = tags && limit > tags.length ? tags.length : limit

        for(let i=0 ; i < finalLimit;i++){
            const tag = { text: tags[i] }
            selectedTagPromises.push(addAllTags(tag, userTags))
        }
        if (selectedTagPromises.length !== 0) {
            Promise.all(selectedTagPromises).then((promiseRes) => {
                if (promiseRes) {
                    promiseRes.forEach((res) => {
                        if (res.isAlreadyExist) {
                            selectedTagObjs.push(res.obj)
                        }
                        else if (res && res.payload && res.payload.data && res.payload.data.data) {
                            const { data } = res.payload.data
                            const tagObj = {
                                id: data.id,
                                tag: data.tag ? data.tag : data.attributes?.tag 
                            }
                            selectedTagObjs.push(tagObj)
                        }
                    })
                }
                resolve(selectedTagObjs)
            })
        }
        else {
            resolve([])
        }
    })
}