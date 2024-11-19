/*global chrome*/
import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
// import { Menu } from "@headlessui/react";
// import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { IoMdRefresh } from "react-icons/io";

// import CommonLayout from "../../components/layouts/CommonLayout";
import Modal from "../../components/modal/Modal";
// import InputWithIconOther from "../../components/inputWithIcon/InputWithIconOther";
// import MenuList from "../../components/menuList/MenuList";
import LoadingScreen from "../../components/Loadingscreen/Loadingscreen";
import FolderList from "../../components/folderList/FolderList";
// import { BOOKMARK_SAVE_OPTIONS } from "../../utils/constants";
import { searchData } from "../../utils/searchData";
import { processNestedBookmarks } from "../../utils/process-nested-bookmarks";
import session from "../../utils/session";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import {  getAllLevelCollectionPermissions, getShortLinksForAiandText } from "../../utils/find-collection-id";

import {
  searchableData,
  deleteCollection,
  removeGemFromCollection,
  moveCollection,
  moveGems,
  moveToRoot,
  editCollection,
  getAllCollections,
  getSharedCollections,
  updateCollection,
  moveCollectionShared,
  setLoadedKeys,
  setExpandedKeys,
  getGemsByMediaType,
} from "../../actions/collection";
import { deleteGem, setCurrentGem, setCurrentMedia } from "../../actions/gem";
import { setActiveHomeTab, setIsSyncing, setPercentageData, setShortLinks, setSyncingCollection } from "../../actions/app";
import {
  updateHighlightsArr
  // getAllHighlights,
} from "../../actions/highlights";
import { getAllCollectionWithSub } from "../../utils/find-collection-id";
import { getRecentURLDetails, openProperPage } from "../../utils/message-operations";
import { fetchAllSharedExpanders, fetchAllShortLinks } from "../../actions/gems";
import { classifyIMDbURL } from "../../utils/constants";
import { StopCircleIcon } from "@heroicons/react/24/outline";
import { StopIcon } from "@heroicons/react/24/solid";
import ImportProgressBar from "../../components/common/ImportProgressBar";

const Gems = (props) => {
  const inputRef = useRef();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const importBookmark = useSelector(
    (state) => state.collection.collectionData
  );
  const sharedCollections = useSelector(
    (state) => state.collection.sharedCollections
  );
  const searchAllData = useSelector(
    (state) => state.collection.searchCollectionData
  );
  const tabDetails    = useSelector((state) => state.app.tab);
  const isSyncing = useSelector((state) => state.app.isSyncing);
  const percentage = useSelector((state) => state.app.percentage);
  const totals = useSelector((state) => state.app.totals)
  const fullLoaderScreen = useSelector((state) => state.app.fullLoaderScreen)
  const highlights    = useSelector((state) => state.highlights.highlights);

  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentObj, setCurrentObj] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [droppedObj, setDroppedObj] = useState(null);

  useEffect(() => {
    if(percentage && percentage >= 100){
      dispatch(setSyncingCollection(false))
      dispatch(setPercentageData(0))
    }
  },[percentage])

  // let timer = null;

  const setHighlightsInStore = (allHighlights) => {
    if (allHighlights.length > 0) {
      chrome.storage.local.set({
        'allkindleHighlights': {
          highlights: new Array(...allHighlights),
          noData: false
        }
      })
    } else {
      chrome.storage.local.set({
        'allkindleHighlights': {
          highlights: [],
          noData: true
        }
      })
    }
  }


  useEffect(() => {
    dispatch(setActiveHomeTab("search-bookmark"))
    if (!isProcessing && importBookmark.length === 0) {
      setIsProcessing(true);
      dispatch(getAllCollections()).then((res) => {
        setIsProcessing(false);
        let dataArr = res?.payload?.data || []
        // if (res?.payload?.data) {
        //   dataArr = JSON.parse(res?.payload?.data)
        // }
        setShowHeader(dataArr.length === 0);
        session.setBookmarkFetchingStatus("done");
        chrome.storage.local.set({
            collectionData: {
              data: dataArr,
              unfilteredCollectionId: session.unfiltered_collection_id
          },
          })

        //Filter all kindle highlights
        // let allHighlights = []
        // if(dataArr.length !== 0 ){
        //   allHighlights = filterAllKindleHighlightIds(dataArr)
        // }
        // setHighlightsInStore(allHighlights);

        // const shortLinks = getShortLinks(dataArr, []);
        // dispatch(setShortLinks(shortLinks));
        // fetchCurrentTab().then((tab) => {
        //   window.chrome.tabs.sendMessage(tab.id, { id: "CT_SET_SHORT_LINKS", links: shortLinks })
        // })
      });
      dispatch(getSharedCollections())
    }
     }, []);

  useEffect(() => {
    if (!isProcessing && importBookmark.length === 0) {
      const getCall = async () => {
        const res           = await dispatch(getGemsByMediaType('Ai Prompt'))
        const bk            = res?.payload?.data?.data || []
        const shortLinksRes = await dispatch(fetchAllShortLinks())
        const sharedLinks   = await dispatch(fetchAllSharedExpanders())
        if (shortLinksRes?.payload?.data || sharedLinks?.payload?.data) {
          let shortUrls = [ ...bk, ...shortLinksRes?.payload?.data ]
          if (sharedLinks?.payload?.data?.length > 0) {
            shortUrls = [ ...shortUrls, ...sharedLinks?.payload?.data ]
          }
          const newArr  = getShortLinksForAiandText(shortUrls, []);
          dispatch(setShortLinks(newArr));
          fetchCurrentTab().then((tab) => {
            window.chrome.tabs.sendMessage(tab.id, { id: "CT_SET_SHORT_LINKS", links: newArr })
          })
        }

        const res1 = await dispatch(getGemsByMediaType('Highlight'))
        const bk1 = res1?.payload?.data?.data || []
        setHighlightsInStore(bk1)
      }

      getCall()
    }
  },[])
  

  useEffect(() => {
    if (props.refetch === 'refetch-gem'){
      refetchCollections();
    }
  },[props.refetch])

  const refetchCollections = async() => {
    setIsProcessing(true);
    dispatch(setLoadedKeys([]))
    dispatch(setExpandedKeys([]))
    dispatch(getAllCollections()).then((res) => {
      setIsProcessing(false)
      setShowHeader(res.payload?.data?.length === 0)
      session.setBookmarkFetchingStatus("done")
      chrome.storage.local.set({
            collectionData: {
              data: res.payload?.data,
              unfilteredCollectionId: session.unfiltered_collection_id
          },
          })

      //Filter all kindle highlights
      // let allHighlights = []
      // if (res?.payload?.data.length !== 0) {
      //   allHighlights = filterAllKindleHighlightIds(res?.payload?.data)
      // }
      // setHighlightsInStore(allHighlights);
    })
    dispatch(getSharedCollections())
  }

  const fetchHighlights = (tab, obj) => {
    const highlightArr = [...highlights];
    if (highlightArr.length !== 0) {
      const idx = highlightArr.findIndex((o) => {
        return o.id === obj.id;
      });
      if (idx !== -1) {
        highlightArr.splice(idx, 1);
        window.chrome.tabs.sendMessage(tab.id, {
          value: JSON.stringify(highlightArr),
          type: "CT_HIGHLIGHT_DATA",
        });
      }
    }
  };


  const onEditGem = (gem) => {
    dispatch(setCurrentGem(gem));
    dispatch(setCurrentMedia(gem.media));
    navigate(`/bookmark/${gem.gem_id}`);
  };

  const onModalEdit = (data) => {
     navigate(`/collection/${data.id}`)
    // setShowModal(true);
    // setShowEdit(true);
    // setCurrentObj({ ...data });
  };

  const onModalDelete = (data) => {
    setShowModal(true);
    setCurrentObj({ ...data });
  };

  const onCloseModal = () => {
    setShowModal(false);
    setShowEdit(false);
    setCurrentObj(null);
  };

  const onDeleteGem = async () => {
    if (currentObj === null) return;
    const { obj } = currentObj;
    const res = await dispatch(deleteGem(obj?.id, currentObj.parentId));
    if (res.error === undefined && res.payload?.error === undefined) {
      if (obj.media_type === "Highlight" || obj.media_type === "Note") {
        if (tabDetails) {
          fetchHighlights(tabDetails, obj);
        } else {
          fetchCurrentTab().then((res) => {
            fetchHighlights(res, obj);
          });
        }
      }
      dispatch(updateHighlightsArr(obj, "delete"));
      dispatch(removeGemFromCollection(obj?.id, currentObj.parentId));
      messageApi.open({
        type: "success",
        content: "Bookmark deleted successfully!",
      });
      onCloseModal();
      return;
    }
    messageApi.open({
      type: "error",
      content: "An error occurred while delete!",
    });
    onCloseModal();
  };

  // const onSearchChange = (value) => {
  //   setSearchText(value);
  //   if (timer) clearTimeout(timer);
  //   timer = setTimeout(async () => {
  //     await dispatch(searchableData(value));
  //   }, 700);
  // };

  const onDeleteCollection = async () => {
    if (currentObj === null) return;
    const res = await dispatch(deleteCollection(currentObj.id));
    const isSuccess =
      res.error === undefined && res.payload.error === undefined;
    messageApi.open({
      type: isSuccess ? "success" : "error",
      content: isSuccess
        ? "Collection deleted successfully"
        : "An error occured while processing your request",
    });
    onCloseModal();
  };

  const onEditCollection = async (newName) => {
    if (currentObj === null) return;
    let isDuplicateName = false;
    let allCollections = getAllCollectionWithSub([...importBookmark,...sharedCollections])
    allCollections.forEach(col => {
      if (
        col?.name &&
        col.name.toLowerCase() === newName.toLowerCase() &&
        currentObj?.id !== col?.id
      ) {
        isDuplicateName = true
        return false
      }
    })
    if(isDuplicateName){
      messageApi.open({
        type: "error",
        content: `${newName} already exist. Collection name must be unique.`,
      })
      return;
    }else{
      await dispatch(editCollection(currentObj.id, newName))
      onCloseModal();
      dispatch(setLoadedKeys([]))
      dispatch(setExpandedKeys([]))
    }
  };

  const onItemDrop = async (e) => {
    const { dragNode, node } = e;
    let isDragObjSharedCollection = null
    let isDropObjSharedCollection = null
    if (dragNode.key === `Folder-${session.unfiltered_collection_id}`) {
      setDroppedObj(0);
      return null;
    }
    const dragObj = dragNode.title?.props?.obj;
    const dropObj = node.title?.props?.obj;
    const dropProps = node.title?.props;
    const parentId = dragNode.title?.props?.parentId;

    isDragObjSharedCollection = getAllLevelCollectionPermissions(sharedCollections,dragObj?.id)
    isDropObjSharedCollection = getAllLevelCollectionPermissions(sharedCollections,dropObj?.id)

    if(isDragObjSharedCollection && !isDropObjSharedCollection){
      message.error('You cant move shared collection to own')
      dispatch(setLoadedKeys([]))
      dispatch(setExpandedKeys([]))
      return;
    }

    if(isDragObjSharedCollection && isDropObjSharedCollection){
      message.error(`You cant move shared collection to other shared collection`)
      dispatch(setLoadedKeys([]))
      dispatch(setExpandedKeys([]))
      return;
    }

    if(!isDragObjSharedCollection && isDropObjSharedCollection){
          const dragObject = {
              ...dragObj,
              is_sub_collection: true
          }
          const payload = {
            ...dragObj,
            author: isDropObjSharedCollection?.data?.author?.id,
            collection: dropObj?.id
          }
          const res = await  dispatch(moveCollectionShared(Number(dragObj?.id),dropObj?.id,dragObject,'moveOwnToShare'))
          if(res.error === undefined){
            dispatch(updateCollection(dragObj?.id,payload))
            dispatch(setLoadedKeys([]))
            dispatch(setExpandedKeys([]))
          }
          return;
    }

    if(!isDragObjSharedCollection && !isDropObjSharedCollection){
      if (
      node.title?.props?.obj.id.toString() ===
        session.unfiltered_collection_id.toString() &&
      dragNode.title?.props?.obj?.media_type !== "Link"
    ) {
      setDroppedObj(0);
      return null;
    }
    if (dragObj.media !== undefined && dropObj.media !== undefined) {
      messageApi.open({
        type: "error",
        content: "You can't move bookmark into another bookmark",
      });
      dispatch(setLoadedKeys([]))
      dispatch(setExpandedKeys([]))
      return;
    }
    setDroppedObj(dragObj);
    if (parentId && dragObj.folders === undefined) {
      dispatch(
        moveGems(dragObj.id, parentId, dropObj.id, dragObj, dropObj)
      );
      dispatch(getAllCollections())
      dispatch(getSharedCollections())
      dispatch(setLoadedKeys([]))
      dispatch(setExpandedKeys([]))
    } else {
      if (
        dropObj.folders === undefined &&
        dragNode.title?.props?.obj?.media_type !== "Link"
      ) {
        dispatch(
          moveCollection(
            dragObj.id,
            dropProps.parent.id,
            dragObj,
            dropProps.parent
          )
        );
        dispatch(setLoadedKeys([]))
        dispatch(setExpandedKeys([]))
      } else if (dragNode.title?.props?.obj?.media_type !== "Link") {
        dispatch(
          moveCollection(dragObj.id, dropObj.id, dragObj, dropObj)
        );
        dispatch(setLoadedKeys([]))
        dispatch(setExpandedKeys([]))
      }
    }
    }
  };

  const onItemLeave = async (e) => {
    const { node } = e;
    // const dropObj = node.title?.props?.obj;
    const collection_id = node.key.substring(7);
    if (collection_id === session.unfiltered_collection_id) {
      return null;
    }
    // if (
    //   (droppedObj && dropObj.id !== droppedObj.id && droppedObj !== 0) ||
    //   droppedObj === null
    // ) {
    //   if (dropObj.folders !== undefined) {
    //     await dispatch(moveToRoot(dropObj.id, dropObj));
    //   }
    // }
  };

  const onInputFocus = async () => {
    const tabs = await window.chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length !== 0) {
      window.chrome.tabs.sendMessage(tabs[0].id, {
        type: "SHOW_OMNISEARCH",
        value: true,
      });
    }
    inputRef.current.blur();
  };
  const handleAddBookmark = async () => {
    // await getRecentURLDetails()
    await fetchCurrentTab().then(res => {
      if (res?.url.includes("https://www.youtube.com/watch") || res?.url.startsWith("https://vimeo.com/")){
        navigate("/video-panel")
      }
      else if (res?.url.startsWith("https://www.amazon.in/") || res?.url.startsWith("https://www.amazon.com/") || res?.url.startsWith("https://www.amazon.co.uk/") || res?.url.startsWith("https://www.amazon.co.in/")){
        navigate("/product")
      }
      else if(res?.url.startsWith("https://www.imdb.com/")){
        const type = classifyIMDbURL(res?.url)
        if(type === 'Profile'){
            navigate("/profile-gem?imdb=true")
        }else if(type === 'Movie'){
            navigate('/movie')
        }else {
            navigate("/add-bookmark")
        }
      }
      else {
        openProperPage()
      }
      // else{
      //   navigate("/add-bookmark")
      // }
    })
  }

  const onCancellingSync = async() => {
    dispatch(setIsSyncing(false))
  }

  const cbs = {
    onModalEdit,
    onModalDelete,
    onEditGem,
    onDeleteGem,
  };
  const data =
    searchText.length === 0
      ? processNestedBookmarks([...importBookmark,...sharedCollections], cbs,sharedCollections)
      // ? processNestedBookmarks(importBookmark, cbs)
      : searchData(searchAllData, cbs);
  return (
    <>
      {contextHolder}
      {/* <CommonLayout mainClassName='ct-relative bg-[#F8FBFF] h-full overflow-y-auto scroll-smooth dark:bg-[#292B38] flex flex-col h-full'
                          showBarIcon={true}
                          showFooter={true}
                          isHideHeader={true}
                          showSubmitBtn={false}
                          footerClassName={showModal ? "footer-active border-t-[1px] py-3 px-4 bg-white z-50 fixed-position" : "border-t-[1px] py-3 px-4 bg-white z-50 fixed-position"}> */}
      {
        fullLoaderScreen && <div className="spin-overlay h-full w-full">
            <Spin tip={'Fetching data..'} />
        </div>
        }
      <div
        className={
          showModal === true
            ? "footer-position py-3 px-4 pb-0 flex-1 ct-relative"
            : "py-3 px-4 pb-0 flex-1 ct-relative"
        }
      >
        
        {isSyncing && 
          <div className="flex flex-col">
            <ImportProgressBar />
            {!totals?.totalBookmarks && !totals?.totalFolders && <button className="text-[red] w-[fit-content]" onClick={onCancellingSync}>
              Stop
            </button>}
          </div>
        }
        {!isSyncing && <div className="flex justify-end items-center gap-3 font-semibold">
          <div className="flex justify-center items-center">
            <button
              className="text-[#347AE2]"
              onClick={handleAddBookmark}
              disabled={isSyncing}
            >
              + Add bookmark
            </button>
          </div>
          <button
            className="cursor-pointer"
            onClick={refetchCollections}
            disabled={isProcessing}
          >
            {isProcessing ?  <Spin size='small'/> : <IoMdRefresh className="w-5 h-5 text-gray-700 hover:text-[#347AE2]" />}
          </button>
        </div>}
        {/* <div className='fixed search-header z-10'>
                            <div className='flex justify-between items-center gap-2'>
                                <div className='flex-1 ct-relative'>
                                    <InputWithIconOther inputRef={inputRef} onChange={onSearchChange} onFocusInput={onInputFocus} type="text" placeholder="Search bookmark" name="search-bookmark" showRightIcon={true} />
                                </div>
                                <div className='flex justify-end items-center gap-[1px]'>
                                    <Tooltip title="Save bookmark">
                                        <button className='h-[40px] bg-[#347AE2] text-white rounded-l-lg flex justify-center items-center gap-1 px-2'>
                                            <button className='h-[40px] w-[40px] bg-[#347AE2] rounded-lg flex justify-center items-center' onClick={() => navigate('/add-bookmark')}>
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
                        </div> */}
        {isProcessing && <LoadingScreen showSpin={isProcessing} />}
        {(importBookmark.length === 0 || showHeader === true) &&
          !isProcessing && (
            <div className="text-center py-10 mt-10">
              <div className="ct-relative mt-2">
                <img
                  className="h-50 w-50 my-0 mx-auto"
                  src="/icons/upload-error.svg"
                  alt="Cloud ellipse icons"
                />
                <div className="absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400">
                  No data! Please add bookmark
                </div>
              </div>
            </div>
          )}

        <div
          className={
            importBookmark.length !== 0 ? "main-box py-2 h-full" : "d-none"
          }
        >
          <FolderList
            searchText={searchText}
            list={data}
            onDrop={onItemDrop}
            onDragLeave={onItemLeave}
            callbacks={cbs}
            sharedCollections={sharedCollections}
          />
        </div>

        <div className={showModal ? "pop-box" : ""}>
          <div className={showModal === true ? "popup-delete-model" : ""}>
            {showModal && (
              <div className="border-t-[1px]">
                <Modal
                  showOpen={showModal}
                  deleteCollections={
                    currentObj &&
                    currentObj.obj &&
                    currentObj.obj.media !== undefined
                      ? onDeleteGem
                      : onDeleteCollection
                  }
                  edit={showEdit}
                  cancel={onCloseModal}
                  collectionName={
                    currentObj && currentObj.name
                      ? currentObj.name
                      : currentObj?.obj && currentObj?.obj?.title
                      ? currentObj.obj.title
                      : ""
                  }
                  editCollections={onEditCollection}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* </CommonLayout> */}
    </>
  )
};

export default Gems;