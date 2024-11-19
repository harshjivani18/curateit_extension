import React, { useEffect, 
       useRef,
       useState }                               from "react";
import { useNavigate }                          from "react-router-dom";
import { useSelector,
         useDispatch }                          from "react-redux";  
import { CheckIcon }                            from "@heroicons/react/24/outline";
import { message }                              from "antd";
import { v4 as uuidv4 }                         from "uuid";

import OperationLayout                          from "../../components/layouts/OperationLayout";
import { HIGHLIGHTED_COLORS, TEXT_MESSAGE }                   from "../../utils/constants";
import { copyText,
         panelClose }                           from "../../utils/message-operations";
import { removeDuplicates }                     from "../../utils/equalChecks";
import { fetchCurrentTab }                      from "../../utils/fetch-current-tab";

import { addHighlight,
         updateHighlightsArr,
         getAllHighlights,
         updateHighlightToGem }                 from "../../actions/highlights";
import {  addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import TextareaAutosize from "react-textarea-autosize";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const QuotePage = (props) => {
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const highlightRef                  = useRef()
    const defaultColorObjIdx            = HIGHLIGHTED_COLORS.findIndex((h) => { return h.id === 4})
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const currentMedia                  = useSelector((state) => state.gem.currentMedia);
    const tabDetails                    = useSelector((state) => state.app.tab)
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [highlightedText, 
           setHighlightedText]          = useState(currentMedia?.text || "")
    const [highlightedColor,
           setHighlightedColor]         = useState(currentMedia?.color || HIGHLIGHTED_COLORS[defaultColorObjIdx])
    const [highlightDetails,
           setHighlightDetails]         = useState(currentMedia?.details || null)
    const [highlightClass,
           setHighlightClass]           = useState(currentMedia?.styleClassName || "")
    const [highlightBox,
           setHighlightBox]             = useState(currentMedia?.box || null)
    const [processing, setProcessing]   = useState(false)
    const [isExist, setIsExist]         = useState(false)

    useEffect(() => {
        window.chrome.storage.sync.get("quoteInfo", (data) => {
            if (data && data.quoteInfo) {
                setHighlightedText(data.quoteInfo.text)
                setHighlightDetails(data.quoteInfo)
                setHighlightBox(data.quoteInfo)
                setIsExist(true)
            }
        })

        return () => {
            window.chrome.storage.sync.remove("quoteInfo")
        }
    }, [])

    const onSubmitHighlight = async (obj) => {
        const newLink       = (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1): obj.assetUrl
        let res             = null
        setProcessing(true)
        const mediaCovers   = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers   = removeDuplicates(mediaCovers)
        let payload       = {
            notes: obj.remarks,
            color: highlightedColor,
            text: highlightedText,
            title: highlightedText.substr(0,50),
            description: obj.description,
            expander: obj.shortUrlObj,
            link:  newLink,
            collections: obj.selectedCollection?.id,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            box: highlightBox,
            _id: currentMedia?.id || highlightDetails?.id || uuidv4(),
            details: highlightDetails,
            styleClassName: highlightClass,
            is_favourite: obj.favorite,
            metaData: {
                covers: finalCovers,
                icon: obj?.favIconImage || '',
                docImages: obj.docImages,
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            showThumbnail: obj?.showThumbnail
        }
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null
        
        if (currentGem) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem.id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)

            if(isSingleBkShared && !isSelectedCollectionShared){
                message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT)
                setProcessing(false)
                return;
            }
            if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
            }
            res = await dispatch(updateHighlightToGem(obj.selectedCollection?.id, currentGem.id, payload))
        }
        else {
        isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
        }
            let parent_type = "";
            if (payload.link.includes("youtube.com")) {
            parent_type = "Video";
            }
            res = await dispatch(addHighlight(payload.collections, payload, parent_type))
        }

        setProcessing(false)
        setHighlightBox(null)
        setHighlightClass("")
        setHighlightedColor(HIGHLIGHTED_COLORS[defaultColorObjIdx])
        setHighlightedText("")
        setIsExist(false)
        window.chrome.storage.sync.remove('quoteInfo')
        if (res.error === undefined) {
            const { data } = res.payload
            if (currentGem) {
                const parent              = currentGem.parent || currentGem.collection_gems
                const isCollectionChanged = parent.id !== obj.selectedCollection.id;
                const o = {
                    ...data,
                    tags: obj.selectedTags
                }
                if (isCollectionChanged) {
                    o["collection_id"] = obj.selectedCollection.id
                    o["collection_gems"] = obj.selectedCollection
                }
                if(isSelectedCollectionShared){
                    dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '',isCurrentCollectionShared))
                    dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : data))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }
                dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : data, obj.selectedCollection, isCollectionChanged, "update", parent))
                dispatch(updateHighlightsArr((currentGem) ? { ...currentGem, ...o } : data, "edit"))
            }
            else {
                const g      = {
                    ...data,
                    id: data.id,
                    title: data.title,
                    media: data.media,
                    media_type: data.media_type,
                    url: data.url,
                    remarks: data.remarks,
                    metaData: data.metaData,
                    description: data.description,
                    S3_link: data.S3_link,
                    is_favourite: data.is_favourite,
                    collection_id: obj.selectedCollection.id,
                    collection_gems: obj.selectedCollection,
                    tags: obj.selectedTags
                }
                if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    dispatch(updateHighlightsArr(g, "add"))
                }
                if(!isSelectedCollectionShared){
                    dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
                    dispatch(updateHighlightsArr(g, "add"))
                }
            }
            const response = await dispatch(getAllHighlights(newLink))
            if (response.error === undefined && response.payload && response.payload.data && response.payload.data.length>0) { 
                const tabs = tabDetails || await fetchCurrentTab()
                window.chrome.tabs.sendMessage(tabs.id, { value: JSON.stringify(response.payload.data), type: "CT_HIGHLIGHT_DATA" })
            }
        }
        navigate("/search-bookmark")
    }

    const onTextCopy = () => {
        try {
            copyText(highlightedText);
            message.success('Quote Copied to clipboard');
        } catch (err) {
            message.error('Not have permission')
        }
    }

    const onHighlightBlur = () => {
        if (highlightRef) {
            setHighlightedText(highlightRef.current.innerText)
        }
    }

    const setCodeReset = () => {
        setHighlightedText('')
    }

    return (
        <OperationLayout currentGem={currentGem}
                         processing={processing}
                         onButtonClick={onSubmitHighlight}
                         pageTitle={currentGem ? "Update quote" : "Add new quote"}
                         isHideBackButton={false}
                         isHideHeader={props.isHideHeader || false}
                         mediaType={"Quote"}
                         onPanelClose={panelClose}
                         onTextCopy={onTextCopy}
                         setResetData = {setCodeReset}
                         >
            {/* <div className="pt-4">
                <div className='bg-white rounded-md p-2 border-2'>
                    <div>
                        <svg 
                            className='highlight-copy-svg'
                            onClick={onTextCopy}
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/></svg>
                        <div style={{height:'auto'}}
                             contentEditable={!isExist}
                             ref={highlightRef}
                             onBlur={onHighlightBlur}
                             className={classNames(highlightedColor?.border ,'flex-1 text-xs text-gray-500 border-l-4 pl-2 py-0 outline-none highlight-content-container')}>
                            {highlightedText}
                        </div>
                    </div>
                    <div className='flex justify-end items-baseline space-x-3'>
                        <div className='flex justify-end space-x-2 items-center'>
                            {HIGHLIGHTED_COLORS.map(color => (
                                <button 
                                    key={color.id} 
                                    style={{backgroundColor: `${color.bg}`}}
                                    className={classNames('flex justify-center items-center h-4 w-4 rounded-full border-[1px] border-gray-400')}
                                    onClick={() => { 
                                        setHighlightedColor(color)  
                                        setHighlightClass(color.className)
                                    }}
                                >
                                    <CheckIcon className={classNames(color.id === highlightedColor?.id ? "" : color.text,'h-2 w-2')} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div> */}
            <TextareaAutosize
            value={highlightedText}
            onChange={(e) => setHighlightedText(e.target.value)}
            placeholder="Enter quote"
            minRows={4}
            className="w-full rounded-md resize-none !outline-none !focus:outline-none textarea-border h-auto"
          />
        </OperationLayout>
    )
}

export default QuotePage