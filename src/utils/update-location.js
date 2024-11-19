import { HIGHLIGHT_TAB_KEY, classifyIMDbURL } from "./constants";
import store from "../store"
import {
    setCurrentGem,
    setCurrentMedia
} from "../actions/gem"
import {
    getAllTypeHighlights,
    updateHighlightsArr
} from "../actions/highlights"
import {
    removeGemFromCollection,
    updateBookmarkWithExistingCollection
} from '../actions/collection';
import { setActiveHomeTab } from "../actions/app";
import { checkGemExistsById } from "./find-collection-id";
import { fetchCurrentTab } from "./fetch-current-tab";
import axios from "axios";
import session from "./session";
import { syncAiPromptAgain } from "../actions/ai-brands";

export const updateLocation = (location, tab, navigate, allHighlights = []) => {
    // Get the current state of the store
    const state = store.getState();
    // const importBookmark = state?.collection?.collectionData;

    const currentGem = state?.gem?.currentGem;
    if (currentGem) {
        store.dispatch(setCurrentGem(null))
    }

    if (location === "?add-bookmark") {
        // navigate("/add-bookmark")
        fetchCurrentTab().then(res => {
            if (res?.url.startsWith("https://www.youtube.com/watch") || res?.url.startsWith("https://vimeo.com/")) {
                navigate("/video-panel")
            }
            else if (res?.url.startsWith("https://www.amazon.in/") || res?.url.startsWith("https://www.amazon.com/") || res?.url.startsWith("https://www.amazon.co.uk/") || res?.url.startsWith("https://www.amazon.co.in/")) {
                navigate("/product")
            }
            else if(res?.url.startsWith("https://www.imdb.com/")){
                const type = classifyIMDbURL(res?.url)
                if(type === 'Profile'){
                    navigate("/profile-gem?imdb=true")
                }else if(type === 'Movie'){
                    navigate('/movie')
                }else {
                    navigate("/add-bookmark")
                }
            }
            else {
                navigate("/add-bookmark")
            }
        })
    }
    else if (location === "?add-article") {
        navigate("/article")
    }
    else if (location === "?add-import-details") {
        navigate("/add-import-details")
    }
    else if (location === "?bulk-import-reddit") {
        navigate("/add-import-details?bulkReddit=true")
    }
    else if (location === "?add-profile") {
        navigate("/profile-gem?refreshed=true")
    }
    else if (location === "?import-profile") {
        
        navigate("/profile-gem")
    }
    else if (location === "?import-container") {
        navigate("/import-container")
    }
    else if (location === "?edit-bookmark") {
        window.chrome.storage.sync.get("editGemData", (data) => {
            if (data?.editGemData?.id) {
                // store.dispatch(setCurrentGem({ ...data?.editGemData, parent: data?.editGemData?.collection_gems }))
                // store.dispatch(setCurrentMedia(data?.editGemData?.media || null));
                window.chrome.storage.sync.get("editGemData", async (data) => {
                    if (data?.editGemData?.id) {
                        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/gems/${data?.editGemData?.gemId}?populate=*`,{headers: {
                            'Authorization': `Bearer ${session.token}`
                        }})
                        const currentGem = res?.data?.data?.id ? res?.data?.data?.attributes : null
                        if (currentGem) {
                            store.dispatch(setCurrentGem({ ...currentGem, 
                                id:res?.data?.data?.id,
                                tags: currentGem?.tags?.data || [],
                                parent: {
                                    id:currentGem?.collection_gems?.data?.id,
                                    ...currentGem?.collection_gems?.data?.attributes
                                }, 
                            collection_id: currentGem?.collection_gems?.data?.id }))
                            store.dispatch(setCurrentMedia(currentGem?.media_type || null));

                            if (data?.editGemData?.id && data?.editGemData?.media_type === "Text Expander") {
                                navigate("/text")
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "Highlight") {
                                navigate(`/highlight-panel`)
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "Code") {
                                navigate(`/codesnippet-panel`)
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "Image") {
                                navigate(`/image-panel`)
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "Audio") {
                                navigate(`/audio-panel`)
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "Video") {
                                navigate(`/video-panel`)
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "PDF") {
                                navigate(`/upload-pdf`)
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "Article") {
                                navigate(`/article`)
                            }
                            else if (data?.editGemData?.id && data?.editGemData?.media_type === "Ai Prompt") {
                                navigate(`/ai-prompt`)
                            }
                            else {
                                navigate("/add-bookmark")
                            }
                        } else {
                            navigate("/search-bookmark")
                        }
                    } else {
                        navigate("/search-bookmark")
                    }
                })
                window.chrome.storage.sync.remove('editGemData')
            }
        });
    }
    else if (location === "?add-highlight") {
        navigate("/highlight-panel")
    }
    else if (location === "?add-ai") {
        store.dispatch(syncAiPromptAgain(true))
        navigate("/ai")
    }
    else if (location === "?add-ai&refetch=true") {
        store.dispatch(syncAiPromptAgain(true))
        navigate("/ai?refetch=true")
    }
    else if (location === "?add-prompt") {
        navigate("/ai-prompt")
    }
    else if (location === "?edit-highlight") {
        window.chrome.storage.sync.get("highlightUpdate", (data) => {
            if (data && data.highlightUpdate && data.highlightUpdate.current) {
                const { id, media } = data.highlightUpdate.current
                if (allHighlights.length !== 0) {
                    const idx = allHighlights.findIndex((o) => { return o.id === id })
                    if (idx !== -1) {
                        const hObj = allHighlights[idx]
                        store.dispatch(setCurrentGem({ ...hObj, parent: hObj.collection_gems, collection_id: hObj.collection_gems?.id }))
                        store.dispatch(setCurrentMedia(media))
                        window.chrome.storage.sync.remove('highlightUpdate')
                        if (hObj.media_type === "Highlight") {
                            navigate("/highlight-panel")
                        }
                        else if (hObj.media_type === "Ai Prompt") {
                            navigate("/ai-prompt")
                        }
                    }
                }
                else {
                    store.dispatch(getAllTypeHighlights(tab.url)).then((res) => {
                        if (res.error === undefined) {
                            const { data } = res.payload
                            const idx = data.findIndex((o) => { return o.id === id })
                            if (idx !== -1) {
                                const hObj = data[idx]
                                store.dispatch(setCurrentGem({ ...hObj, parent: hObj.collection_gems, collection_id: hObj.collection_gems?.id }))
                                store.dispatch(setCurrentMedia(media))
                                window.chrome.storage.sync.remove('highlightUpdate')
                                if (hObj.media_type === "Highlight") {
                                    navigate("/highlight-panel")
                                }
                                else if (hObj.media_type === "Ai Prompt") {
                                    navigate("/ai-prompt")
                                }
                            }
                        }
                    })
                }
            }
        })
    }
    else if (location === "?delete-highlight") {
        window.chrome.storage.sync.get("highlightDelete", (data) => {
            if (data && data.highlightDelete?.id && data.highlightDelete?.parent) {
                const { id, parent } = data.highlightDelete
                store.dispatch(removeGemFromCollection(id, parent))
                store.dispatch(updateHighlightsArr(data.highlightDelete, "delete"))
                window.chrome.storage.sync.remove('highlightDelete')
            }
        })
    }
    else if (location === "?add-code") {
        navigate("/codesnippet-panel")
    }
    else if (location === "?highlight-list") {
        store.dispatch(setActiveHomeTab(HIGHLIGHT_TAB_KEY))
        navigate("/all-highlights")
    }
    else if (location === "?image") {
        navigate("/image-panel")
    }
    else if (typeof location === "string" && location.includes("?pdfHighlight")) {
        const params = new URLSearchParams(window.location.search)
        const file = params.get('file')
        const originalFile = params.get('originalFile')
        navigate(`/pdf-highlight?file=${file ? file : ''}&originalFile=${originalFile ? originalFile : ''}`)
    }
    else if (location === "?added-bookmark-update") {
        window.chrome.storage.sync.get("bookmarkAddInfo", (data) => {
            if (data && data.bookmarkAddInfo && data.bookmarkAddInfo.bookmark) {
                const { bookmark } = data.bookmarkAddInfo
                store.dispatch(updateBookmarkWithExistingCollection(bookmark, bookmark.parent, false, "add", null))
                window.chrome.storage.sync.remove('bookmarkAddInfo')
            }
        })
    }
    else if (location === "?screenshot") {
        navigate("/screenshot")
    }
    else if (location === "?save-tweet") {
        navigate("/social-feed?refreshed=true")
    }
    else if (location === "?save-social") {
        navigate("/social-feed?refreshed=true")
    }
    else if (location === "?save-book") {
        navigate("/book?refreshed=true")
    }
    else if (location === "?save-profile") {
        navigate("/profile-feed")
    }
    else if (location === "?save-video") {
        navigate("/video-panel")
    }
    else if (location === "?save-article") {
        navigate("/article?refreshed=true")
    }
    else if (location === "?save-testimonial") {
        navigate("/testimonial?refreshed=true")
    }
    else if (location === "?refresh-gems") {
        navigate("/search-bookmark?refetch=refetch-gem")
    }
    else if (location === "?add-text-expander") {
        navigate("/text")
    }
    else if (location === "?add-note") {
        navigate("/note")
    }
    else if (location === "?quick-note") {
        navigate("/quick-note")
    }
    else if (location === "?add-quote") {
        navigate("/quote")
    }
    else if (location === "?edit-text-expander") {
        window.chrome.storage.sync.get("editGemData", async (data) => {
            // 
            if (data?.editGemData?.gemId) {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/gems/${data?.editGemData?.gemId}?populate=*`,{headers: {
                    'Authorization': `Bearer ${session.token}`
                }})
                const currentGem = res?.data?.data?.id ? res?.data?.data?.attributes : null
                if (currentGem) {
                    store.dispatch(setCurrentGem({ ...currentGem, 
                        id:res?.data?.data?.id,
                        tags: currentGem?.tags?.data || [],
                        parent: {
                            id:currentGem?.collection_gems?.data?.id,
                            ...currentGem?.collection_gems?.data?.attributes
                        }, 
                    collection_id: currentGem?.collection_gems?.data?.id }))
                    store.dispatch(setCurrentMedia(currentGem?.media_type || null));
                    navigate("/text")
                } else {
                    navigate("/search-bookmark")
                }
            } else {
                navigate("/search-bookmark")
            }
            window.chrome.storage.sync.remove('editGemData')
        })
    }
    else if (location === "?edit-ai-prompt") {
        window.chrome.storage.sync.get("editGemData", async (data) => {
            if (data?.editGemData?.gemId) {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/gems/${data?.editGemData?.gemId}?populate=*`,{headers: {
                    'Authorization': `Bearer ${session.token}`
                }})
                const currentGem = res?.data?.data?.id ? res?.data?.data?.attributes : null
                if (currentGem) {
                    store.dispatch(setCurrentGem({ ...currentGem, 
                        id:res?.data?.data?.id,
                        tags: currentGem?.tags?.data || [],
                        parent: {
                            id:currentGem?.collection_gems?.data?.id,
                            ...currentGem?.collection_gems?.data?.attributes
                        }, 
                    collection_id: currentGem?.collection_gems?.data?.id }))
                    store.dispatch(setCurrentMedia(currentGem?.media_type || null));
                    navigate("/ai-prompt")
                } else {
                    navigate("/search-bookmark")
                }
            } else {
                navigate("/search-bookmark")
            }
            window.chrome.storage.sync.remove('editGemData')
        })
    }
    else if (location === "?open-edit-bookmark") {
        window.chrome.storage.sync.get("editGemData",async (data) => {
            if (data?.editGemData?.gemId) {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/gems/${data?.editGemData?.gemId}?populate=*`,{headers: {
                    'Authorization': `Bearer ${session.token}`
                }})
                const currentGem = res?.data?.data?.id ? res?.data?.data?.attributes : null
                if (currentGem) {
                    store.dispatch(setCurrentGem({ ...currentGem, 
                        id:res?.data?.data?.id,
                        tags: currentGem?.tags?.data || [],
                        parent: {
                            id:currentGem?.collection_gems?.data?.id,
                            ...currentGem?.collection_gems?.data?.attributes
                        }, 
                    collection_id: currentGem?.collection_gems?.data?.id }))
                    store.dispatch(setCurrentMedia(currentGem?.media_type || null));
                    navigate(`/bookmark/${data?.editGemData?.gemId}`)
                } else {
                    navigate("/search-bookmark")
                }
            } else {
                navigate("/search-bookmark")
            }
            window.chrome.storage.sync.remove('editGemData')
        })
    }
    else if (location === "?open-save-tabs") {
        navigate("/save-tabs")
    }
    else if (location === "?open-info") {
        navigate("/info")
    }
    else {
        navigate("/search-bookmark")
    }
}