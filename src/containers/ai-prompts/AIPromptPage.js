import React, { useEffect, 
       useRef,
       useState }                               from "react";
import { useNavigate }                          from "react-router-dom";
import { useSelector,
         useDispatch }                          from "react-redux";  
import { CheckIcon, GlobeAltIcon, LockClosedIcon }                            from "@heroicons/react/24/outline";
import { message }                              from "antd";
import { v4 as uuidv4 }                         from "uuid";

import OperationLayout                          from "../../components/layouts/OperationLayout";
// import { HIGHLIGHTED_COLORS }                   from "../../utils/constants";
import { panelClose }                           from "../../utils/message-operations";
import { removeDuplicates }                     from "../../utils/equalChecks";
import { fetchCurrentTab }                      from "../../utils/fetch-current-tab";

import { addHighlight,
         updateHighlight,
         updateHighlightsArr,
         getAllHighlights,
         updateHighlightToGem }                 from "../../actions/highlights";
import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import ReactQuill from "react-quill";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { TEXT_MESSAGE } from "../../utils/constants";
import { PiPencilSimple } from "react-icons/pi";

// function classNames(...classes) {
//  return classes.filter(Boolean).join(' ')
// }
let currentParentDetails            = null

const AIPromptPage = (props) => {
 const dispatch                      = useDispatch()
 const navigate                      = useNavigate()
//  const highlightRef                  = useRef()
//  const defaultColorObjIdx            = HIGHLIGHTED_COLORS.findIndex((h) => { return h.id === 4})
 const currentGem                    = useSelector((state) => state.gem.currentGem);
//  const currentMedia                  = useSelector((state) => state.gem.currentMedia);
 const tabDetails                    = useSelector((state) => state.app.tab)
 const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
//  const [highlightedText, 
//         setHighlightedText]          = useState(currentMedia?.text || "")
//  const [highlightedColor,
//         setHighlightedColor]         = useState(currentMedia?.color || HIGHLIGHTED_COLORS[defaultColorObjIdx])
//  const [highlightDetails,
//         setHighlightDetails]         = useState(currentMedia?.details || null)
//  const [highlightClass,
//         setHighlightClass]           = useState(currentMedia?.styleClassName || "")
//  const [highlightBox,
//         setHighlightBox]             = useState(currentMedia?.box || null)
    const promptIdx = currentGem && currentGem.expander ? currentGem.expander.findIndex((e) => { return e.type === "prompt" }) : -1
    const promptObj = promptIdx !== -1 ? currentGem.expander[promptIdx] : null
    const [promptText, setPromptText] = useState(promptObj?.text || "")
    const [promptPlain, setPromptPlain] = useState(promptObj?.plainText || "")
    const [showPromptEditor, setShowPromptEditor]     = useState(!currentGem ? false : true)


 const [processing, setProcessing]   = useState(false)
//  const [isExist, setIsExist]         = useState(false)

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
    //  window.chrome.storage.sync.get("highlightedData", (data) => {
    //         if (data && data.highlightedData) {
    //         setHighlightedText(data.highlightedData.text)
    //         setHighlightedColor(data.highlightedData.colorCode)
    //         setHighlightDetails(data.highlightedData.details)
    //         setHighlightClass(data.highlightedData.styleClassName)
    //         setHighlightBox(data.highlightedData.box)
    //             setIsExist(true)
    //         }
    //     })

    //  return () => {
    //      window.chrome.storage.sync.remove("highlightedData")
    //  }

     window.chrome.storage.sync.get("textExpanderData", (data) => {
         if (data && data.textExpanderData) {
             setPromptText(data.textExpanderData.text)
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
     if (promptText === "") {
         message.error("Please enter a text for Ai prompt")
         return
     }

     const newLink       = (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1): obj.assetUrl
     let res             = null
     setProcessing(true)
     const mediaCovers   = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
     const finalCovers   = removeDuplicates(mediaCovers)
     let payload       = {
         notes: obj.remarks,
        //  color: highlightedColor,
        //  text: highlightedText,
        //  title: highlightedText,
         color: "",
         text: promptText,
         title: (promptPlain && obj?.shortUrlObj && Array.isArray(obj?.shortUrlObj)) ?
             obj?.shortUrlObj[0]?.keyword + " " + promptPlain.substring(0, 20) : (promptPlain || promptText || obj.heading),
         description: obj.description,
        //  expander: obj.shortUrlObj,
        //  prompt: promptText !== "" && obj.shortUrlObj.length > 0 ? [...obj.shortUrlObj, { type: "expander", keyword: obj.shortUrlObj[0].keyword, url: obj.assetUrl, text: textExpander, plainText: expanderPlain }] : obj.shortUrlObj,
         link:  newLink,
         expander: promptText !== "" && obj.shortUrlObj.length > 0 ? [...obj.shortUrlObj, { type: "prompt", keyword: obj.shortUrlObj[0].keyword, url: obj.assetUrl, text: promptText, plainText: promptPlain }] : obj.shortUrlObj,
         collections: obj.selectedCollection?.id,
         tags: obj.selectedTags?.map((t) => { return t.id }),
         type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
        //  box: highlightBox,
         box: null,
        //  _id: currentMedia?.id || highlightDetails?.id || uuidv4(),
        //  details: highlightDetails,
         _id: uuidv4(),
         details: null,
        //  styleClassName: highlightClass,
         styleClassName: null,
         is_favourite: obj.favorite,
         metaData: {
             covers: finalCovers,
             icon: obj.favIconImage || null,
             defaultIcon: obj?.defaultFavIconImage || '',
             docImages: obj.docImages,
             defaultThumbnail: obj?.defaultThumbnailImg || '',
         },
         isPublicPrompt: obj?.isPublicPrompt === "public" ? true : false,
         is_enable_for_all_sites: obj?.enableSites,
         prompt_priority_sites: obj?.prioritySites,
         prompt_category: obj?.promptCategory,
     }

    //  if (currentMedia?.colorCode) { 
    //      payload["colorCode"] = highlightedColor
    //  }
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
        res = await dispatch(addHighlight(payload.collections, payload))
     }

     setProcessing(false)
    //  setHighlightBox(null)
    //  setHighlightClass("")
    //  setHighlightedColor(HIGHLIGHTED_COLORS[defaultColorObjIdx])
    //  setHighlightedText("")
     setPromptText("")
     setPromptPlain("")
    //  setIsExist(false)
     window.chrome.storage.sync.remove('aiPromptData')
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
                    dispatch(moveGemToSharedCollection(payload?.collections,currentGem.id,(currentGem) ? { ...currentGem, ...o } : data))
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
                setProcessing(false)
                return navigate("/search-bookmark")
            }
             dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
             dispatch(updateHighlightsArr(g, "add"))
         }
         const response = await dispatch(getAllHighlights(newLink))
         if (response.error === undefined && response.payload && response.payload.data && response.payload.data.length>0) { 
             const tabs = tabDetails || await fetchCurrentTab()
             window.chrome.tabs.sendMessage(tabs.id, { value: JSON.stringify(response.payload.data), type: "CT_HIGHLIGHT_DATA" })
         }
     }
     if (props.onClose) {
         props.onClose()
     }
     else {
         navigate("/search-bookmark")
     }
 }

//  const onTextCopy = () => {
//      try {
//          copyText(highlightedText);
//          message.success('Highlight Copied to clipboard');
//      } catch (err) {
//          message.error('Not have permission')
//      }
//  }

//  const onHighlightBlur = () => {
//      if (highlightRef) {
//          setHighlightedText(highlightRef.current.innerText)
//      }
//  }

    const onPromptChange = (content, delta, source, editor) => {
        setPromptText(content)
        setPromptPlain(editor.getText())
    }

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
        ],
    }

    const setCodeReset = () => {
        setShowPromptEditor(false)
        setPromptText('')
    }

 return (
     <OperationLayout currentGem={currentGem}
                      processing={processing}
                      onButtonClick={onSubmitHighlight}
                      pageTitle={currentGem ? "Update ai prompt" : "Add new ai prompt"}
                      isHideBackButton={false}
                      isHideHeader={props.isHideHeader || false}
                      mediaType={"Ai Prompt"}
                      onPanelClose={panelClose}
                      setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
                      getUpdateInformation = {handleUpdateInformation}
                      setResetData = {setCodeReset}
                      >
         {
        showPromptEditor ? 
        <div className="ct-relative">
          <div className="flex w-full justify-end group">
            <div className="cursor-pointer ">
              {details?.isPublicPrompt === 'private' ? <LockClosedIcon className="h-4 w-4"/> : <GlobeAltIcon className="h-4 w-4"/>}
            </div>

            <div className="hidden group-hover:block rounded bg-[#FDFDFD] text-[#475467] py-1 px-2 border border-solid border-[#ABB7C9] shadow absolute top-[-35px] right-0 z-10 text-xs">
              {details?.isPublicPrompt === 'private' ? 'Private prompt' : 'Public prompt'}
            </div>
          </div>
          <div className="ct-relative">
          <div className="bg-white p-2 mediaAiDiv">
              <ReactQuill
                theme="snow" 
                value={promptText} 
                onChange={onPromptChange} 
                modules={quillModules} 
                style={{ height: 220 }}
              />
        </div>
          </div>
        </div>
        :
            <div className={`cursor-pointer flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg px-2`} 
            onClick={(e) => {
                      e.stopPropagation()
                      setShowPromptEditor(true)
                    }}
              >
              <div className="flex flex-col items-center justify-center">
                    <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPromptEditor(true)
                    }}
                    >
                      <PiPencilSimple className="text-[#74778B] h-6 w-6 aspect-square"/>
                    </div>
                    <>
                    <div className="my-2 text-sm text-[#74778B] text-center">{`Add your prompt and type in your variables in “{ }”`}</div>
                    <div className="text-sm text-[#74778B] text-center"><span className="text-[#74778B]">Example:</span> {`Explain me about {topic}, as a 5 year old.`}</div>
                    </>
                </div>
            </div>
        }
         {/* <div className="pt-4">
             <div className='bg-white rounded-md p-2 border-2'>
                 <div>
                     <svg 
                         className='highlight-copy-svg'
                         onClick={onTextCopy}
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/></svg>
                     <div style={{height:'auto'}}
                          contentEditable={!isExist && !currentGem}
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
     </OperationLayout>
 )
}

export default AIPromptPage