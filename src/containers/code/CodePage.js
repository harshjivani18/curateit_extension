import React, { useState,
       useRef,
       useEffect, 
       useCallback}                          from "react";
import { useSelector,
         useDispatch }                      from "react-redux";
import { useNavigate }                      from "react-router-dom";
import { message }                          from "antd";
import { v4 as uuidv4 }                     from 'uuid'

import Input                                from "../../components/input/Input";
import OperationLayout                      from '../../components/layouts/OperationLayout'
import { copyText, panelClose }             from '../../utils/message-operations'
import session                              from "../../utils/session";
import { removeDuplicates }                 from "../../utils/equalChecks";

import { addCode,
         updateCodeToGem }                  from "../../actions/code";
import { 
    addGemToSharedCollection,
    moveGemToSharedCollection,
    removeGemFromCollection,
    updateBookmarkWithExistingCollection 
}                                           from "../../actions/collection";
import { updateHighlightsArr }              from "../../actions/highlights";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { LANGUAGES, TEXT_MESSAGE, THEMES } from "../../utils/constants";
import { CommandLineIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import CodeMirror                   from '@uiw/react-codemirror';
import { javascript }               from '@codemirror/lang-javascript';

const CodePage = () => {
    const dispatch                          = useDispatch()
    const navigate                          = useNavigate()
    const codeRef                           = useRef()
    const currentGem                        = useSelector((state) => state.gem.currentGem);
    const currentMedia                      = useSelector((state) => state.gem.currentMedia);
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [language, setLanguage]           = useState(currentMedia?.language || "Javascript")
    const [code, setCode]                   = useState(currentMedia?.code || "")
    const [existingGemId, setExistingGemId] = useState(null)
    const [processing, setProcessing]       = useState(false)
    const [showCodeEditor, setShowCodeEditor]     = useState(true)
    const [theme, setTheme]     = useState("dark");
    const [extentionLng, 
           setExtentionsLng]    = useState(javascript())
    
    const lowerLang             = language ? language.toLowerCase() : "javascript"

    useEffect(() => {
      if(language){
        handleLanguageChange(language);

        //Set initaila theme
        handleThemeChange("dracula")
      }
    }, [language]);

    const handleThemeChange = (e) => {
        const value = e?.target?.value || e;
        const selectedObj = THEMES.filter(lng => lng.mode === value)[0];
        if (selectedObj) {
            setTheme(selectedObj.theme);
        } else {
            setTheme("dark");
        }
    }

    const handleLanguageChange = (e) => {
        const selectedObj = LANGUAGES.filter(lng => lng.mode === lowerLang)[0];
        if (selectedObj) {
            setExtentionsLng(selectedObj.lng);
        } else {
            setExtentionsLng(javascript());
        }
    }

    const onCodeChange = useCallback((val, viewUpdate) => {
    setCode(val);
    }, []);
    
    useEffect(() => {
        window.chrome.storage.sync.get("codeSnippetData", (data) => {
            console.log("data", data)
            if (data && data.codeSnippetData) {
                setCode(data.codeSnippetData.code)
            }
        })
        if (currentGem) {
            setExistingGemId(currentGem.id)
        }

        return () => {
            window.chrome.storage.sync.remove("codeSnippetData")
        }
    }, [])

    const onSubmitBookmark = async (obj) => {
        const mediaCovers  = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers  = removeDuplicates(mediaCovers)
        let payload = {
            title: obj.heading,
            description: obj.description,
            expander: obj.shortUrlObj,
            type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            author: session.userId ? parseInt(session.userId) : null,
            url: (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1): obj.assetUrl,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            collections: obj.selectedCollection.id,
            is_favourite: obj.favorite,
            notes: obj.remarks,
            code: code,
            language: language,
            metaData: {
                covers: finalCovers,
                icon: obj?.favIconImage || '',
                docImages: obj.docImages,
                defaultThumbnail: obj?.defaultThumbnailImg || '',
                defaultIcon: obj?.defaultFavIconImage || ''
            },
            _id: uuidv4(),
            showThumbnail: obj?.showThumbnail
        }
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null

        setProcessing(true)
        if (existingGemId) {
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
            const res = await dispatch(updateCodeToGem(payload.collections, existingGemId, payload))
            if (res.error === undefined && res.payload && res.payload.error === undefined) {
                const isCollectionChanged = currentGem?.parent.id !== obj.selectedCollection.id;
                const { data } = res.payload 
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
                dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : data, obj.selectedCollection, isCollectionChanged, "update", currentGem?.parent))
                dispatch(updateHighlightsArr((currentGem) ? { ...currentGem, ...o } : data, "edit"))
            }
        }
        else {
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
            }
            const res = await dispatch(addCode(payload))
            if (res.error === undefined && res.payload && res.payload?.error === undefined) {
                const { data } = res.payload 
                const g      = {
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
                    tags: obj.selectedTags,
                    showThumbnail: data?.showThumbnail
                }
                if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }
                dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
            }
        }
        setProcessing(false)
        window.chrome.storage.sync.remove('codeSnippetData')
        setCode("")
        setLanguage("")
        navigate("/search-bookmark?refetch=refetch-gem")
        // panelClose()
    }

    const onCopyCode = () => {
        if (code) {
            try {
                copyText(code)
                message.success("Code is copied to clipboard")
            }
            catch (err) {
                message.error("An error occured while copyinh this code", "error")
            }
        }
    }

    const onCodeBlur = (e) => {
        if (codeRef) {
            setCode(codeRef.current.innerText)
        }
    }

    const onCodeClick = (e) => {
        if (codeRef) {
            codeRef.current.focus()
        }
    }

    const setCodeReset = () => {
        setCode('')
        setLanguage('')
        setShowCodeEditor(false)
    }

    return (
        <OperationLayout currentGem={currentGem}
                         processing={processing}
                         onButtonClick={onSubmitBookmark}
                         pageTitle={"Code Snippet"}
                         isHideBackButton={false}
                         mediaType={"Code"}
                         onPanelClose={panelClose}
                         setCodeLanguage={setLanguage}
                         codeLanguage={language}
                         onTextCopy={onCopyCode}
                         setResetData = {setCodeReset}
                         >
            {/* <div className="pt-4">
                <Input size="medium w-full mb-2" type="text" name="language" placeholder="Enter Language" 
                       value={language} 
                       onChange={(e)=>setLanguage(e.target.value)}
                />
            </div>

            <div className="pt-4">
                <div className="code-header">
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Code Snippet</h6>
                    <svg 
                        onClick={onCopyCode}
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/></svg>
                </div>
                <div className='bg-[#F8FBFF] rounded-t-[16px] p-relative'>
                    <pre className="pre-tag-style" style={{height:'250px'}}>
                        <code className="code-tag-style" style={{height:'250px'}} contenteditable="true" spellcheck="false" ref={codeRef} onBlur={onCodeBlur}>
                            {code}
                        </code>
                    </pre>
                </div>
            </div> */}
            {
            showCodeEditor ? 
            // <div className="relative">
            // <div className='max-h-full w-full bg-gradient-to-t from-[#256F6C] to-[#50BF91] py-[1.2rem] rounded-md'>
            //         <div className='flex justify-center items-center'>
            //             <div className={`bg-[#1A3D71] rounded-md shadow-sm w-full`}>
            //                 <div className='flex justify-start h-8 pt-[2px] scrollbar-hide'>
                                
            //                     <div className='bg-gray-700 flex justify-between items-center gap-2 px-2 h-full text-white cursor-pointer'>
            //                         <button className='flex justify-start items-center gap-1'>
            //                             <DocumentTextIcon className='h-3 w-3' />
            //                             <span className='text-xs'>index.js</span>
            //                         </button>
            //                     </div>
            //                 </div>
            //                 <div className='text-[0.7rem] overflow-auto'>
            //                     <CodeMirror
            //                         style={{
            //                         overflow: 'hidden',
            //                         wordBreak: 'break-all',
            //                         wordWrap: 'break-word',
            //                         flexWrap: 'wrap',
            //                         // width: '100%',
            //                     }}
            //                         width={"100%"}
            //                         indentWithTab={true}
            //                         value={code}
            //                         theme={theme}
            //                         extensions={[extentionLng]}
            //                         onChange={onCodeChange}
            //                         minHeight="200px"
            //                     />
            //                 </div>
            //             </div>
            //         </div>
            // </div>
            // </div>
            <>
                <div className='bg-[#F8FBFF] rounded-t-[16px] p-relative' onClick={onCodeClick}>
                    <pre className="pre-tag-style" style={{height:'250px'}} onClick={onCodeClick}>
                        <code className="code-tag-style" style={{height:'250px'}} contenteditable="true" spellcheck="false" ref={codeRef} onBlur={onCodeBlur} onClick={onCodeClick}>
                            {code}
                        </code>
                    </pre>
                </div>
            </>
            :
            <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg px-2`} 
                >
                <div className="flex flex-col items-center justofy-center">
                        <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                        onClick={(e) => {
                        e.stopPropagation()
                        setShowCodeEditor(true)
                        }}
                        >
                        <CommandLineIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                        </div>
                        <div className="my-2 text-sm text-[#74778B] text-center">Add Code</div>
                    </div>
            </div>
            }
        </OperationLayout>
    )
}

export default CodePage