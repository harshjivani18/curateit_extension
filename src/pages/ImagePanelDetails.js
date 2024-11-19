import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import { PencilSquareIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { deleteImage, getAllImages, getSingleImage, singleImageReset, updateImage } from "../actions/image";
import { copyText } from "../utils/message-operations";
import { fetchCurrentTab } from '../utils/fetch-current-tab'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const ImagePanelDetails = () => {
    const [showTab,setShowTab] = useState(true)

    const dispatch = useDispatch(); 
    const navigate = useNavigate()

    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [error, setError] = useState(false)
    const [gemSingleId, setGemSingleId] = useState('')

    //states
    const [imageSrc,setImageSrc] = useState('')
    const [loader, setLoader] = useState('');
    const [assetUrl, setAssetUrl] = useState('');
    const [selectedCollection, setSelectedCollection] = useState({id:Number(session.unfiltered_collection_id),name:"Unfiltered"});
    const [selectedType, setSelectedType] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false)
    const collections       = useSelector((state) => state.collection.collectionData);
    const singleImage       = useSelector((state) => state.images.singleImage);
    const userTags          = useSelector((state) => state.user.userTags)
    const tabDetails        = useSelector((state) => state.app.tab)
    const [loadingState, setLoadingState] = useState(false)

    useEffect(() => {
    const getCall = async () => {
        setLoadingState(true)
        setLoader('loading')
        const res = await dispatch(getSingleImage('',''))
  
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
        notes: remarks,
        url:  newLink,
        collections: selectedCollection?.id,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type:typeof selectedType === "object" ? selectedType?.name : selectedType,
        image: imageSrc,
        title: bookmarkTitle,
        description: description,
        _id: singleImage[0].media._id,
      }

    const res = await dispatch(updateImage(payload.collections,gemSingleId,payload))
    
    if(res.error === undefined){
      await dispatch(getAllImages(newLink))
      setGemSingleId('')
      setLoading(false)
      dispatch(singleImageReset())
      setShowTab(true)
    }else{
      await dispatch(getAllImages(newLink))
      setGemSingleId('')
      setLoading(false)
      dispatch(singleImageReset())
      setShowTab(true)
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

    const pageImages       = useSelector((state) => state.images.images);
    const [showModal,setShowModal] = useState(false)

    // const [loading,setLoading] = useState(false)
    const [imageDetail,setImageDetail] = useState('')
    const [deleteLoading,setDeleteLoading] = useState(false)

    useEffect(() => {
    const getCall = async () => {
        setLoading(true)
        const tabObj        = tabDetails || await fetchCurrentTab()
        if (tabObj.length !== 0) {
            const response = await dispatch(getAllImages(tabObj.url))
            if(response){
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    }

    getCall()
  },[])

  const navigateToEdit = async (image) => {
    const gemId = image.id
    const collectionId = image.media.collections

   
    setShowTab(false)
    setLoadingState(true)
    setGemSingleId(gemId)
    const res = await dispatch(getSingleImage(collectionId,gemId))
    if(res){
        setLoadingState(false)
    }
  }

  const openDeleteModal = (image) => {
    setImageDetail(image)
    setShowModal(true)
  }

  const hideDeleteModal = () => {
    setShowModal(false)
    setImageDetail('')
  }

  const handleDeleteImage = async () => {
    const tabs = await getActiveTabURL()
    const url = tabs.url.endsWith('/') ? tabs.url.slice(0, -1) : tabs.url
    const gemId = imageDetail && imageDetail.id
    const collectionId = imageDetail && imageDetail.media.collections

    setDeleteLoading(true)
    const res = await dispatch(deleteImage(collectionId,gemId))

    if(res.error === undefined){
      await dispatch(getAllImages(url))

      setShowModal(false)
      setDeleteLoading(false)
      message.success('Image deleted successfully');
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
        setBookmarkTitle('')
        setDescription('')
        setImageSrc('')
  }

  const switchToImageTab = () => {
    dispatch(singleImageReset())
    setShowTab(true)
    resetValues()
  }

  const handleClosePanel = async() => {
    const tabs = await getActiveTabURL()
    window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_IMAGE_PANEL" })
  }

  const handleCopyLink = async() => {
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
        <div className='h-full '>
            <div className="p-6">
                <div className='flex justify-between items-center'>
                    <div className='flex justify-start items-center p-0'>
                        <h1 
                            className={classNames(showTab ? 'text-black' : 'bg-blue-500 border-blue-500 text-white', 'cursor-pointer px-3 py-2 border-2 border-r-0 rounded-l-lg')}>
                            Info
                        </h1>
                        <h1 onClick={() => switchToImageTab()}
                            className={classNames(showTab ? 'bg-blue-500 border-blue-500 text-white' : 'text-black', 'cursor-pointer px-3 py-2 border-2 border-l-0 rounded-r-lg')}>
                            Images 
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
            pageImages && pageImages.length>0 ? pageImages.map((image,i) => {
              return(
                 <>
              <div className="mx-auto w-full" key={i}>
                <div className='group ct-relative'>

                  <div className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">

                    <div className='flex justify-start items-center gap-1'>
                        <div className='highlightItem'>
                          <div>
                              {image.media.title}
                          </div>
                      </div>
                    </div>

                  </div>

                  <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100' style={{top:'-10px'}}>
                      <button className='edit-btn' 
                      onClick={() => navigateToEdit(image)}
                      >
                        <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                      </button>
                      <button 
                      onClick={() => openDeleteModal(image)}
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
                    No Image saved.
                </p>
            </>
        }

        <div className={showModal === true ? "pop-box p-fixed" : ""}>
          <div className={showModal === true ? "popup-delete-model" : ""}>
            {
              showModal && <div className='popup-delete'>
                <h1 className='content-h'>Confirm delete?</h1>
                  <div className='btnn-pop'>
                    <button className='yes-btn' onClick={() => handleDeleteImage()} disabled={deleteLoading}>{deleteLoading ? 'Deleting..' : 'Yes'}</button>
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
                                            title="Copy link"
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

export default ImagePanelDetails;