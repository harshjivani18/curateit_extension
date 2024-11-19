/*global chrome*/
import React, { useEffect, useState } from 'react'
import Header from '../components/header/Header';
import { CheckIcon } from '@heroicons/react/24/outline';
import ComboBox from '../components/combobox/ComboBox';
import TypeComboBox from '../components/combobox/TypeComboBox';
import Input from '../components/input/Input';
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter';
import { useDispatch } from 'react-redux';
import { fetchUrlData } from '../actions/domain'
import { useSelector } from 'react-redux';
import { addHighlight, getAllHighlights, updateHighlight, updateHighlightToGem } from '../actions/highlights';
import Loadingscreen from '../components/Loadingscreen/Loadingscreen'
import session from "../utils/session";
import { equalsCheck } from "../utils/equalChecks";
import { WithContext as ReactTags } from 'react-tag-input';
import { KEY_CODES } from '../utils/constants';
import { addTag } from '../actions/tags';
import { v4 as uuidv4 } from 'uuid';
import { getActiveTabURL } from '../utils/send-theme-to-chrome';
import { getAllCollections } from '../actions/collection';

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

const Highlights = () => {
  const dispatch = useDispatch();
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
  const [highlightTextFromSite,setHighlightTextFromSite] = useState('')
  const [highlightText,setHighlightText] = useState('')
  const [urlFromSite,setUrlFromSite] = useState('')
  const [tabIdFromSite,setTabIdFromSite] = useState('')
  const [boxDetails,setBoxDetails] = useState(null)
  const [styleClassName, setStyleClassName] = useState("")
  const [highlightDetails, setHighlightDetails] = useState(null)
  const userTags          = useSelector((state) => state.user.userTags)
  const collections       = useSelector((state) => state.collection.collectionData);
  const [currentUrlGemId,setCurrentUrlGemId] = useState('')

  useEffect(() => {
    setSelectedTags([])
    setSelectedCollection('')
    setSelectedType("Highlight")
    setRemarks('')
    setLoading(false)
    setHighlightTextFromSite('')
    setBoxDetails('')
    setUrlFromSite('')
    setTabIdFromSite('')
    setHighlightDetails(null)
    setStyleClassName("")

    chrome?.storage?.sync.get(['siteData','highlightedData'],async function(text){
        setHighlightTextFromSite(text.highlightedData?.text || '')
        setBoxDetails(text.highlightedData?.box)
        setUrlFromSite(text.siteData?.urlFromSite || '')
        setTabIdFromSite(text.siteData?.tabIdFromSite || '')
        setHighlightDetails(text.highlightedData?.details || null)
        setStyleClassName(text.highlightedData?.styleClassName || "")

        let newLink = text.siteData.urlFromSite.endsWith('/') ? text.siteData.urlFromSite.slice(0, -1) : text.siteData.urlFromSite;

        const response = await dispatch(getAllHighlights(newLink))
        if(response?.payload?.data?.length>0){
          setCurrentUrlGemId(response.payload.data[0].id)
        }else{
          setCurrentUrlGemId('')
        }

      await dispatch(getAllCollections())
        if (newLink !== "") {
          const urlDataRes = await dispatch(fetchUrlData(newLink))
          if (urlDataRes.error === undefined && urlDataRes.payload?.error === undefined && urlDataRes.payload.data) {
            const urlData = urlDataRes.payload?.data
            if (urlData && urlData.TagsData && !session.currentSiteTags) {
              await updateURLTags(urlData)
            }
            else if (urlData && urlData.TagsData && session.currentSiteTags) {
              const obj = JSON.parse(session.currentSiteTags)
              const arr = obj.map((o) => { return o.tag })
              if (equalsCheck(urlData.TagsData, arr)) {
                setSelectedTags([ ...obj ])
              }
              else {
                await updateURLTags(urlData)
              }
            }
          }
        }
    });
    
    chrome?.tabs?.query({active:true,currentWindow: true}, async function(tab){
      setAssetUrl(tab[0]?.url)
    });

  }, []);

  const addAllTags = (tag) => {
    return new Promise((resolve, reject) => {
      dispatch(addTag({ data: { tag: tag.text, users: session.userId }})).then((res) => {
        resolve(res)
      })
    })
  }

  const updateURLTags = (urlData) => {
    return new Promise((resolve, reject) => {
      const selectedTagPromises = []
      const selectedTagObjs     = []
      for(let i=0 ; i < 5;i++){
        const tag ={
          text:urlData?.TagsData[i]
        }

        selectedTagPromises.push(addAllTags(tag))
      }
      if (selectedTagPromises.length !== 0) {
        Promise.all(selectedTagPromises).then((promiseRes) => {
          if (promiseRes) {
            promiseRes.forEach((res) => {
              if (res && res.payload && res.payload.data && res.payload.data.data) {
                const { data } = res.payload.data
                const tagObj = {
                  id: data.id,
                  tag: data.attributes?.tag 
                }
                selectedTagObjs.push(tagObj)
              }
            })
          }
          setSelectedTags([ ...selectedTagObjs ]) 
          session.setCurrentSiteTags(JSON.stringify([ ...selectedTagObjs ]))
          resolve("Updated!")
        })
      }
      else {
        resolve("Updated!")
      }
    })
  }

  const fetchUrlDetailsHandler = () => {
    if(assetUrl.charAt(assetUrl.length-1) === '/'){
      dispatch(fetchUrlData(assetUrl))
    }else{
    dispatch(fetchUrlData(`${assetUrl}/`))
    }
  }

  const submitHandler = async() => {
    setError(false)
    if (selectedCollection.id === undefined) {
      setError(true)
      return;
    }
    let newLink = urlFromSite ? urlFromSite.endsWith('/') ? urlFromSite.slice(0, -1) : urlFromSite : assetUrl.endsWith('/') ?  assetUrl.slice(0,-1) : assetUrl;
    setLoading(true)
    
    const payload = {
        note: remarks,
        color: selectedHighlight,
        text: highlightTextFromSite,
        link: newLink,
        collections: selectedCollection.id,
        details: highlightDetails,
        styleClassName: selectedHighlight && selectedHighlight.className ? selectedHighlight.className : "yellow-hl",
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type:typeof selectedType === "object" ? selectedType?.name : selectedType,
        box: boxDetails,
        _id: highlightDetails?.id || uuidv4()
      }

    if(currentUrlGemId){
      const res1 = await dispatch(updateHighlightToGem(selectedCollection.id,currentUrlGemId,payload))

        if(res1.error === undefined){
        const response = await dispatch(getAllHighlights(urlFromSite))
        if(response.error === undefined){
          const highlighData = response.payload.data || []
          window.chrome.tabs.sendMessage(tabIdFromSite, { value: highlighData, type: "CT_HIGHLIGHT_DATA" })
        }
        
        chrome.storage.sync.set({
          'siteData': {urlFromSite: '',tabIdFromSite: ''},
          'highlightedData': {text: '', box: {}, details: null, styleClassName: "" },
        })
        setHighlightTextFromSite('')
        setBoxDetails('')
        setUrlFromSite('')
        setTabIdFromSite('')
        setHighlightDetails(null)
        setStyleClassName("")
        setCurrentUrlGemId('')
        window.close()
      }else{
        chrome.storage.sync.set({
          'siteData': {urlFromSite: '',tabIdFromSite: ''},
          'highlightedData': {text: '', box: {}, details: null, styleClassName: "" },
        })
        setHighlightTextFromSite('')
        setBoxDetails('')
        setUrlFromSite('')
        setTabIdFromSite('')
        setHighlightDetails(null)
        setStyleClassName("")
        setCurrentUrlGemId('')
        window.close()
      }

    }else{
      let parent_type = "";
      if (payload.link.includes("youtube.com")) {
      parent_type = "Video";
      }
      const res = await dispatch(addHighlight(selectedCollection.id,payload, parent_type))

      if(res.error === undefined){
        const response = await dispatch(getAllHighlights(urlFromSite))
        if(response.error === undefined){
          const highlighData = response.payload.data || []
          window.chrome.tabs.sendMessage(tabIdFromSite, { value: highlighData, type: "CT_HIGHLIGHT_DATA" })
        }
        
        chrome.storage.sync.set({
          'siteData': {urlFromSite: '',tabIdFromSite: ''},
          'highlightedData': {text: '', box: {}, details: null, styleClassName: "" },
        })
        setHighlightTextFromSite('')
        setBoxDetails('')
        setUrlFromSite('')
        setTabIdFromSite('')
        setHighlightDetails(null)
        setStyleClassName("")
        setCurrentUrlGemId('')
        window.close()
      }else{
        chrome.storage.sync.set({
          'siteData': {urlFromSite: '',tabIdFromSite: ''},
          'highlightedData': {text: '', box: {}, details: null, styleClassName: "" },
        })
        setHighlightTextFromSite('')
        setBoxDetails('')
        setUrlFromSite('')
        setTabIdFromSite('')
        setHighlightDetails(null)
        setStyleClassName("")
        setCurrentUrlGemId('')
        window.close()
      }
    } 
  }

  //   chrome.tabs.sendMessage(tab[0].id, {
  //       'type': 'UPDATE',
  //       value: fkData
  //   })
  //   }
  // },[windowClosed])



  const handleReader = () => {
    // 
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

  const clearStorage = () => {
    chrome.storage.sync.set({
      'siteData': {urlFromSite: '',tabIdFromSite: ''},
      'highlightedData': {text: '', box: {} }
    })
    return null
  }

  useEffect(() => {
    window.addEventListener('beforeunload', clearStorage)
    return () => {
      window.removeEventListener('beforeunload', clearStorage)
    }
  }, [])

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

  

  if(!collections) {
    return <Loadingscreen showSpin={!collections} />
  }
  return (
    <div className='bookmark-bg h-full' onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}>
      <Header label="Highlights" page="HIGHLIGHT" addNewHighlight={addNewHighlight} />
      <div className='bg-[#F8FBFF] p-4 rounded-t-[16px]' style={{height:'450px',overflow:'auto'}}>
        <div className='bg-white rounded-md p-2 border-2'>
            <div 
            style={{height:'auto'}}
            className={classNames(selectedHighlight.border ,'flex-1 text-xs text-gray-500 border-l-4 pl-2 py-0 outline-none w-full')} 
            >
              {highlightTextFromSite ? highlightTextFromSite : highlightText}
            </div>
            <div className='flex justify-end items-baseline space-x-3'>
              <div className='flex justify-end space-x-2 items-center'>
                {hightlightColors.map(color => (
                  <button 
                    key={color.id} 
                    style={{backgroundColor: `${color.bg}`}}
                    className={classNames('flex justify-center items-center h-4 w-4 rounded-full border-[1px] border-gray-400')}
                    onClick={() => setselectedHighlight(color)}
                  >
                    <CheckIcon className={classNames(color.id === selectedHighlight.id ? "" : color.text,'h-2 w-2')} />
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
            {/* <Tags setSelectedTags = {setSelectedTags} tagsList={collections?.tags} userId = {collections?.id}/> */}
            <ReactTags 
                tags={selectedTags.map((t) => { return { id: t.tag, text: t.tag }  })}
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
          <Input size="medium w-full mb-2" type="text" name="url" placeholder="Enter url" chooseMessage={fetchUrlDetailsHandler} value={urlFromSite ? urlFromSite : assetUrl} onChange={(e)=>setAssetUrl(e.target.value)}/>
        </div>
        {/* REMARKS */}
        <div className='mt-4'>
        <h6 className='text-xs text-gray-500 mb-1'>Comment</h6>
        <textarea  placeholder='Add your comments' className='w-full text-sm p-2 border-2 rounded-md h-14 outline-none resize-none' onChange={(e) => setRemarks(e.target.value)}></textarea>
        </div>
        {/* ADD PHOTOS */}
      </div>
      <div className='bg-white px-4 py-2 border-t-2'>
        <BookmarkFooter page="highlight" footerMenuList={footerMenuList} submitHandler = {submitHandler} loading={loading} handleReader={handleReader}/>
      </div>
    </div>
  )
}

export default Highlights