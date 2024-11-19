import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/header/Header";
import BookmarkFooter from "../components/bookmarkFooter/BookmarkFooter";
import ComboBox from "../components/combobox/ComboBox";
import TypeComboBox from "../components/combobox/TypeComboBox";
import Input from "../components/input/Input";
import { WithContext as ReactTags } from 'react-tag-input';
import { addTag } from "../actions/tags";
import session from "../utils/session";
import { KEY_CODES } from "../utils/constants";
import { useSelector } from "react-redux";
import { getAllImages, getSingleImage, updateImage } from "../actions/image";
import { copyText } from "../utils/message-operations";

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

const SingleImage = () => {
    const dispatch = useDispatch(); 
    const navigate = useNavigate()
    const { gemId, collectionId } = useParams()

    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [error, setError] = useState(false)
    
    //states
    const [imageSrc,setImageSrc] = useState('')
    const [loader, setLoader] = useState('');
    const [assetUrl, setAssetUrl] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false)
    const collections       = useSelector((state) => state.collection.collectionData);
    const singleImage       = useSelector((state) => state.images.singleImage);
    const userTags          = useSelector((state) => state.user.userTags)
    const [loadingState, setLoadingState] = useState(false)

    useEffect(() => {
    const getCall = async () => {
        setLoadingState(true)
        setLoader('loading')
        const res = await dispatch(getSingleImage(collectionId,gemId))
  
        if(res){
            setLoadingState(false)
            setLoader('success')
        }
    }
    getCall()
  },[])

    useEffect(() => {
    if(singleImage && singleImage.length>0){
        setSelectedTags(singleImage[0].media.tags || [])
        setSelectedCollection(singleImage[0]?.collection_gems || '')
        setSelectedType(singleImage[0].media.type || '')
        setRemarks(singleImage[0].media.notes || '')
        setAssetUrl(singleImage[0].media.url)
        setBookmarkTitle(singleImage[0].media.title)
        setDescription(singleImage[0].media.description)
        setImageSrc(singleImage[0]?.S3_link[0] || '')
    }
  }, [singleImage]);

  const submitHandler = async() => {
    setError(false)
    if (selectedCollection?.id === undefined) {
      setError(true)
      return;
    }
    let newLink = assetUrl.endsWith('/') ? assetUrl.slice(0, -1): assetUrl
    setLoading(true)
    const payload = {
        title: bookmarkTitle,
        description: description,
        type: typeof selectedType === "object" ? selectedType?.name : selectedType,
        url: newLink,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        collections: selectedCollection.id,
        notes: remarks,
        image: imageSrc,
        _id: singleImage[0].media._id
      }
    const res = await dispatch(updateImage(payload.collections,gemId,payload))
    
    if(res.error === undefined){
      await dispatch(getAllImages(newLink))
      setLoading(false)
      navigate('/all-highlights')
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

  const handleCopyLink = () => {
    try {
        copyText(imageSrc);
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
        <div className='h-full' 
            onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}
            >
            <Header label="Edit Image" page="IMAGE" 
            />
            {
                loadingState ? <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
                    <Spin size='middle' tip='Loading...'/>
                </div>
                :
            
            <>
                <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5 mb-10'>
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
                                    <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] imgWrapperContainer' >
                                        <div>
                                            <img src={imageSrc ? imageSrc : ''} alt="" />
                                            {/* download svg */}
                                            <svg 
                                            onClick={handleDownloadImg}
                                            className="dwldSvg"
                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z"/></svg>
                                            {/* link svg */}
                                            <svg 
                                            onClick={handleCopyLink}
                                            className="linkSvg"
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

            <div className='bg-white px-4 border-t-2 mb-9 fixed bottom-0 w-full code-footer'>
                <BookmarkFooter page="highlight" footerMenuList={footerMenuList} 
                submitHandler = {submitHandler} 
                loading={loading}/>
            </div>
            </>
            }
            </div>
    )
}

export default SingleImage;