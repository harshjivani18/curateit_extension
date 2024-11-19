import React, { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/header/Header'
import Input from '../components/input/Input'
import ComboBox from '../components/combobox/ComboBox'
import TypeComboBox from '../components/combobox/TypeComboBox'
import Tags from '../components/tags/Tags'
import CheckBox from '../components/checkbox/CheckBox'
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter'
import { useDispatch, useSelector } from "react-redux";
import { fetchGemById, updateGem } from '../actions/gems'
import { fetchUrlData } from '../actions/domain'
import Loadingscreen from '../components/Loadingscreen/Loadingscreen'
import { updateGemsReset } from '../actions/gem'
import { addUploadFile, addUploadReset } from '../actions/upload'
import { updateGemWithCollection } from '../actions/collection'
import PageScreenshot from '../components/Screenshot/PageScreenshot'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const UpdateBookmark = () => {
  const {id} = useParams()
  const imageRef = useRef()
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [image, setImage] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [assetUrl, setAssetUrl] = useState('');
  const [selectedCollection, setSelectedCollection] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState('');
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState('');
  const [open, setOpen] = useState(false);
  const [coverImages, setCoverImages] = useState([])
  const [error, setError] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const collections = useSelector((state) =>  state.user.userData)
  const gemData = useSelector((state) =>  state.gem.gemData)
  const updateGemData = useSelector((state) =>  state.gem.updateGemData)
  const urlData = useSelector((state) =>  state.domain.urlData)
  const uploadedFileData = useSelector(state => state.upload.uploadFileData)

  //Requesting Gem details and initializing state
  useEffect(() => {
    setSelectedTags('')
    setBookmarkTitle('')
    setSelectedCollection('')
    setSelectedType('')
    setFavorite(false)
    setRemarks('')
    setLoading(false)
    setDescription('')
    setImageUrl('')
    dispatch(fetchGemById(id))
  }, []);

  //Reseting state and redirecting
  useEffect(()=>{
    if(updateGemData){
      dispatch(updateGemsReset())
      setLoading(false)
      navigate('/search-bookmark')
    }
  },[updateGemData])

  //Storing data fetched gem data in state
  useEffect(()=>{
    if(gemData){
      setAssetUrl(gemData?.attributes?.metaData?.link)
      setImageUrl(gemData?.attributes?.metaData?.icon)
      setBookmarkTitle(gemData?.attributes?.metaData?.title)
      setDescription(gemData?.attributes?.description)
      setSelectedCollection(gemData?.attributes?.collection_gems?.data)
      setSelectedType(gemData?.attributes?.media_type)
      setSelectedTags(gemData?.attributes?.tags?.data)
      setFavorite(gemData?.attributes?.is_favourite)
      setRemarks(gemData?.attributes?.remarks)
      setCoverImages(gemData?.attributes?.media?.cover)
    }
  }, [gemData])
  
  //Storing uploaded image url and reseting upload state
  useEffect(() => {
    if(uploadedFileData && uploadedFileData[0]){
      setImageUrl(uploadedFileData[0]?.url)
      dispatch(addUploadReset())
    }},[uploadedFileData])

  //Storing uploaded image in backend
  const handleFileChange = e => {
    const formData = new FormData()
    formData.append("files", e.target.files[0])
    dispatch(addUploadFile(formData))
    e.target.files = null
  };

  //Storing domain details in state
  useEffect(()=>{
    if(urlData && urlData?.message){
      setBookmarkTitle('')
      setDescription('')
      setImageUrl('')
    }else if(urlData?.core){
      setBookmarkTitle(urlData?.core?.meta?.title)
      setDescription(urlData?.core?.meta?.description)
      setImageUrl(urlData?.core?.links?.thumbnail[0]?.href)
      setLoader('success')
    }else if(urlData && urlData[0]){
      setBookmarkTitle(urlData[0].title)
      setDescription(urlData[0].description)
      setImageUrl(urlData[0]?.thumbnail?.url)
      setLoader('success')
    }
  }, [urlData])

  //Sending request for domain details
  const fetchUrlDetailsHandler = () => {
    if(assetUrl.charAt(assetUrl.length-1) === '/'){
      dispatch(fetchUrlData(assetUrl))
    }else{
    dispatch(fetchUrlData(`${assetUrl}/`))
    }
    setLoader('loading')
  }

  //Updating Bookmark
  const submitHandler = async () => {
    setError(true)
    if (selectedCollection.length !== 0) {
      setError(false)
    const updatedObj = {
      title: bookmarkTitle,
      description: description,
      media_type: selectedType?.name,
      author: collections.id,
      url: assetUrl,
      media: {
        cover: coverImages
      },
      metaData: {
        type:selectedType?.name,
        title: bookmarkTitle,
        icon: imageUrl,
        url: assetUrl,
      },
      remarks: remarks,
      collection_gems: selectedCollection.id,
      tags: selectedTags,
      is_favourite: favorite
    }
    setLoading(true)
    await dispatch(updateGem(id,{
      data: updatedObj
    }))
    setLoading(false)
  } 
  }
  if(!(collections && gemData)) {
    return <Loadingscreen showSpin={!(collections && gemData)} />

  }


  return (
    <div className='bookmark-bg h-full' onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}>
      <Header label="Update bookmark" />
      <div className='bg-[#F8FBFF] p-4 rounded-t-[16px]'>
        <div className='grid grid-cols-8 gap-2'>
          <div>
            <div className='bg-white w-[48px] h-[48px] rounded-lg pointer' onClick={()=>setOpen(prev=>!prev)}>
              {imageUrl && <img className='w-[48px] h-[48px] rounded-lg' src={imageUrl} alt={image.name} />}
            </div>
            <div onClick={() => imageRef.current.click()} className='w-48px py-[2px] bg-white flex justify-center align-middle border-2 border-gray-300 rounded-sm mt-1 cursor-pointer'>
              <img src="/icons/image-up.svg" alt="up icon" className="h-[18px]" />
            </div>
            <input className='hidden' ref={imageRef} onChange={handleFileChange} type="file" name="bookmark-image" id="bookmark-image" />
          </div>
          <div className='col-span-7'>
            <Input size="medium w-full mb-2" type="text" name="link" placeholder="Asset url" chooseMessage={fetchUrlDetailsHandler} value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)}/>
            <Input size="medium w-full mb-2" type="text" name="bookmark_name" placeholder="Bookmark title" value={bookmarkTitle} loader={loader} onChange={(e) => setBookmarkTitle(e.target.value)}/>
            <Input size="medium w-full" type="text" name="description" placeholder="Enter description" value={description} loader={loader} onChange={(e) => setDescription(e.target.value)}/>
            <div className='pt-6 flex justify-between space-x-2'>
              {/* Collections */}
              <div className={classNames("flex-1", showTypeInput && "hidden")}>
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Collections</h6>
                <div className='ct-relative' onClick={e => e.stopPropagation()}>
                  <div onClick={() => setShowCollectionInput(true)} className="w-full">
                    <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections?.collections} userId = {collections?.id} setSelectedCollection = {setSelectedCollection}  selectedCollection = {gemData?.attributes?.collection_gems?.data} error={error} />
                  </div>
                </div>
              </div>
              {/* Types */}
              <div className={classNames("flex-1", showCollectionInput && 'hidden')}>
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Type</h6>
                <div className='ct-relative' onClick={e => e.stopPropagation()}>
                  <div onClick={() => setShowTypeInput(true)} className="w-full">
                    <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} updateInputShow={setShowTypeInput} setSelectedType = {setSelectedType} selectedType = {gemData?.attributes?.media_type}/>
                  </div>
                </div>
              </div>
            </div>
            <div className='pt-4'>
              <h6 className="block text-xs font-medium text-gray-500 mb-1">Tags</h6>
              <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                <Tags setSelectedTags = {setSelectedTags} tagsList={collections?.tags} userId = {collections?.id} selectedTags={gemData?.attributes?.tags?.data}/>
              </div>
            </div>
            <div className='pt-4'>
              <h6 className="block text-xs font-medium text-gray-500 mb-1">Comment</h6>
              <Input size="medium w-full mb-2" type="text" name="description" placeholder="Add your comments" value={remarks} onChange={(e) => setRemarks(e.target.value)}/>
            </div>
            <div className='pt-4'>
              <CheckBox label="Mark as Favorites" name="favorite" darkColor={true} value={favorite}  onChange={(e) => setFavorite(prev => !prev)}/>
            </div>
          </div>
          <div className='containerr'>
          <PageScreenshot open={open} setOpen={setOpen} setCoverImages={setCoverImages} coverImages={coverImages} setImageUrl={setImageUrl}/>
          </div>
        </div>
      </div>
      <div className='bg-white px-4 py-2 border-t-2'>
        <BookmarkFooter submitHandler = {submitHandler}/>
      </div>
    </div>
  )
}

export default UpdateBookmark