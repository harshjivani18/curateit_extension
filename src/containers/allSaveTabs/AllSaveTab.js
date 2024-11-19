import "./AllSaveTab.css"
import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Collapse, Spin, message } from "antd"

import Modal from "../../components/modal/Modal"
import LoadingScreen from "../../components/Loadingscreen/Loadingscreen"
import { fetchCurrentTab } from "../../utils/fetch-current-tab"

import {
  deleteCollection,
  removeGemFromCollection,
  editCollection,
  getSavedTabsCollections,
} from "../../actions/collection"
import { deleteGem, setCurrentGem, setCurrentMedia } from "../../actions/gem"
import { updateHighlightsArr } from "../../actions/highlights"
import { getAllCollectionWithSub } from "../../utils/find-collection-id"
import { processNewNestedTabs } from "../../utils/process-nested-tabs"
import FolderTabs from "../../components/folderList/FolderTabs"
import { getAllWindows } from "../../utils/message-operations"
import ActiveTabList from "../../components/folderList/ActiveTabList"

const { Panel } = Collapse

const AllSaveTab = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [messageApi, contextHolder] = message.useMessage()
  const importBookmark = useSelector((state) => state.collection.collectionData)
  const tabDetails = useSelector((state) => state.app.tab)
  const highlights = useSelector((state) => state.highlights.highlights)
  
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentObj, setCurrentObj] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [collections, setCollections] = useState([])
  const [allWindowsTabs, setAllWindowsTabs] = useState([])
  const [isFetchingWindows, setIsFetchingWindows] = useState(false)

  useEffect(() => {
    const getAllActiveWindowsDetails = async () => {
      setIsFetchingWindows(true)
      const res = await getAllWindows()
      setIsFetchingWindows(false)
      setAllWindowsTabs(res || [])
    }
    getAllActiveWindowsDetails()
  }, [])

  useEffect(() => {
    const getCall = async () => {
      setIsProcessing(true)
      const res = await dispatch(getSavedTabsCollections())
      setCollections(res?.payload?.data?.data || [])
      setIsProcessing(false)
    }
    getCall()
  },[dispatch])

  const fetchHighlights = (tab, obj) => {
    const highlightArr = [...highlights]
    if (highlightArr.length !== 0) {
      const idx = highlightArr.findIndex((o) => {
        return o.id === obj.id
      })
      if (idx !== -1) {
        highlightArr.splice(idx, 1)
        window.chrome.tabs.sendMessage(tab.id, {
          value: JSON.stringify(highlightArr),
          type: "CT_HIGHLIGHT_DATA",
        })
      }
    }
  }

  const onDeleteCollection = async () => {
    if (currentObj === null) return
    const res = await dispatch(deleteCollection(currentObj.id))
    const isSuccess = res.error === undefined && res.payload.error === undefined
    messageApi.open({
      type: isSuccess ? "success" : "error",
      content: isSuccess
        ? "Collection deleted successfully"
        : "An error occured while processing your request",
    })
    onCloseModal()
  }

  const onEditCollection = async (newName) => {
     if (currentObj === null) return
     let isDuplicateName = false
     let allCollections = getAllCollectionWithSub(importBookmark)
     allCollections.forEach((col) => {
       if (
         col?.name &&
         col.name.toLowerCase() === newName.toLowerCase() &&
         currentObj?.id !== col?.id
       ) {
         isDuplicateName = true
         return false
       }
     })
     if (isDuplicateName) {
       messageApi.open({
         type: "error",
         content: `${newName} already exist. Collection name must be unique.`,
       })
       return
     } else {
       await dispatch(editCollection(currentObj.id, newName))
       const changed = collections.map(item => {
        if(item.id ===  currentObj.id){
          return {
            ...item,
            name: newName
          }
        }
        return item
       })
       setCollections(changed)
       onCloseModal()
     }
  }

  const onEditGem = (gem) => {
    dispatch(setCurrentGem(gem))
    dispatch(setCurrentMedia(gem.media))
    navigate(`/bookmark/${gem.gem_id}`)
  }

  const onDeleteGem = async () => {
    if (currentObj === null) return
    const { obj } = currentObj
    const res = await dispatch(deleteGem(obj?.id, currentObj.parentId))
    if (res.error === undefined && res.payload?.error === undefined) {
      if (obj.media_type === "Highlight" || obj.media_type === "Note") {
        if (tabDetails) {
          fetchHighlights(tabDetails, obj)
        } else {
          fetchCurrentTab().then((res) => {
            fetchHighlights(res, obj)
          })
        }
      }
      dispatch(updateHighlightsArr(obj, "delete"))
      dispatch(removeGemFromCollection(obj?.id, currentObj.parentId))
      messageApi.open({
        type: "success",
        content: "Bookmark deleted successfully!",
      })
      onCloseModal()
      return
    }
    messageApi.open({
      type: "error",
      content: "An error occurred while delete!",
    })
    onCloseModal()
  }

  const onModalEdit = (data) => {
    navigate(`/collection/${data.id}`)
    // setShowModal(true)
    // setShowEdit(true)
    // setCurrentObj({ ...data })
  }

  const onModalDelete = (data) => {
    setShowModal(true)
    setCurrentObj({ ...data })
  }

  const onCloseModal = () => {
    setShowModal(false)
    setShowEdit(false)
    setCurrentObj(null)
  }

  const onUpdateTab = async () => {
    setIsFetchingWindows(true)
    const res = await getAllWindows()
    setIsFetchingWindows(false)
    setAllWindowsTabs(res || [])
  }

  const cbs = {
    onModalEdit,
    onModalDelete,
    onEditGem,
    onDeleteGem,
  }

  const data = processNewNestedTabs(collections, cbs)

  const renderAllCurrentTabs = () => {
    if (isFetchingWindows) return <Spin />
    return allWindowsTabs.map((window, idx) => {
      return <ActiveTabList key={idx} 
                            tabs={window.tabs} 
                            windowName={`Tab Session ${idx + 1}`} 
                            isActiveWindow={window.focused} 
                            windowId={window.id}
                            onUpdateTab={onUpdateTab} />
    })
  }

  const renderAllPreviousTabs = () => {
    if (collections.length === 0 && !isProcessing) {
      return (
        <div className="text-center py-10 mt-10">
          <div className="ct-relative mt-2">
            <img
              className="h-50 w-50 my-0 mx-auto"
              src="/icons/upload-error.svg"
              alt="Cloud ellipse icons"
            />
            <div className="absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400">
              No data! Please add bookmarks using save tab.
            </div>
          </div>
        </div>
      )
    }
    return <div
      className={collections.length !== 0 ? "main-box h-full" : "d-none"}
    >
      <FolderTabs
        list={data}
        callbacks={cbs}
      />
    </div>
  }

  const renderPanelHeader = (title) => {
    return (
      <div className="flex justify-between items-center">
        <div className="text-md font-semibold">{title}</div>
      </div>
    )
  }

  const renderTabs = () => {
    return (
      <Collapse defaultActiveKey={['1']} ghost expandIconPosition="right" className="mt-2 p-0">
        <Panel header={renderPanelHeader("Current Tabs")} key="1" className="ct-tab-panel-header">
          {renderAllCurrentTabs()}
        </Panel>
        <Panel header={renderPanelHeader("Previous Tabs")} key="2" className="ct-tab-panel-header">
          {renderAllPreviousTabs()}
        </Panel>
      </Collapse>
    )
  }

  return (
    <>
      {contextHolder}
      <div
        className={
          showModal === true
            ? "footer-position py-3 px-4 pb-0 flex-1 ct-relative"
            : "py-3 px-4 pb-0 flex-1 ct-relative"
        }
      >
        <div className="flex justify-end items-center font-semibold">
          <div>
            <button
              className="text-[#347AE2]"
              onClick={() => navigate("/save-tabs")}
            >
              + Save tabs
            </button>
          </div>
        </div>
        {isProcessing 
          ? <LoadingScreen showSpin={isProcessing} />
          : renderTabs()
        }

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
    </>
  )
}

export default AllSaveTab
