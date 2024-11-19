/*global chrome*/
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { CheckIcon } from '@heroicons/react/24/outline';
import ComboBox from '../components/combobox/ComboBox';
import TypeComboBox from '../components/combobox/TypeComboBox';
import Input from '../components/input/Input';
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter';
import { fetchUrlData } from '../actions/domain'
import { addHighlight, deleteHighlight, getAllHighlights, getSingleHighlight, singleHighlightReset, updateHighlight } from '../actions/highlights';
import Loadingscreen from '../components/Loadingscreen/Loadingscreen'
import session from "../utils/session";
import { WithContext as ReactTags } from 'react-tag-input';
import { KEY_CODES } from '../utils/constants';
import { addTag } from '../actions/tags';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useSearchParams } from 'react-router-dom';

import { message, Spin } from 'antd';
import {  PencilSquareIcon, TrashIcon,XMarkIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom';
import { getActiveTabURL } from '../utils/send-theme-to-chrome';
import { copyText } from "../utils/message-operations";
import { fetchCurrentTab } from "../utils/fetch-current-tab";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const hightlightColors = [
  {
    id:1,
    border: "border-l-violet-500",
    bg: "#C1C1FF",
    text: "text-violet-500",
    colorCode: '#C1C1FF',
    className: "violet-hl"
  },
  {
    id:2,
    border: "border-l-pink-500",
    bg: "#FFAFED",
    text: "text-pink-500",
    colorCode: '#FFAFED',
    className: "pink-hl"
  },
  {
    id:3,
    border: "border-l-green-300",
    bg: "#D2F9C8",
    text: "text-green-300",
    colorCode: '#D2F9C8',
    className: "green-hl"
  },
  {
    id:4,
    border: "border-l-yellow-200",
    bg: "#FFFAB3",
    text: "text-yellow-200",
    colorCode: '#FFFAB3',
    className: "yellow-hl"
  }
]

const HighlightPanel = () => {
    const [showTab,setShowTab] = useState(false)

    //single code starts
    const navigate = useNavigate()
    const dispatch = useDispatch(); 
  const [searchParams] = useSearchParams()

  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [selectedHighlight, setselectedHighlight] = useState(hightlightColors[0]);
  const [error, setError] = useState(false)
 
  //states
  const [assetUrl, setAssetUrl] = useState('');
  const [selectedCollection, setSelectedCollection] = useState({id:Number(session.unfiltered_collection_id),name:"Unfiltered"});
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false)
  const [highlightText,setHighlightText] = useState('')
  const collections       = useSelector((state) => state.collection.collectionData);
  const singleHighlight       = useSelector((state) => state.highlights.singleHighlight);
  const userTags          = useSelector((state) => state.user.userTags)
  const tabDetails = useSelector((state) => state.app.tab)
  const [loadingState, setLoadingState] = useState(false)  
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [gemSingleId, setGemSingleId] = useState('')

  const [highlightDetails, setHighlightDetails]=useState(null)
  const [styleClassName, setStyleClassName] = useState("")

  useEffect(() => {
    const getCall = async () => {
        setLoadingState(true)
        const res = await dispatch(getSingleHighlight(searchParams.get('collectionId'),searchParams.get('gemId'),searchParams.get('highlightId')))
        if(res){
            setLoadingState(false)
        }
    }

    if (searchParams.get('collectionId') && searchParams.get('gemId') && searchParams.get('highlightId')) {
      getCall()
    }
    else {
      setShowTab(true)
    }
  },[])

  useEffect(() => {
    if(singleHighlight && singleHighlight.length>0){
        setSelectedTags(singleHighlight[0].highlightedText.tags || [])
        setSelectedCollection(singleHighlight[0].collectionData || '')
        setSelectedType(singleHighlight[0].highlightedText.type || '')
        setRemarks(singleHighlight[0].highlightedText.note || '')
        setAssetUrl(singleHighlight[0].highlightedText.link)
        setselectedHighlight(singleHighlight[0].highlightedText.color)
        setHighlightText(singleHighlight[0].highlightedText.text)
        setHighlightDetails(singleHighlight[0]?.highlightedText?.details)
        setStyleClassName(singleHighlight[0]?.highlightedText?.styleClassName)
        setGemSingleId((searchParams && searchParams?.get('gemId')) || '')
    }
  }, [singleHighlight]);

  const resetValues = () => {
        setSelectedTags([])
        setSelectedCollection('')
        setSelectedType('')
        setRemarks('')
        setAssetUrl('')
        setselectedHighlight('')
        setHighlightText('')
  }

  const submitHandler = async() => {
    setError(false)
    if (selectedCollection?.id === undefined) {
      setError(true)
      return;
    }
    let newLink = assetUrl.endsWith('/') ? assetUrl.slice(0, -1): assetUrl
    setLoadingBtn(true)
    const payload = {
        note: remarks,
        color: selectedHighlight,
        text: highlightText,
        link:  newLink,
        collections: selectedCollection?.id,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type:typeof selectedType === "object" ? selectedType?.name : selectedType,
        box: singleHighlight[0].highlightedText.box,
        _id: highlightDetails.id || singleHighlight[0].highlightedText._id,
        details: highlightDetails,
        styleClassName: styleClassName,
      }
    //   collectionId,gemId,highlightId,data
    const res = await dispatch(updateHighlight(payload.collections,gemSingleId,payload._id,payload))
    
    if(res.error === undefined){
      const response = await dispatch(getAllHighlights(newLink))
      if(response.error === undefined && response.payload && response.payload.data && response.payload.data.length>0){
        const highlighData = response.payload.data
        const tabs = await getActiveTabURL()
        window.chrome.tabs.sendMessage(tabs.id, { value: highlighData, type: "CT_HIGHLIGHT_DATA" })
        setShowTab(true)
        setLoadingBtn(false)
        setGemSingleId('')
        dispatch(singleHighlightReset())
        resetValues()
      }

      
      chrome.storage.sync.set({
        'siteData': {urlFromSite: '',tabIdFromSite: ''},
        'highlightedData': {text: '', box: {}, details: null, styleClassName: "" }
      })
      
    }else{
      chrome.storage.sync.set({
        'siteData': {urlFromSite: '',tabIdFromSite: ''},
        'highlightedData': {text: '', box: {}, details: null, styleClassName: "" }
      })
      setLoadingBtn(false)
      setShowTab(true)
      setGemSingleId('')
      dispatch(singleHighlightReset())
      resetValues()
    }
  }

  const onTagDelete = (i) => {
    selectedTags.splice(i, 1)
    setSelectedTags([ ...selectedTags ])
  }

  const onTagAdd = async (tag) => {
    const existingIdx = userTags?.findIndex((t) => { return t.tag === tag.text })
    if (existingIdx !== -1) {
      setSelectedTags([ ...selectedTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }])
    }
    else {
      const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
      if (res.error === undefined && res.payload.error === undefined) {
        setSelectedTags([ ...selectedTags, { id: res.payload?.data?.data?.id, tag: tag.text } ])
      }
      return res;
    }
  }

//   single code ends


//all codes starts
  const pageHighlights       = useSelector((state) => state.highlights.highlights);
  const [showModal,setShowModal] = useState(false)

  const [highlightDetail,setHighlightDetail] = useState('')
  const [deleteLoading,setDeleteLoading] = useState(false)

  useEffect(() => {
    const getCall = async () => {
        setLoading(true)
        const tabObj        = tabDetails || await fetchCurrentTab()
        if (tabObj) {
            const response = await dispatch(getAllHighlights(tabObj.url))            
            if(response){
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    }

    getCall()
  },[])

  const navigateToEdit = async(highlight) => {
    const highlightId= highlight._id
    const gemId = pageHighlights[0].id
    const collectionId = highlight.collections

   
    setShowTab(false)
    setLoadingState(true)
    setGemSingleId(gemId)
    const res = await dispatch(getSingleHighlight(collectionId,gemId,highlightId))
    if(res){
        setLoadingState(false)
    }
  }

  const openDeleteModal = (highlight) => {
    setHighlightDetail(highlight)
    setShowModal(true)
  }

  const hideDeleteModal = () => {
    setShowModal(false)
    setHighlightDetail('')
  }

  const handleDeleteHighlight = async () => {
    const tabs = await getActiveTabURL()
    const gemId = pageHighlights[0].id 
    const collectionId = highlightDetail && highlightDetail.collections
    const details_id = highlightDetail && highlightDetail.details.id
    const highlightId = highlightDetail && highlightDetail._id

    setDeleteLoading(true)
    const res = await dispatch(deleteHighlight(collectionId,gemId,highlightId))

    if(res.error === undefined){
      const response = await dispatch(getAllHighlights(tabs.url))
      if(response.error === undefined ){
        const highlightData = response.payload.data
        window.chrome.tabs.sendMessage(tabs.id, { value: {
          details_id,
          highlightData
        }, type: "CT_HIGHLIGHT_DATA_DELETE" })
      }

      setShowModal(false)
      setDeleteLoading(false)
      message.success('Highlight deleted successfully');
    }else{
      setShowModal(false)
      setDeleteLoading(false)
      message.error('Error Occurred');
    }
  }


  const handleClosePanel = async() => {
    const tabs = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_HIGHLIGHT_PANEL" })
  }

  const switchToHighlightTab = async (isHighlights) => {
    dispatch(singleHighlightReset())
    if (isHighlights) {
      setLoading(true)
      const tab = await getActiveTabURL()
      await dispatch(getAllHighlights(tab.url))
      setLoading(false)
    }
    setShowTab(true)
    resetValues()
  }

  const handleCopy = () => {
    try {
      copyText(highlightText);
      message.success('Highlight Copied to clipboard');
    } catch (err) {
      message.error('Not have permission')
    }
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
                        <h1 className={classNames(showTab ? 'text-black' : 'bg-blue-500 border-blue-500 text-white', 'cursor-pointer px-3 py-2 border-2 border-r-0 rounded-l-lg')}
                            disabled>
                            Info
                        </h1>
                        <h1 onClick={() => switchToHighlightTab(true)}
                            className={classNames(showTab ? 'bg-blue-500 border-blue-500 text-white' : 'text-black', 'cursor-pointer px-3 py-2 border-2 border-l-0 rounded-r-lg')}>
                            Higlights 
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

                            <div className='bg-[#F8FBFF] p-4 rounded-t-[16px]'>
                            {
                                (pageHighlights && pageHighlights[0]?.media && pageHighlights[0]?.media?.length>0) ? pageHighlights[0].media.map((highlight,i) => {
                                return(
                                    <>
                                <div className="mx-auto w-full" key={i}>
                                    <div className='group ct-relative'>

                                    <div className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">

                                        <div className='flex justify-start items-center gap-1'>
                                            <div className='highlightItem'>
                                            <div className='highlight-text-div' style={{"--highlight-text-color": `${highlight?.color?.colorCode || highlight?.color}`}}>
                                                {highlight?.text}
                                            </div>
                                        </div>
                                        </div>

                                    </div>

                                    <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100' style={{top:'-10px'}}>
                                        <button className='edit-btn' 
                                        onClick={() => navigateToEdit(highlight)}
                                        >
                                            <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                                        </button>
                                        <button 
                                        onClick={() => openDeleteModal(highlight)}
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
                                        Select text on a web-page and right click Save highlight from context menu.
                                    </p>
                                </>
                            }

                            <div className={showModal === true ? "pop-box p-fixed" : ""}>
                            <div className={showModal === true ? "popup-delete-model" : ""}>
                                {
                                showModal && <div className='popup-delete'>
                                    <h1 className='content-h'>Confirm delete?</h1>
                                    <div className='btnn-pop'>
                                        <button className='yes-btn' onClick={() => handleDeleteHighlight()} disabled={deleteLoading}>{deleteLoading ? 'Deleting..' : 'Yes'}</button>
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
                                <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] ct-relative'>
                                <div className='bg-white rounded-md p-2 border-2'>
                                <div>
                                  <svg 
                                  className='highlight-copy-svg'
                                  onClick={handleCopy}
                                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/></svg>
                                    <div 
                                    style={{height:'auto'}}
                                    className={classNames(selectedHighlight.border ,'flex-1 text-xs text-gray-500 border-l-4 pl-2 py-0 outline-none w-full')} 
                                    >
                                      {highlightText}
                                    </div>
                                </div>
                                    <div className='flex justify-end items-baseline space-x-3'>
                                    <div className='flex justify-end space-x-2 items-center'>
                                        {hightlightColors?.map(color => (
                                        <button 
                                            key={color.id} 
                                            style={{backgroundColor: `${color.bg}`}}
                                            className={classNames('flex justify-center items-center h-4 w-4 rounded-full border-[1px] border-gray-400')}
                                            onClick={() => { 
                                              setselectedHighlight(color)  
                                              setStyleClassName(color.className)
                                            }}
                                        >
                                            <CheckIcon 
                                            className={classNames(color.id === selectedHighlight?.id ? "" : color.text,'h-2 w-2')} 
                                            />
                                        </button>
                                        ))}
                                    </div>
                                    </div>
                                </div>
                                <div className='pt-6 flex justify-between space-x-2'>
                                {/* Collections */}
                                <div className="flex-1">
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Collections</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                    <div onClick={() => setShowCollectionInput(true)} className="w-full">
                                        <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} setSelectedCollection = {setSelectedCollection} selectedCollection={selectedCollection} error={error}/>
                                    </div>
                                    </div>
                                </div>
                                {/* Types */}
                                <div className={classNames("flex-1", showCollectionInput && 'hidden')}>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Type</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                    <div 
                                    className="w-full">
                                        <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType} type={'Highlight'} disabled={true}/>
                                    </div>
                                    </div>
                                </div>
                                </div>
                                {/* TAGS */}
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
                                        placeholder="Enter Tag"
                                        onClearAll={() => setSelectedTags([])}
                                        clearAll
                                        autocomplete
                                    />
                                </div>
                                </div>
                                {/* URL */}
                                <div className='pt-4'>
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">URL</h6>
                                <Input size="medium w-full mb-2" type="text" name="url" placeholder="Enter url" 
                                //   chooseMessage={fetchUrlDetailsHandler} 
                                value={assetUrl} 
                                //   onChange={(e)=>setAssetUrl(e.target.value)}
                                />
                                </div>
                                {/* REMARKS */}
                                <div className='mt-4'>
                                <h6 className='text-xs text-gray-500 mb-1'>Comment</h6>
                                <textarea  placeholder='Add your comments' className='w-full text-sm p-2 border-2 rounded-md h-14 outline-none resize-none' onChange={(e) => setRemarks(e.target.value)} value={remarks}></textarea>
                                </div>
                                {/* ADD PHOTOS */}
                            </div>
                            <div className='bg-white px-4 py-2 border-t-2'>
                                <BookmarkFooter page="highlightPanel"
                                submitHandler = {submitHandler} 
                                loading={loadingBtn}/>
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

export default HighlightPanel;