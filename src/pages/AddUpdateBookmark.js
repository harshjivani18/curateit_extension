/*global chrome*/
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { fetchUrlDataReset } from "../actions/domain";
// import { FETCH_URL_DATA_RESET } from "../actions/domain/action-types";
import { updateGemsReset } from "../actions/gem";
import { addGem, addGemReset, updateGem } from "../actions/gems";
// import { addUploadReset } from "../actions/upload";
import { message, Spin } from 'antd'
import { updateBookmarkWithExistingCollection, uploadBookmarkCover, uploadScreenshots } from "../actions/collection";
import BookmarkFooter from "../components/bookmarkFooter/BookmarkFooter";
import CheckBox from "../components/checkbox/CheckBox";
import ComboBox from "../components/combobox/ComboBox";
import TypeComboBox from "../components/combobox/TypeComboBox";
import Header from "../components/header/Header";
import Input from "../components/input/Input";
import Loadingscreen from "../components/Loadingscreen/Loadingscreen";
import PageScreenshot from "../components/Screenshot/PageScreenshot";
import { WithContext as ReactTags } from 'react-tag-input';
import { addTag } from "../actions/tags";
import session from "../utils/session";
import { checkBookmarkExists } from "../utils/find-collection-id";
import { setCurrentSiteData } from '../utils/set-current-site-data'
import { KEY_CODES } from "../utils/constants";
import { equalsCheck } from "../utils/equalChecks";
import { fetchUrlData } from "../actions/domain";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const fileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png"
];
const AddUpdateBookmark = ({action}) => {
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [image, setImage] = useState({});
  const [imageUrl, setImageUrl] = useState("");
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [assetUrl, setAssetUrl] = useState('');
  const [selectedCollection, setSelectedCollection] = useState({id:Number(session.unfiltered_collection_id),name:"Unfiltered"});
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loader, setLoader] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [covers, setCovers] = useState([])
  const [imgSpinner,setImgSpinner] = useState(false)
  // const [messageApi, contextHolder] = message.useMessage()
  
  const dispatch          = useDispatch();
  const navigate          = useNavigate()

  // for updates
  const imageRef          = useRef()
  const currentGem        = useSelector((state) => state.gem.currentGem);
  const collections       = useSelector((state) => state.collection.collectionData);
  const gemData           = useSelector((state) => state.gem.gemData)
  const updateGemData     = useSelector((state) => state.gem.updateGemData)
  const urlData           = useSelector((state) => state.domain.urlData)
  const addedGemData      = useSelector((state) => state.gem.addedGemData)
  const userTags          = useSelector((state) => state.user.userTags)
  // const uploadedFileData  = useSelector(state => state.upload.uploadFileData)
  const fetchingSite      = useSelector(state => state.domain.fetchingInformation)

  //Storing data fetched gem data in state
  useEffect(()=>{
    if(action === 'update' && currentGem){
      resetValues()
      setAssetUrl(currentGem.url)
      setImageUrl(currentGem.media?.covers && currentGem.media?.covers.length > 0 ? currentGem.media?.covers[currentGem.media?.covers.length - 1] : "")
      setBookmarkTitle(currentGem.title)
      setDescription(currentGem.description)
      setSelectedCollection(currentGem.parent)
      setSelectedType(currentGem.media_type)
      setSelectedTags(currentGem.tags)
      setFavorite(currentGem.is_favourite)
      setRemarks(currentGem.remarks)
      // setCovers(currentGem.media?.cover)
      setCovers(currentGem.media?.covers || [])
    }

    // else if (action === "update" && urlData) {
    //   updateUrlData("update")
    // }

    if (action === 'add' && addedGemData) {
      resetStateInAction("add")  
    }
    else if(action === 'update' && updateGemData){
      resetStateInAction("update")
    }

    // if (action === "add" && fetchingSite === true) {
    //   setLoader("loading")
    // }
    // else if (action === "add" && fetchingSite === false) {
    //   setLoader("success")
    // }
    
    // if (action === "add" && urlData === null && session.currentSiteLoader === undefined) {
    //   setLoader("loading")
    //   setCurrentSiteData().then((res) => {
    //     setLoader("success")
    //   })
    // }
    // else if (action === "add" && urlData && fetchingSite === false) {
    //   updateUrlData("add")
    // }

    if (action === "add" && loader === "") {
      setLoader("loading")
      setCurrentSiteData().then((res) => {
        setLoader("success")
      })
    }

    if (action === "add" && assetUrl === "") {
      updateUrlData("add")
    }

  }, [action, currentGem, addedGemData,updateGemData, fetchingSite])

  const resetValues = () => {
    setSelectedTags('')
    setBookmarkTitle('')
    setSelectedCollection('')
    setSelectedType('')
    setFavorite(false)
    setRemarks('')
    setLoading(false)
    setDescription('')
    setImageUrl('')
  }

  const resetStateInAction = (action) => {
    dispatch(action === "add" ? addGemReset() : updateGemsReset())
    setLoading(false)
      if(window.location.pathname === '/index.html' && window.location.search === ("?add-bookmark")){
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
  
  const updateUrlData = async (action) => {
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
    let screenshot = urlData?.Extras?.filter(component => {
      if(component.__component === "extras.screenshots"&& component.screenshot){
        return component
      }
    })[0]?.screenshot?.url
    if(urlData && urlData?.message){
      setBookmarkTitle('')
      setDescription('')
      setImageUrl('')
    }
    else if(urlData?.core){
      setBookmarkTitle(urlData?.core?.meta?.title)
      setDescription(urlData?.core?.meta?.description)
      setImageUrl(urlData?.core?.links?.thumbnail[0]?.href ? urlData?.core?.links?.thumbnail[0]?.href : screenshot)
      if (action === "add") {
        setCovers(prev =>[...prev,urlData?.thumbnail && urlData?.thumbnail[0]?.href])
        // dispatch(fetchUrlDataReset())
      }
    }
    else if(urlData){
      setAssetUrl(urlData.url)
      setBookmarkTitle(urlData.title)
      setDescription(urlData.description)
      setImageUrl(urlData.thumbnail?.url ? urlData.thumbnail?.url  : screenshot )
      // setSelectedTags(data)
      if (action === "add") {
        setCovers(prev =>[...prev,urlData.thumbnail?.url])
        // dispatch(fetchUrlDataReset())
      }
    }
  }

  //Storing uploaded image in backend
  const handleFileChange = async (e) => {
    setImageUrl("")
    setImgSpinner(true)
    const fileType = validFileType(e.target.files[0])
    if(fileType){
    let res        = null
    const formData = new FormData()
    formData.append("files", e.target.files[0])
    if (currentGem) {
      res = await dispatch(uploadBookmarkCover(currentGem.id, formData))
    }
    else {
      res = await dispatch(uploadScreenshots(formData))
    }

    if (res && res.error === undefined && res.payload.error === undefined) {
      const { data } = res.payload
      if (data) {
        const newCovers = currentGem ? [ ...data.media.covers ] : [ ...data ] 
        setCovers((currentGem) ? [ ...newCovers ] : [ ...covers, ...data ])
        setImageUrl(newCovers.length > 0 ? newCovers[newCovers.length - 1] : "")
      }
    }
    setImgSpinner(false)
    e.target.files = null
  }else{
    setImgSpinner(false)
    message.error("File type invalid")
  }
  };

  const submitHandler = async() => {
    if(assetUrl.length === 0){
      message.error("Please enter url")
      return
    }
    setError(false)
    if (selectedCollection.id === undefined) {
      setError(true)
      return;
    }
    const obj = {
      title: bookmarkTitle,
      description: description,
      media_type: typeof selectedType === "object" ? selectedType?.name : selectedType,
      author: session.userId ? parseInt(session.userId) : null,
      url: assetUrl,
      media: {
        covers: covers ? covers : imageUrl
      },
      metaData: {
        type:typeof selectedType === "object" ? selectedType?.name : selectedType,
        title: bookmarkTitle,
        icon: imageUrl || "",
        url: assetUrl,
      },
      collection_gems: selectedCollection.id,
      remarks: remarks,
      tags: selectedTags?.map((t) => { return t.id }),
      is_favourite: favorite
    }

    if (action === 'add'){
      if (checkBookmarkExists([selectedCollection], assetUrl)) {
        message.error("This bookmark already exist!")
        return
      }
      setLoading(true)
      const gemRes = await dispatch(addGem({ data: obj }))
      setLoading(false)
      // dispatch({
      //   type: FETCH_URL_DATA_RESET
      // })
      if (gemRes.error === undefined && gemRes.payload.error === undefined) {
        const { data } = gemRes.payload
        if (data.data) {
          const d      = data.data;
          const gTags  = d.attributes?.tags?.data?.map((t) => { return { id: t.id, tag: t.attributes?.tag }})
          const g      = {
            id: d.id,
            title: d.attributes?.title,
            media: d.attributes?.media,
            media_type: d.attributes?.media_type,
            url: d.attributes?.url,
            remarks: d.attributes?.remarks,
            metaData: d.attributes?.metaData,
            description: d.attributes?.description,
            S3_link: d.attributes?.S3_link,
            is_favourite: d.attributes?.is_favourite,
            tags: gTags
          }
          dispatch(updateBookmarkWithExistingCollection(g, selectedCollection, false, "add", null))
        }
      }
      return navigate("/search-bookmark");
    }
    else if(action === 'update'){
      const isCollectionChanged = currentGem?.parent.id !== selectedCollection.id;
      setLoading(true)
      await dispatch(updateGem(currentGem?.id, {
        data: obj
      }))
      const o = {
        ...obj,
        tags: selectedTags
      }
      dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : obj, selectedCollection, isCollectionChanged, "update", currentGem?.parent))
      setLoading(false)
    }
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

  const fetchUrlDetailsHandler = () => {
    if (fetchingSite === true) {
      setLoader('loading')
    }
    else {
      setLoader('success')
    }
  }

  const handleReader = () => {
    // 
  }


  if ((action === 'add' && !collections) || (action === 'update' && !(collections && gemData))){
    return <Loadingscreen showSpin={!collections} />
  }

  const fetchUrlDetails = async (assetUrl) => {
    const res = await dispatch(fetchUrlData(assetUrl))
    if(res && res.payload && res.payload.data){
      const data = res.payload.data
      setBookmarkTitle(data.title)
      setDescription(data.description !== null ? data?.description : "" )
      setImageUrl(data?.icon[0]?.href)
      const tag =  new Promise((resolve, reject) => {
        const selectedTagPromises = []
        const selectedTagObjs     = []
        for(let i=0 ; i < 5;i++){
          const tag ={
            text:data?.TagsData[i]
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
        setSelectedTags(selectedTagObjs)
      
      }
      )     
    }
  }
  const validFileType=(file)=> {
    return fileTypes.includes(file.type);
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
    <>
      <div className='h-full' 
           onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}
      >
        <Header label={action === 'add' ? "Add new bookmark" : "Update bookmark"} />
        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5 mb-10'>
          <div className='grid grid-cols-8 gap-2'>
            <div>
              <div className='bg-white w-[48px] h-[48px] rounded-lg pointer text-center' 
              onClick={()=>setOpen(prev=>!prev)}
              >
                {imgSpinner ? <Spin style={{marginTop:"5px"}} /> : ""}
                {imageUrl && <img className='w-[48px] h-[48px] rounded-lg' src={imageUrl} alt={image.name} />}
              </div>
              <div 
              onClick={() => imageRef.current.click()} 
              className='w-48px py-[2px] bg-white flex justify-center align-middle border-2 border-gray-300 rounded-sm mt-1 cursor-pointer'>
                <img src="/icons/image-up.svg" alt="up icon" className="h-[18px]" />
              </div>
              <input className='hidden' 
              ref={imageRef} onChange={handleFileChange} 
              onError={(err)=>message.error(err)}
              type="file" name="bookmark-image" id="bookmark-image" accept="image/png, image/jpeg" />
            </div>
            <div className='col-span-7' >
              <Input size="medium w-full mb-2" type="text" name="link" placeholder="Asset url"
              chooseMessage={(e)=>fetchUrlDetails(e.target.value)} value={assetUrl} onChange={(e)=>setAssetUrl(e.target.value)} 
              disabled={action === "update"} />
              <Input size="medium w-full mb-2" type="text" name="bookmark_name" placeholder="Bookmark title"
                value={bookmarkTitle || ""}  
              // loader={bookmarkTitle?false :loader} onFocus={()=>setLoader(false)} 
                onChange={(e) => setBookmarkTitle(e.target.value)}
              />
              <Input size="medium w-full" type="text" name="description" placeholder="Enter description" 
              value={description} loader={description?false :loader} onChange={(e) => setDescription(e.target.value)}
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
                      {
                          action === 'add' 
                          ? <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} setSelectedCollection={setSelectedCollection} selectedCollection={selectedCollection} error={error}/> 
                          : <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} setSelectedCollection={setSelectedCollection} selectedCollection={currentGem?.parent} error={error}/>
                      }
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
                    onClick={() => setShowTypeInput(true)} 
                    className="w-full">
                      {
                        action === 'add' 
                          ? <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType}/> 
                          : <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} updateInputShow={setShowTypeInput} setSelectedType = {setSelectedType} selectedType = {currentGem?.media_type}/>
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div className='pt-4'>
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Tags</h6>
                <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                  <ReactTags 
                    tags={selectedTags?.map((t) => { return { id: t.tag, text: t.tag }  })}
                    suggestions={userTags ? userTags.map((t) => { return { id: t.tag, text: t.tag } }) : []}
                    delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                    handleDelete={onTagDelete}
                    handleAddition={onTagAdd}
                    inputFieldPosition="bottom"
                    placeholder="Enter Tag"
                    onClearAll={() => setSelectedTags([])}
                    clearAll
                    // autocomplete
                  />
                  {/* <div className="clear-container">
                    <span className="clear-tag" onClick={()=>setSelectedTags([])}>Clear all</span>
                  </div> */}
                  {/* {
                      action === 'add' 
                        ? <Tags setSelectedTags = {setSelectedTags} tagsList={currentGem?.tags} userId = {session.userId}/> 
                        : <Tags setSelectedTags = {setSelectedTags} tagsList={currentGem?.tags} selecteduserId = {session.userId}/>
                  } */}
                </div>
              </div>
              <div className='pt-4'>
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Comment</h6>
                <Input size="medium w-full mb-2 h-20" type="text" name="descriptions" placeholder="Add your comments" value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
              <div className='pt-4'>
                  {
                      action === 'add' 
                        ? <CheckBox label="Mark as Favorites" name="favorite" darkColor={true}  onChange={(e) => setFavorite(prev => !prev)}/> 
                        : <CheckBox label="Mark as Favorites" name="favorite" darkColor={true} value={favorite}  onChange={(e) => setFavorite(prev => !prev)}/>
                  }
              </div>
            </div>
            <div className='containerr'>
            <PageScreenshot 
            open={open} setOpen={setOpen} setCoverImages={setCovers} coverImages={covers} 
            setImageUrl={setImageUrl} currentGem={currentGem}
            />
            </div>
          </div>
        </div>
        <div className='bg-white px-4 py-2 border-t-2 fixed bottom-0 w-full add-update-footer'>
          <BookmarkFooter submitHandler = {submitHandler} loading={loading} handleReader={handleReader}/>
        </div>
      </div>
    </>
  )
}

export default AddUpdateBookmark;