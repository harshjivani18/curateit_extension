/*global chrome*/
import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/header/Header'
import Input from '../components/input/Input'
import ComboBox from '../components/combobox/ComboBox'
import TypeComboBox from '../components/combobox/TypeComboBox'
import Tags from '../components/tags/Tags'
import CheckBox from '../components/checkbox/CheckBox'
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter'
import { useDispatch, useSelector } from "react-redux";
import { addGem, addGemReset } from '../actions/gem'
import { fetchUrlData, fetchUrlDataReset } from '../actions/domain'
import Loadingscreen from '../components/Loadingscreen/Loadingscreen'
import { FETCH_URL_DATA_RESET } from '../actions/domain/action-types'
import PageScreenshot from '../components/Screenshot/PageScreenshot'
import { addUploadFile, addUploadReset } from '../actions/upload'
import { WithContext as ReactTags } from 'react-tag-input';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const KeyCodes = {
  comma: 188,
  enter: 13
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

const AddBookmark = () => {
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
  const [selectedTags, setSelectedTags] = useState([]);   
  const [loader, setLoader] = useState('');
  const [open, setOpen] = useState(false);
  const [coverImages, setCoverImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const collections = useSelector((state) =>  state.collection.collectionData)
  const urlData = useSelector((state) =>  state.domain.urlData)
  const addedGemData = useSelector((state) =>  state.gem.addedGemData)
  const uploadedFileData = useSelector(state => state.upload.uploadFileData)
  const [t, setT] = useState([])
  //Reseting state and redirecting 
  useEffect(()=>{
    if(addedGemData){
      dispatch(addGemReset())
      setLoading(false)
      if(window.location.pathname === '/index.html' && window.location.search === "?add-bookmark"){
        chrome?.tabs?.query({active:true}, function(tabs){
          tabs.forEach((tab) => {
            if(tab.url === window.location.href){
              chrome.tabs.remove(
                tab.id
              )
            }
          })
        })
      }else{
      navigate('/search-bookmark')
      } 
    }
  },[addedGemData])

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

  useEffect(() => {
    //Reseting default value
    setSelectedTags('')
    setBookmarkTitle('')
    setSelectedCollection('')
    setSelectedType("Link")
    setFavorite(false)
    setRemarks('')
    setLoading(false)
    setDescription('')
    setImageUrl('')
    setT('')
    //Fetching active tab url
    chrome?.tabs?.query({active:true}, function(tab){
      setAssetUrl(tab[0]?.url)
      if(tab[0]?.url.charAt(tab[0]?.url.length-1) === '/'){
        dispatch(fetchUrlData(tab[0]?.url))
      }else{
      dispatch(fetchUrlData(`${tab[0]?.url}/`))
      }
      setLoader('loading')
    } );

  }, []);
  const data3 = []
  const tagDataArrange = (data) => {
    if(data === null){
      return
    }
    for (let i = 0; i < 5; i++) {
      let obj = {
        id: i.toString(),
        text: data[i]
      }
      data3.push(obj)
    }
    setT(data3)
  }

  //Storing domain details in state
  useEffect(()=>{
    if(urlData && urlData?.message){
      setBookmarkTitle('')
      setDescription('')
      setImageUrl('')
    }else if(urlData?.title){
      setBookmarkTitle(urlData?.title)
      setDescription(urlData?.description)
      setImageUrl(urlData?.thumbnail && urlData?.thumbnail[0]?.href)
      setCoverImages(prev =>[...prev,urlData?.thumbnail && urlData?.thumbnail[0]?.href])
      setLoader('success')
      tagDataArrange(urlData?.TagsData )
      dispatch(fetchUrlDataReset())
    }else if(urlData && urlData[0]){
      setBookmarkTitle(urlData[0]?.title)
      setDescription(urlData[0]?.description)
      setImageUrl(urlData[0]?.thumbnail?.url)
      setCoverImages(prev =>[...prev,urlData[0]?.thumbnail?.url])
      setLoader('success')
      dispatch(fetchUrlDataReset())
    }
  }, [urlData])

  //Adding Bookmark
  const submitHandler = () => {
    setError(true)
    if (selectedCollection.length !== 0) {
      setError(false)
    dispatch(addGem({
      data: [{
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
        collection_gems: selectedCollection.id,
        remarks: remarks,
        tags: t,
        is_favourite: favorite
      }]

    }))
    setLoading(true)
    dispatch({
      type: FETCH_URL_DATA_RESET
    })
  } 
  }
  //Sending request for domain details
  const fetchUrlDetailsHandler = () => {
    if(assetUrl.charAt(assetUrl.length-1) === '/'){
      dispatch(fetchUrlData(assetUrl))
    }else{
    dispatch(fetchUrlData(`${assetUrl}/`))
    }
    setLoader('loading')
  }
   //delete tag
   const handleDelete = i => {
    setT(t.filter((t, index) => index !== i));
  };

  //add tag
  const handleAddition = tag => {
        setT([...t, tag]);
  };



  if(!collections) {
    return <Loadingscreen showSpin={!collections} />
  }

  return (
    <div
      className="bookmark-bg h-full"
      onClick={() => {
        setShowCollectionInput(false)
        setShowTypeInput(false)
      }}
    >
      <Header label="Add new bookmark" />
      <div className="bg-[#F8FBFF] p-4 rounded-t-[16px]">
        <div className="grid grid-cols-8 gap-2">
          <div>
            <div
              className="bg-white w-[48px] h-[48px] rounded-lg pointer"
              onClick={() => setOpen((prev) => !prev)}
            >
              {imageUrl && (
                <img
                  className="w-[48px] h-[48px] rounded-lg"
                  src={imageUrl}
                  alt={image.name}
                />
              )}
            </div>
            <div
              onClick={() => imageRef.current.click()}
              className="w-48px py-[2px] bg-white flex justify-center align-middle border-2 border-gray-300 rounded-sm mt-1 cursor-pointer"
            >
              <img
                src="/icons/image-up.svg"
                alt="up icon"
                className="h-[18px]"
              />
            </div>
            <input
              className="hidden"
              ref={imageRef}
              onChange={handleFileChange}
              type="file"
              name="bookmark-image"
              id="bookmark-image"
              multiple
            />
          </div>
          <div className="col-span-7">
            <Input
              size="medium w-full mb-2"
              type="text"
              name="link"
              placeholder="Asset url"
              chooseMessage={fetchUrlDetailsHandler}
              value={assetUrl}
              onChange={(e) => setAssetUrl(e.target.value)}
            />
            <Input
              size="medium w-full mb-2"
              type="text"
              name="bookmark_name"
              value={bookmarkTitle}
              placeholder="Bookmark title"
              loader={bookmarkTitle ? false : loader}
              onFocus={() => setLoader(false)}
              onChange={(e) => setBookmarkTitle(e.target.value)}
            />
            <Input
              size="medium w-full"
              type="text"
              name="description"
              placeholder="Enter description"
              value={description}
              loader={description ? false : loader}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="pt-6 flex justify-between space-x-2">
              {/* Collections */}
              <div className={classNames("flex-1", showTypeInput && "hidden")}>
                <h6 className="block text-xs font-medium text-gray-500 mb-1">
                  Collections
                </h6>
                <div
                  className="ct-relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => setShowCollectionInput(true)}
                    className="w-full"
                  >
                    <ComboBox
                      inputShown={showCollectionInput}
                      setShowCollectionInput={setShowCollectionInput}
                      collectionData={collections}
                      userId={collections.id}
                      setSelectedCollection={setSelectedCollection}
                      selectedCollection={selectedCollection}
                      error={error}
                    />
                  </div>
                </div>
              </div>
              {/* Types */}
              <div
                className={classNames(
                  "flex-1",
                  showCollectionInput && "hidden"
                )}
              >
                <h6 className="block text-xs font-medium text-gray-500 mb-1">
                  Types
                </h6>
                <div
                  className="ct-relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => setShowTypeInput(true)}
                    className="w-full"
                  >
                    <TypeComboBox
                      inputShown={showTypeInput}
                      setShowTypeInput={setShowTypeInput}
                      setSelectedType={setSelectedType}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <h6 className="block text-xs font-medium text-gray-500 mb-1">
                Tags
              </h6>
              <div className="bg-white border-2 border-gary-400 p-2 rounded-lg">
                {/* <Tags setSelectedTags = {setSelectedTags} tagsList={collections.tags} userId = {collections.id}/> */}
                <ReactTags
                  tags={t}
                  // suggestions={suggestions}
                  delimiters={delimiters}
                  handleDelete={handleDelete}
                  handleAddition={handleAddition}
                  inputFieldPosition="bottom"
                  placeholder=""
                  autocomplete
                />
              </div>
            </div>
            <div className="pt-4">
              <h6 className="block text-xs font-medium text-gray-500 mb-1">
                Comment
              </h6>
              <Input
                size="medium w-full mb-2 h-20"
                type="text"
                name="descriptions"
                placeholder="Add your comments"
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div className="pt-4">
              <CheckBox
                label="Mark as Favorites"
                name="favorite"
                darkColor={true}
                onChange={(e) => setFavorite((prev) => !prev)}
              />
            </div>
          </div>
          <div className="containerr">
            <PageScreenshot
              open={open}
              setOpen={setOpen}
              setCoverImages={setCoverImages}
              coverImages={coverImages}
              setImageUrl={setImageUrl}
            />
          </div>
        </div>
      </div>
      <div className="bg-white px-4 py-2 border-t-2">
        <BookmarkFooter submitHandler={submitHandler} loading={loading} />
      </div>
    </div>
  )
}

export default AddBookmark