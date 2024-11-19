/*global chrome*/
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter'
import FolderList from '../components/folderList/FolderList'
import HomeHeader from '../components/HomeHeader/HomeHeader'
import InputWithIconOther from '../components/inputWithIcon/InputWithIconOther'
import { useDispatch, useSelector } from "react-redux";
import { getAllCollections, removeGemFromCollection } from '../actions/collection'
import LoadingScreen from '../components/Loadingscreen/Loadingscreen';
import { deleteGem, setCurrentGem } from "../actions/gem/index.js";
import { deleteCollection, editCollection, moveCollection, moveGems, moveToRoot, searchableData } from '../actions/collection/index'
import Modal from '../components/modal/Modal.js'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import MenuList from '../components/menuList/MenuList'
import { Menu } from '@headlessui/react'
import { processNestedBookmarks } from '../utils/process-nested-bookmarks'
import { searchData} from '../utils/searchData'
import { SETTING_MENU,
         BOOKMARK_SAVE_OPTIONS } from '../utils/constants'    
// import session from '../utils/session'
import { message, Tooltip } from 'antd';
import session from '../utils/session'
import { getRecentURLDetails } from '../utils/message-operations.js'
// import {message} from 'antd';


const SearchBookmark = () => {
  const navigate                            = useNavigate()
  const dispatch                            = useDispatch();
  const importbookmark                      = useSelector((state) => state.collection.collectionData)
  const searchAllData                       = useSelector((state) => state.collection.searchCollectionData)
  const [searchText, setSearchText]         = useState("");
  // const [showSpin, setShowSpin]             = useState(false);
  const [model, setModel]                   = useState(false);
  const [header, setHeader]                 = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [currentId, setCurrentId]           = useState(null);
  const [edit, setEdit]                     = useState(false)
  const [isProcessing, setIsProcessing]     = useState(false)
  const [droppedObj, setDroppedObj]         = useState(null)
  // const [gemName, setGemName]               = useState("")
  // const [gemId,setGemId]                    = useState("")
  // const [gemParentId,setGemParentId]        = useState("")  
  const [currentObj, setCurrentObj]         = useState(null)
  const [timer, setTimer]                   = useState(null)
  const [messageApi, contextHolder]         = message.useMessage();

  useEffect(() => {
    if (!isProcessing && importbookmark.length === 0) {
      setIsProcessing(true)
      dispatch(getAllCollections()).then((res) => {
        setIsProcessing(false)
        setHeader(res.payload.data.length === 0)
        session.setBookmarkFetchingStatus("done")
      })
    }
    redirectPage();
  }, []);

  const onChangeText = (value) => {
    setSearchText(value);
    clearTimeout(timer)
    const newTimer = setTimeout(async() => {
    const res = await dispatch(searchableData(value))
    // 
  }, 700)
  setTimer(newTimer)
  }

  const redirectPage =  () => {
    const resPage =  localStorage.getItem('collectionData')?.length
    if(localStorage.getItem('socialTrue') === "true"){
      if (resPage === 2) {
        navigate("/")
        localStorage.setItem("socialTrue",false)
      }
    }
  }
  const editGem = (gem) => {
    
    dispatch(setCurrentGem(gem))
    navigate(`/bookmark/${gem.gem_id}`)
  }

  const modalEdit = async (data) => {
    setModel(true)
    setEdit(true)
    setCurrentId(data.id)
    setCollectionName(data.name)
    setCurrentObj(data)
  }

  const modalDelete = async (data) => {
    setModel(true)
    setCurrentId(data.id)
    setCollectionName(data.name || data.obj.title )
    setCurrentObj(data)
  }

  const deleteGems = async () => {
    if (currentObj === null) return
    const res = await dispatch(deleteGem(currentObj.obj.id, currentObj.parentId));
    if (res.error === undefined && res.payload?.error === undefined) {
      dispatch(removeGemFromCollection(currentObj.obj.id, currentObj.parentId))
      messageApi.open({
        type: 'success',
        content: 'Bookmark deleted successfully!',
      });
      cancel()
      return 
    }
    messageApi.open({
      type: 'error',
      content: 'An error occurred while delete!',
    });
    cancel()
  }

  const deleteCollections = async () => {
    const res = await dispatch(deleteCollection(currentId));
    if(res.error){
      messageApi.open({
        type: 'error',
        content: 'An error occurred while delete!',
    });}else{
      messageApi.open({
        type: 'success',
        content: 'Delete Successfully!',
    });
    }
    cancel()
  }

  const editCollections = async (name) => {
    await dispatch(editCollection(currentId, name));
    setEdit(false)
    setModel(false)
    setCurrentId(null)
    setCurrentObj(null)
  }

  const cancel = () => {
    setModel(false)
    setEdit(false)
    setCurrentId(null)
    setCollectionName("")
    setCurrentObj(null)
  }

  const onItemDrop = async (e) => {
    const { dragNode, node } = e
    if(dragNode.key === `Folder-${session.unfiltered_collection_id}`){
      setDroppedObj(0)
      return null
    }
    const dragObj            = dragNode.title?.props?.obj
    const dropObj            = node.title?.props?.obj
    const dropProps          = node.title?.props
    const parentId           = dragNode.title?.props?.parentId
    if(node.title?.props?.obj.id.toString() === session.unfiltered_collection_id.toString() && dragNode.title?.props?.obj?.media_type !== "Link"){
      setDroppedObj(0);
      return null
    }
    if (dragObj.media !== undefined && dropObj.media !== undefined) {
      messageApi.open({
        type: 'error',
        content: "You can't move bookmark into another bookmark",
      });
      return
    }
    setDroppedObj(dragObj)
    if (parentId && dragObj.folders === undefined) {
      await dispatch(moveGems(dragObj.id, parentId, dropObj.id, dragObj, dropObj))
    }
    else {
      if (dropObj.folders === undefined && dragNode.title?.props?.obj?.media_type !== "Link") {
        await dispatch(moveCollection(dragObj.id, dropProps.parent.id, dragObj, dropProps.parent))
      }
      else if( dragNode.title?.props?.obj?.media_type !== "Link") {
        await dispatch(moveCollection(dragObj.id, dropObj.id, dragObj, dropObj))
      }
    }
    // setDroppedObj(null)
  }

  const onItemLeave = async (e) => {
    const { node }  = e
    const dropObj   = node.title?.props?.obj
    const collection_id = node.key.substring(7)
    if(collection_id === session.unfiltered_collection_id){
      return null
    }
    if ((droppedObj && dropObj.id !== droppedObj.id && droppedObj !== 0) || droppedObj === null) {
      if (dropObj.folders !== undefined) {
        await dispatch(moveToRoot(dropObj.id, dropObj))
      }
    }
  }

  const onAddBookmarkClick = async () => {
    await getRecentURLDetails()
    navigate('/add-bookmark')
  }

  const cbs  = {
    modalEdit,
    modalDelete,
    editGem,
    deleteGems
  }
  // 
  const data = searchText.length === 0 && processNestedBookmarks(importbookmark, cbs) 
  const searchDatas = searchText.length !== 0 && searchData(searchAllData, cbs)


  return (
    <>
      {contextHolder}
      <div className='ct-relative bg-[#F8FBFF] pt-14 max-h-[600px] overflow-y-auto scroll-smooth dark:bg-[#292B38]' >
        <div className='header fixed top-0 left-0 border-b-2 py-3 px-4 bg-white z-30  dark:bg-slate-500'>
          <HomeHeader headerMenu={SETTING_MENU} />
        </div>
        <div className={model === true ? "footer-position py-3 px-4" : "py-3 px-4"}>
          <div className='fixed search-header z-20'>
            <div className='flex justify-between items-center gap-2'>
              <div className='flex-1 ct-relative'>
                <InputWithIconOther onChange={onChangeText} type="text" placeholder="Search bookmark" name="search-bookmark" showRightIcon={true} />
              </div>
              <div className='flex justify-end items-center gap-[1px]'>
                <Tooltip title="Save bookmark">
                  <button className='h-[40px] bg-[#347AE2] text-white rounded-l-lg flex justify-center items-center gap-1 px-2'>
                    <button className='h-[40px] w-[40px] bg-[#347AE2] rounded-lg flex justify-center items-center' onClick={onAddBookmarkClick}>
                      <img className='h-5 w-5' src="/icons/add-bookmark.svg" alt="add bookmark icon" />
                    </button>
                  </button>
                </Tooltip>
                <MenuList menus={BOOKMARK_SAVE_OPTIONS} position="origin-top-left top-0 right-0 mt-10 w-40">
                  <Menu.Button className="h-[40px] bg-[#347AE2] text-white rounded-r-lg inline-flex w-full justify-center items-center px-2">
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </Menu.Button>
                </MenuList>
              </div>
            </div>
          </div>
          {isProcessing && <LoadingScreen showSpin={isProcessing} />}
          {(importbookmark.length === 0 || header === true) && !isProcessing ? <div className='text-center py-10 mt-10'>
            <div className='ct-relative mt-2'>
              <img className='h-50 w-50 my-0 mx-auto' src="/icons/upload-error.svg" alt="Cloud ellipse icons" />
              <div className='absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400'>
                No data! Please add bookmark
              </div>
            </div>
          </div> : <></>}
          
          <div className={importbookmark.length !== 0 ? 'main-box mt-10 py-2': 'd-none'}>
            <FolderList
              searchText={searchText}
              list={searchText.length === 0 ? data : searchDatas}
              onDrop={onItemDrop}
              onDragLeave={onItemLeave}
            />
          </div>
        </div>
      </div>
      <div className={model === true ? "pop-box" : ""}>
        <div className={model === true ? "popup-delete-model" : ""}>
          {model && <Modal
            showOpen={model}
            deleteCollections={(currentObj && currentObj.obj && currentObj.obj.media !== undefined) ? deleteGems : deleteCollections}
            edit={edit}
            cancel={cancel}
            collectionName={collectionName}
            editCollections={editCollections}
          />}
        </div>
        <div className={model === true ? "footer-active border-t-[1px] py-3 px-4 bg-white z-50" : "border-t-[1px] py-3 px-4 bg-white z-50"}>
          <BookmarkFooter page="search-bookmark"/>
        </div>
      </div>
    </>
  )
}

export default SearchBookmark