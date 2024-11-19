import "./TextPage.css";
import React, { useEffect, 
       useState }                               from "react";
import { useNavigate }                          from "react-router-dom";
import { useSelector,
         useDispatch }                          from "react-redux";  
// import { CheckIcon }                            from "@heroicons/react/24/outline";
import { message }                              from "antd";
import ReactQuill                               from "react-quill";
import { v4 as uuidv4 }                         from "uuid";

import OperationLayout                          from "../../components/layouts/OperationLayout";
import { panelClose }                           from "../../utils/message-operations";
import { removeDuplicates }                     from "../../utils/equalChecks";
import { fetchCurrentTab }                      from "../../utils/fetch-current-tab";

import { addHighlight,
         updateHighlightsArr,
         getAllHighlights,
         updateHighlightToGem }                 from "../../actions/highlights";
import {  addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { TEXT_MESSAGE } from "../../utils/constants";
import { PiPencilSimple } from "react-icons/pi";

let currentParentDetails            = null

const TextPage = (props) => {
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    // const highlightRef                  = useRef()
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const tabDetails                    = useSelector((state) => state.app.tab)
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const expanderIdx                   = currentGem && currentGem.expander ? currentGem.expander.findIndex((e) => { return e.type ==="expander" }) : -1
    const expanderObj                   = expanderIdx !== -1 ? currentGem.expander[expanderIdx] : null
    const [textExpander, 
           setTextExpander]             = useState(expanderObj?.text || "")

    const [expanderPlain,
           setExpanderPlain]            = useState(expanderObj?.plainText || "")
    const [processing, setProcessing]   = useState(false)
    const [showPromptEditor, setShowPromptEditor]     = useState(!currentGem ? false : true)

    const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])

    const handleUpdateInformation = (gemObj) => {
        setDetails({...details,...gemObj})
    }

    useEffect(() => {
        window.chrome.storage.sync.get("textExpanderData", (data) => {
            if (data && data?.textExpanderData) {
                setTextExpander(data.textExpanderData.text)
            }
        })

        return () => {
            window.chrome.storage.sync.remove("textExpanderData")
        }
    }, [])

    const onSubmitHighlight = async (obj) => {
        if (obj.shortUrlObj.length === 0) { 
            message.error("Please enter a short url")
            return
        }
        if (textExpander === "") {
            message.error("Please enter a text for text expander")
            return
        }
        const newLink       = (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1): obj.assetUrl
        let res             = null
        setProcessing(true)
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null
        const mediaCovers   = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers   = removeDuplicates(mediaCovers)
        let payload       = {
            notes: obj.remarks,
            color: "",
            text: textExpander,
            // title: expanderPlain || textExpander || obj.heading,
            title: (expanderPlain && obj?.shortUrlObj && Array.isArray(obj?.shortUrlObj)) ? 
                obj?.shortUrlObj[0]?.keyword +" "+ expanderPlain.substring(0, 20) : (expanderPlain || textExpander || obj.heading),
            description: obj.description,
            expander: textExpander !== "" && obj.shortUrlObj.length > 0 ? [ ...obj.shortUrlObj, { type: "expander", keyword: obj.shortUrlObj[0].keyword, url: obj.assetUrl, text: textExpander, plainText: expanderPlain }] : obj.shortUrlObj,
            link:  newLink,
            collections: obj.selectedCollection?.id,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            box: null,
            _id: uuidv4(),
            details: null,
            styleClassName: "",
            is_favourite: obj.favorite,
            metaData: {
                covers: finalCovers,
                icon: obj?.favIconImage || '',
                docImages: obj.docImages,
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            is_enable_for_all_sites: obj?.enableSites,
            prompt_priority_sites: obj?.prioritySites,
        }

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
        setTextExpander("")
        setExpanderPlain("")
        window.chrome.storage.sync.remove('textExpanderData')
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

    const onTextExpanderChange = (content, delta, source, editor) => {
        setTextExpander(content)
        setExpanderPlain(editor.getText())
    }

    const quillModules = {
        toolbar: [
          [{ 'header': [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{'list': 'ordered'}, {'list': 'bullet'}],
          ['link']
        ]
    }

    const setCodeReset = () => {
        setShowPromptEditor(false)
        setTextExpander("")
        setExpanderPlain("")
    }
    
    return (
        <OperationLayout currentGem={currentGem}
                         processing={processing}
                         onButtonClick={onSubmitHighlight}
                         pageTitle={currentGem ? "Update text" : "Add new text"}
                         isHideBackButton={false}
                         isHideHeader={props.isHideHeader || false}
                         mediaType={"Text Expander"}
                         onPanelClose={panelClose}
                         setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
                        getUpdateInformation = {handleUpdateInformation}
                        setResetData = {setCodeReset}
                         >
            {/* <div className="pt-4">
                <div className='bg-white rounded-md p-2 border-2'>
                    <div>
                        <ReactQuill theme="snow" value={textExpander} onChange={onTextExpanderChange} modules={quillModules} style={{ height: 230, backgroundColor: "white" }} />
                    </div>
                </div>
            </div> */}
            {
        showPromptEditor ? 
        <div className="ct-relative">
          <div className="bg-white p-2 mediaAiDiv">
              <ReactQuill
                theme="snow" value={textExpander} onChange={onTextExpanderChange} modules={quillModules} style={{ height: 230, backgroundColor: "white" }}
              />
        </div>
          </div>
        :
            <div className={`cursor-pointer flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg px-2`} 
            onClick={(e) => {
                      e.stopPropagation()
                      setShowPromptEditor(true)
                    }}
              >
              <div className="flex flex-col items-center justofy-center">
                    <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPromptEditor(true)
                    }}
                    >
                      <PiPencilSimple className="text-[#74778B] h-6 w-6 aspect-square"/>
                    </div>
                    <>
                    <div className="my-2 text-sm text-[#74778B] text-center">{`Add your long text here and type in your variables in “{ }” or ‘[ ]’ or ‘( )’`}</div>
                    <div className="text-sm text-[#74778B] text-center"><span className="text-[#74778B]">Example:</span> {`Hi {Name}, Hope you are well`}</div>
                    </>
                </div>
            </div>
        }
        </OperationLayout>
    )
}

export default TextPage