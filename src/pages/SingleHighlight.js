/*global chrome*/
import React, { useEffect, useState } from 'react'
import Header from '../components/header/Header';
import { CheckIcon } from '@heroicons/react/24/outline';
import ComboBox from '../components/combobox/ComboBox';
import TypeComboBox from '../components/combobox/TypeComboBox';
import Input from '../components/input/Input';
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import {  getAllHighlights, getSingleHighlight, updateHighlight } from '../actions/highlights';
import session from "../utils/session";
import { WithContext as ReactTags } from 'react-tag-input';
import { KEY_CODES } from '../utils/constants';
import { addTag } from '../actions/tags';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin,message } from 'antd';
import { getActiveTabURL } from '../utils/send-theme-to-chrome';
import { copyText } from '../utils/message-operations';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const footerMenuList = [
  {
    id: 1,
    name: "Language",
    link: "#",
    icon: "message-chat-square.svg",
    alt: "message icon"
  },
  {
    id: 2,
    name: "Youtube clip",
    link: "#",
    icon: "youtube-icon.svg",
    alt: "youtube icon"
  },
  {
    id: 3,
    name: "Setting",
    link: "#",
    icon: "settings-icon.svg",
    alt:"setting icon"
  }
]

const addNewHighlight = [
  {
    id: 1,
    name: "Note",
    link: "#",
  },
  {
    id: 2,
    name: "CSV",
    link: "#",
  },
  {
    id: 3,
    name: "Image",
    link: "#",
  }
]

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

const SingleHighlight = () => {
  const dispatch = useDispatch(); 
  const navigate= useNavigate()
  const { collectionId, gemId, highlightId } = useParams()

  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [selectedHighlight, setselectedHighlight] = useState(hightlightColors[0]);
  const [error, setError] = useState(false)
  const [highlightDetails, setHighlightDetails]=useState(null)
  const [styleClassName, setStyleClassName] = useState("")
 
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
  const [loadingState, setLoadingState] = useState(false)  

  useEffect(() => {
    const getCall = async () => {
        setLoadingState(true)
        const res = await dispatch(getSingleHighlight(collectionId,gemId,highlightId))
  
        if(res){
            setLoadingState(false)
        }
    }

    getCall()
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
        setHighlightDetails(singleHighlight[0].highlightedText.details)
        setStyleClassName(singleHighlight[0].highlightedText.styleClassName)
    }
  }, [singleHighlight]);


  const submitHandler = async() => {
    setError(false)
    if (selectedCollection?.id === undefined) {
      setError(true)
      return;
    }
    let newLink = assetUrl.endsWith('/') ? assetUrl.slice(0, -1): assetUrl
    setLoading(true)
    // let newDetails = { ...highlightDetails }
    // if (highlightText.length !== newDetails.text.length) {
    //   newDetails = { ...newDetails, text: highlightText, endMeta: { ...}}
    // }
    const payload = {
        note: remarks,
        color: selectedHighlight,
        text: highlightText,
        link:  newLink,
        collections: selectedCollection?.id,
        details: highlightDetails,
        styleClassName: styleClassName,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type:typeof selectedType === "object" ? selectedType?.name : selectedType,
        box: singleHighlight[0].highlightedText.box,
        _id: highlightDetails?.id || singleHighlight[0].highlightedText._id
      }
    const res = await dispatch(updateHighlight(collectionId,gemId,highlightId,payload))
    
    if(res.error === undefined){
      const response = await dispatch(getAllHighlights(newLink))
      if(response.error === undefined && response.payload && response.payload.data && response.payload.data.length>0){
        const highlighData = response.payload.data
        const tabs = await getActiveTabURL()
        window.chrome.tabs.sendMessage(tabs.id, { value: highlighData, type: "CT_HIGHLIGHT_DATA" })
      }
      setLoading(false)
      navigate('/all-highlights')
      
      chrome.storage.sync.set({
        'siteData': {urlFromSite: '',tabIdFromSite: ''},
        'highlightedData': {text: '', box: {}, details: null, styleClassName: "" }
      })
    }else{
      chrome.storage.sync.set({
        'siteData': {urlFromSite: '',tabIdFromSite: ''},
        'highlightedData': {text: '', box: {}, details: null, styleClassName: "" }
      })
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
    copyText(highlightText)
    message.success('Highlight Copied to clipboard');
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

  return (
    <div className='h-full' 
    onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}
    >
      <Header label="Edit Highlights" page="HIGHLIGHT" 
      addNewHighlight={addNewHighlight ||[]} 
      />
      {
        loadingState ? <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
            <Spin size='middle' tip='Loading...'/>
        </div>
        :
      
      <>
      <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5 mb-10 ct-relative'>
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
                {hightlightColors.map(color => (
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
                <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} 
                setSelectedCollection = {setSelectedCollection} 
                selectedCollection={selectedCollection} 
                error={error}/>
              </div>
            </div>
          </div>
          {/* Types */}
          <div className={classNames("flex-1", showCollectionInput && 'hidden')}>
            <h6 className="block text-xs font-medium text-gray-500 mb-1">Type</h6>
            <div className='ct-relative' onClick={e => e.stopPropagation()}>
              <div className="w-full">
                <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType} type={'Highlight'}/>
              </div>
            </div>
          </div>
        </div>
        {/* TAGS */}
        <div className='pt-4'>
          <h6 className="block text-xs font-medium text-gray-500 mb-1">Tags</h6>
          <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
            <ReactTags 
                tags={selectedTags?.map((t) => { return { id: t.tag, text: t.tag }  })}
                suggestions={prepareTags()}
                delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                handleDelete={onTagDelete}
                handleAddition={onTagAdd}
                inputFieldPosition="bottom"
                placeholder=""
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

      <div className='bg-white px-4 border-t-2 mb-9 fixed bottom-0 w-full highlight-footer'>
        <BookmarkFooter page="highlight" footerMenuList={footerMenuList} 
        submitHandler = {submitHandler} 
        loading={loading}/>
      </div>
      </>
    }
    </div>
  )
}

export default SingleHighlight