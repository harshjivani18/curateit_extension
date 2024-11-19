/*global chrome*/
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getActiveTabURL } from "../utils/send-theme-to-chrome";
import { useSelector,useDispatch } from "react-redux";
import BookmarkFooter from "../components/bookmarkFooter/BookmarkFooter";
import ComboBox from "../components/combobox/ComboBox";
import TypeComboBox from "../components/combobox/TypeComboBox";
import Input from "../components/input/Input";
import { WithContext as ReactTags } from 'react-tag-input';
import { addTag } from "../actions/tags";
import session from "../utils/session";
import { KEY_CODES } from "../utils/constants";
import { fetchUrlData } from "../actions/domain";
import { addImage } from "../actions/image";
import { v4 as uuidv4 } from 'uuid';
import { message } from "antd";
import { getAllCollections } from "../actions/collection";
import { copyText } from "../utils/message-operations";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const ImagePanel = () => {
    const [imageSrc,setImageSrc] = useState('')
    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [description, setDescription] = useState('');
    const [remarks, setRemarks] = useState('');
    const [assetUrl, setAssetUrl] = useState('');
    const [selectedCollection, setSelectedCollection] = useState({id:Number(session.unfiltered_collection_id),name:"Unfiltered"});
    const [selectedType, setSelectedType] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [loader, setLoader] = useState('');
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [assetError, setAssetError] = useState(false)
    
    const dispatch          = useDispatch();

   
    const collections       = useSelector((state) => state.collection.collectionData);
    const userTags          = useSelector((state) => state.user.userTags)
    const urlData           = useSelector((state) => state.domain.urlData)

    useEffect(() => {
       const getCall = async () => {
        setLoader('loading')
        await dispatch(getAllCollections())
        const tabs = await getActiveTabURL()
        if (urlData === undefined || urlData === null) {
            const urlRes = await dispatch(fetchUrlData(tabs.url))
            if (urlRes.error === undefined && urlRes.payload?.error === undefined) {
                updateURLData(urlRes.payload.data)
            } 
        }
        else {
            updateURLData(urlData)
        }
        setLoader('success')
       }

       getCall()


        chrome?.storage?.sync.get(['imageData'],function(data){
        setImageSrc(data.imageData.imageSrc || '')
    });
    },[])

    const updateURLData = (details) => {
        if(details){
            setAssetUrl(details?.url || '')
            setBookmarkTitle(details?.title || '')
            setDescription(details?.description || '')
        }

        if(details && details.TagsData &&details.TagsData.length>0){
            let dd = []
            for(let i=0 ; i < 5;i++){
            let tag ={
                text:details?.TagsData[i]
            }
            const add = async () => {
                const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
                if(res.error === undefined){
                    const d = {
                    id: res.payload?.data?.data?.id,
                    tag: tag.text
                }
                dd.push(d)
                setSelectedTags([ ...selectedTags, ...dd])
                }
            }
            add()
            }
        }
    }

    const handleClosePanel = async() => {
        const tabs = await getActiveTabURL()
        window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_IMAGE_PANEL" })
        chrome.storage.sync.set({'imageData': {
            imageSrc: '',
        }})
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

  const onTagDelete = (i) => {
    selectedTags.splice(i, 1)
    setSelectedTags([ ...selectedTags ])
  }

const resetValues = () => {
    setBookmarkTitle('')
    setAssetUrl('')
    setDescription('')
    setSelectedTags([])
    setSelectedCollection('')
    setRemarks('')
    setSelectedType('Image')
}

const handleCopyLink = () => {
    try {
        copyText(imageSrc)
        message.success('Image Copied to clipboard');
      } catch (err) {
        message.error('Not have permission')
      }
}

const handleDownloadImg = () => {
    if(imageSrc){
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = imageSrc;

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }
}

const submitHandler = async() => {
    setError(false)
    setAssetError(false)
    if (selectedCollection.id === undefined) {
      setError(true)
      return;
    }
    if(!assetUrl){
        setAssetError(true)
        return;
    }
    setLoading(true)

    const tabs = await getActiveTabURL()

    const payload = {
        title: bookmarkTitle,
        description: description,
        type: typeof selectedType === "object" ? selectedType?.name : selectedType,
        url: (assetUrl && assetUrl.endsWith('/')) ? assetUrl?.slice(0, -1): assetUrl,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        collections: selectedCollection.id,
        notes: remarks,
        image: imageSrc,
        _id: uuidv4(),
    }

    const res = await dispatch(addImage(payload,payload.image))

    if(res.error === undefined){
        resetValues()
        window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_IMAGE_PANEL" })
        chrome.storage.sync.set({'imageData': {
            imageSrc: '',
        }})
        setLoading(false)
    }else{
        resetValues()
        window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_IMAGE_PANEL" })
        chrome.storage.sync.set({'imageData': {
            imageSrc: '',
        }})
        setLoading(false)
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
            <div className='bookmark-bg h-full' 
                        onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}
                    >
                        <div className="flex justify-between items-center px-4 py-3">
                            <div className="flex justify-start items-center cursor-pointer">
                                <span className="text-white text-sm ml-1">Save Image</span>
                            </div>
                            <div className='flex space-x-4 items-center justify-end'>
                                <div className='h-6 w-6 rounded-sm bg-[#C85C54] cursor-pointer'>
                                <XMarkIcon className="h-6 w-6 text-white p-1" onClick={handleClosePanel}/>
                                </div>
                            </div>
                        </div>
                        
                        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5' style={{height:'600px',overflow:'auto'}}>
                            <div className='grid grid-cols-8 gap-2'>
                                <div className='col-span-7' >
                                <Input size="medium w-full mb-2" type="text" name="link" placeholder="Asset url" 
                                loader={loader} 
                                chooseMessage={loader}
                                value={assetUrl} 
                                onChange={(e)=>setAssetUrl(e.target.value)}
                                />
                                {assetError && <span className='error-label'>Please Enter Valid URL</span>}
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
                                        <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} setSelectedCollection={setSelectedCollection} selectedCollection={selectedCollection} error={error}/> 
                                        
                                        </div>
                                    </div>
                                    </div>
                                    {/* Types */}
                                    <div 
                                    className={classNames("flex-1", showCollectionInput && 'hidden')}
                                    >
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Types</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                        <div 
                                        className="w-full">
                                            <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType} type={'Image'} disabled={true}/> 
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Image</h6>
                                    <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] imgWrapperContainer'>
                                        <div>
                                            <img src={imageSrc ? imageSrc : ''} alt="" />
                                            {/* download svg */}
                                            <svg 
                                            onClick={handleDownloadImg}
                                            className="dwldSvg"
                                            title="Download"
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z"/></svg>
                                            {/* link svg */}
                                            <svg 
                                            onClick={handleCopyLink}
                                            className="linkSvg"
                                            title="Copy Text"
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z"/></svg>
                                        </div>
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
                                        placeholder="Enter Tag"
                                        onClearAll={() => setSelectedTags([])}
                                        clearAll
                                        autocomplete
                                    />
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

                        <div className='bg-white px-4 py-2 border-t-2 mb-10'>
                        <BookmarkFooter page="codeSnippetPanel"
                            submitHandler = {submitHandler} 
                            loading={loading}
                            />
                        </div>
            </div>
        </div>
    )
}

export default ImagePanel;