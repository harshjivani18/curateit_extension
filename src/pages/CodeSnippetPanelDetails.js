import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteCode, getAllCodes, getSingleCode, singleCodeReset, updateCode } from "../actions/code";
import BookmarkFooter from "../components/bookmarkFooter/BookmarkFooter";
import ComboBox from "../components/combobox/ComboBox";
import TypeComboBox from "../components/combobox/TypeComboBox";
import Input from "../components/input/Input";
import { WithContext as ReactTags } from 'react-tag-input';
import { addTag } from "../actions/tags";
import session from "../utils/session";
import { KEY_CODES } from "../utils/constants";
import { getActiveTabURL } from "../utils/send-theme-to-chrome";
import { useSelector } from "react-redux";
import { MdOutlineOpenInNew } from "react-icons/md";
import { PencilSquareIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { copyText } from "../utils/message-operations";
import { fetchCurrentTab } from "../utils/fetch-current-tab";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const CodeSnippetPanelDetails = () => {
    const [showTab,setShowTab] = useState(true)

    const dispatch = useDispatch(); 
    const navigate = useNavigate()

    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [error, setError] = useState(false)
    const [gemSingleId, setGemSingleId] = useState('')

    //states
    const [loader, setLoader] = useState('');
    const [assetUrl, setAssetUrl] = useState('');
    const [selectedCollection, setSelectedCollection] = useState({id:Number(session.unfiltered_collection_id),name:"Unfiltered"});
    const [selectedType, setSelectedType] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false)
    const [code,setCode] = useState('')
    const [language,setLanguage] = useState('')
    const collections       = useSelector((state) => state.collection.collectionData);
    const singleCode       = useSelector((state) => state.codes.singleCode);
    const userTags          = useSelector((state) => state.user.userTags)
    const tabDetails        = useSelector((state) => state.app.tab)
    const [loadingState, setLoadingState] = useState(false)

    useEffect(() => {
    const getCall = async () => {
        setLoadingState(true)
        setLoader('loading')
        const res = await dispatch(getSingleCode('','',''))
  
        if(res){
            setLoadingState(false)
            setLoader('success')
        }
    }
    getCall()
  },[])

    useEffect(() => {
    if(singleCode && singleCode.length>0){
        setSelectedTags(singleCode[0].codeData.tags || [])
        setSelectedCollection(singleCode[0].collectionData || '')
        setSelectedType(singleCode[0].codeData.type || '')
        setRemarks(singleCode[0].codeData.notes || '')
        setAssetUrl(singleCode[0].codeData.url)
        setCode(singleCode[0].codeData.code)
        setLanguage(singleCode[0].codeData.language)
        setBookmarkTitle(singleCode[0].codeData.title)
        setDescription(singleCode[0].codeData.description)
    }
  }, [singleCode]);

  const submitHandler = async() => {
    setError(false)
    if (selectedCollection?.id === undefined) {
      setError(true)
      return;
    }
    let newLink = assetUrl.endsWith('/') ? assetUrl.slice(0, -1): assetUrl
    setLoading(true)
    const payload = {
        notes: remarks,
        url:  newLink,
        collections: selectedCollection?.id,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type:typeof selectedType === "object" ? selectedType?.name : selectedType,
        _id: singleCode[0].codeData._id,
        code:code,
        language: language,
        title: bookmarkTitle,
        description: description
      }
    const res = await dispatch(updateCode(payload.collections,gemSingleId,payload._id,payload))
    
    if(res.error === undefined){
      await dispatch(getAllCodes(newLink))
      setGemSingleId('')
      setLoading(false)
      dispatch(singleCodeReset())
      setShowTab(true)
    }else{
      await dispatch(getAllCodes(newLink))
      setGemSingleId('')
      setLoading(false)
      dispatch(singleCodeReset())
      setShowTab(true)
    }
  }

  const onTagDelete = (i) => {
    selectedTags.splice(i, 1)
    setSelectedTags([ ...selectedTags ])
  }

  const onTagAdd = async (tag) => {
    const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
    if (res.error === undefined && res.payload.error === undefined) {
      setSelectedTags([ ...selectedTags, { id: res.payload?.data?.data?.id, tag: tag.text } ])
    }
  }

  const handleCopy = () => {
    try {
      copyText(code)
      message.success('Code Copied to clipboard');
    } catch (err) {
      message.error('Not have permission')
    }
  }

//   single code ends

    const pageCodes       = useSelector((state) => state.codes.codes);
    const [showModal,setShowModal] = useState(false)

    // const [loading,setLoading] = useState(false)
    const [codeDetail,setCodeDetail] = useState('')
    const [deleteLoading,setDeleteLoading] = useState(false)

    useEffect(() => {
    const getCall = async () => {
        setLoading(true)
        const tabObj        = tabDetails || await fetchCurrentTab()
        if (tabObj) {
            const response = await dispatch(getAllCodes(tabObj.url))
            if(response){
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    }

    getCall()
  },[])

  const navigateToEdit = async (code) => {
    const gemId = pageCodes[0]?.id
    const codeId = code._id
    const collectionId = code.collections

   
    setShowTab(false)
    setLoadingState(true)
    setGemSingleId(gemId)
    const res = await dispatch(getSingleCode(collectionId,gemId,codeId))
    if(res){
      setLoadingState(false)
    }
  }

  const openDeleteModal = (code) => {
    setCodeDetail(code)
    setShowModal(true)
  }

  const hideDeleteModal = () => {
    setShowModal(false)
    setCodeDetail('')
  }

  const handleDeleteCode = async () => {
    const tabs = await getActiveTabURL()
    const url = tabs.url.endsWith('/') ? tabs.url.slice(0, -1) : tabs.url
    const gemId = pageCodes[0]?.id
    const collectionId = codeDetail && codeDetail.collections
    const codeId = codeDetail && codeDetail._id

    setDeleteLoading(true)
    const res = await dispatch(deleteCode(collectionId,gemId,codeId))

    if(res.error === undefined){
      await dispatch(getAllCodes(url))

      setShowModal(false)
      setDeleteLoading(false)
      message.success('Code deleted successfully');
    }else{
      setShowModal(false)
      setDeleteLoading(false)
      message.error('Error Occurred');
    }
  }


  const resetValues = () => {
        setSelectedTags([])
        setSelectedCollection('')
        setSelectedType( '')
        setRemarks('')
        setAssetUrl('')
        setCode('')
        setLanguage('')
        setBookmarkTitle('')
        setDescription('')
  }

  const switchToCodeTab = () => {
    dispatch(singleCodeReset())
    setShowTab(true)
    resetValues()
  }

  const handleClosePanel = async() => {
    const tabs = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_CODE_SNIPPET_PANEL" })
  }

  const prepareTags = () => {
    const tagArr = []
    userTags.forEach((t) => {
      if (t.tag) {
        tagArr.push({
          id: t.tag,
          text: t.tag
        })
      }
    })
    return tagArr
  }

    return(
        <div className='h-full '>
            <div className="p-6">
                <div className='flex justify-between items-center'>
                    <div className='flex justify-start items-center p-0'>
                        <h1
                            className={classNames(showTab ? 'text-black' : 'bg-blue-500 border-blue-500 text-white', 'cursor-pointer px-3 py-2 border-2 border-r-0 rounded-l-lg')}>
                            Info
                        </h1>
                        <h1 onClick={() => switchToCodeTab()}
                            className={classNames(showTab ? 'bg-blue-500 border-blue-500 text-white' : 'text-black', 'cursor-pointer px-3 py-2 border-2 border-l-0 rounded-r-lg')}>
                            Codes 
                        </h1>
                    </div>
                    <div className='h-6 w-6 rounded-sm bg-[#C85C54] cursor-pointer'>
                      <XMarkIcon className="h-6 w-6 text-white p-1" 
                        onClick={handleClosePanel}
                        />
                    </div>
             </div>
            {showTab ?
                <>
                    {/* all */}
                    <div className="mt-6">
                     <div className='bookmark-bg h-full'>

                        {
        loading ?  
        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
            <Spin size='middle' tip='Loading...'/>
        </div>
         : 

        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px]' style={{height:'450px',overflow:'auto'}}>
        {
            (pageCodes && pageCodes[0]?.media && pageCodes[0]?.media.length>0) ? pageCodes[0].media.map((code,i) => {
              return(
                 <>
              <div className="mx-auto w-full" key={i}>
                <div className='group ct-relative'>

                  <div className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">

                    <div className='flex justify-start items-center gap-1'>
                        <div className='highlightItem'>
                          <div>
                              {code.title}
                          </div>
                      </div>
                    </div>

                  </div>

                  <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100' style={{top:'-10px'}}>
                      <button className='edit-btn' 
                      onClick={() => navigateToEdit(code)}
                      >
                        <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                      </button>
                      <button 
                      onClick={() => openDeleteModal(code)}
                      >
                        <TrashIcon className='w-5 h-5 text-gray-400' />
                      </button>
                  </div>

                </div>
              </div>
            </>
              )
            }) : <>
                <p>
                    No code snippet saved.
                </p>
            </>
        }

        <div className={showModal === true ? "pop-box p-fixed" : ""}>
          <div className={showModal === true ? "popup-delete-model" : ""}>
            {
              showModal && <div className='popup-delete'>
                <h1 className='content-h'>Confirm delete?</h1>
                  <div className='btnn-pop'>
                    <button className='yes-btn' onClick={() => handleDeleteCode()} disabled={deleteLoading}>{deleteLoading ? 'Deleting..' : 'Yes'}</button>
                    <button className='no-btn' onClick={() => hideDeleteModal()} disabled={deleteLoading}>No</button>
                    </div>
                  </div>
                  }
          </div>
        </div>
      </div>
      }
                        </div>   
                   </div>
                </>
                    :
                    // single
                    <div className="mt-6">
                        <div className='bookmark-bg h-full' 
                            onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}
                            >
                            {
                loadingState ? <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
                    <Spin size='middle' tip='Loading...'/>
                </div>
                :
            
            <>
                <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5' style={{height:'600px',overflow:'auto'}}>
                            <div className='grid grid-cols-8 gap-2'>
                                <div className='col-span-7' >
                                <Input size="medium w-full mb-2" type="text" name="link" placeholder="Asset url" 
                                loader={loader} 
                                chooseMessage={loader}
                                value={assetUrl} 
                                onChange={(e)=>setAssetUrl(e.target.value)}
                                />
                                <Input size="medium w-full mb-2" type="text" name="bookmark_name" placeholder="Bookmark title"
                                    value={bookmarkTitle || ""}  
                                    loader={loader} 
                                    chooseMessage={loader}
                                    onFocus={()=>setLoader(false)} 
                                    onChange={(e) => setBookmarkTitle(e.target.value)}
                                />
                                <Input size="medium w-full" type="text" name="description" placeholder="Enter description" 
                                value={description} loader={loader} onChange={(e) => setDescription(e.target.value)}
                                chooseMessage={loader}
                                />
                                <div className='pt-6 flex justify-between space-x-2'>
                                    {/* Collections */}
                                    <div 
                                    className={classNames("flex-1", showTypeInput && "hidden")}
                                    >
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Collections</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                        <div 
                                        onClick={() => setShowCollectionInput(true)} 
                                        className="w-full">
                                        <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} 
                                        setSelectedCollection = {setSelectedCollection} 
                                        selectedCollection={selectedCollection} 
                                        error={error}/> 
                                        </div>
                                    </div>
                                    </div>
                                    {/* Types */}
                                    <div 
                                    className={classNames("flex-1", showCollectionInput && 'hidden')}
                                    >
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Type</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                        <div  
                                        className="w-full">
                                            <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType} type={'Code'} disabled={true}/> 
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Input size="medium w-full mb-2" type="text" name="language" placeholder="Enter Language" 
                                        value={language} 
                                        onChange={(e)=>setLanguage(e.target.value)}
                                    />
                                </div>

                                <div className="pt-4">
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Code Snippet</h6>
                                    <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] p-relative'>
                                        <svg 
                                        className='highlight-copy-svg'
                                        onClick={handleCopy}
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/></svg>
                                        <pre className="pre-tag-style" style={{height:'250px'}}>
                                        <code className="code-tag-style" style={{height:'250px'}}>
                                            {code}
                                        </code>
                                        </pre>
                                    </div>
                                </div>

                                <div className='pt-4'>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Tags</h6>
                                    <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                                    <ReactTags 
                                        tags={selectedTags.map((t) => { return { id: t.tag, text: t.tag }  })}
                                        suggestions={prepareTags()}
                                        delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                                        handleDelete={onTagDelete}
                                        handleAddition={onTagAdd}
                                        inputFieldPosition="bottom"
                                        placeholder=""
                                        autocomplete
                                    />
                                    <div className="clear-tag" onClick={()=>setSelectedTags([])}>ClearAll</div>
                                    </div>
                                </div>
                                <div className='pt-4'>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Comment</h6>
                                    <Input size="medium w-full mb-2 h-20" type="text" name="descriptions" placeholder="Add your comments" value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>
                            
                                </div>
                            </div>
                        </div>

            <div className='bg-white px-4 py-2 border-t-2'>
                <BookmarkFooter page="codeSnippetPanel" 
                submitHandler = {submitHandler} 
                loading={loading}/>
            </div>
            </>
            }
                            </div>
                    </div>
            }
            </div>
        </div>
    )
}

export default CodeSnippetPanelDetails;