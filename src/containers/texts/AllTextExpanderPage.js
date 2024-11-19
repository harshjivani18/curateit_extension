import React, { useEffect, useState }       from "react"
import { useSelector, useDispatch }         from "react-redux"
import { useNavigate }                      from "react-router-dom"
import { message }                          from "antd"

import TextExpander                         from "./TextExpander"
// import Modal from "../../components/modal/Modal"
import LoadingScreen                        from "../../components/Loadingscreen/Loadingscreen"
import { getShortLinksForAiandText }                    from "../../utils/find-collection-id"
import { getGemsByMediaType } from "../../actions/collection"
// import FolderList from "../../components/folderList/FolderList"
// import { processNestedBookmarks } from "../../utils/process-nested-bookmarks"
// import session from "../../utils/session"
// import { fetchCurrentTab } from "../../utils/fetch-current-tab"

// import {
//   deleteCollection,
//   removeGemFromCollection,
//   editCollection,
//   getAllCollections,
// } from "../../actions/collection"
// import { deleteGem, setCurrentGem, setCurrentMedia } from "../../actions/gem"
// import { updateHighlightsArr } from "../../actions/highlights"
// import { getAllCollectionWithSub } from "../../utils/find-collection-id"

const AllTextExpanderPage = () => {
    const dispatch                 = useDispatch()
    const navigate                 = useNavigate()
    
    // const [messageApi, 
    //         contextHolder]         = message.useMessage()
    const collectionData           = useSelector((state) => state.collection.collectionData)
    
    const [showModal, 
           setShowModal]           = useState(false)
    const [isProcessing, 
           setIsProcessing]        = useState(false)
    const [showHeader, 
           setShowHeader]          = useState(false)
    const [expanders,
           setExpanders]           = useState([])
    // const [currentObj, 
    //         setCurrentObj]         = useState(null)
    // const [showEdit, setShowEdit] = useState(false)
    // const [bookmarks, 
    //         setBookmarks]          = useState([])

    useEffect(() => {
        const getCall = async () => {
          const res = await dispatch(getGemsByMediaType('Ai Prompt'))
          const bk = res?.payload?.data?.data || []
          const shortLinks = getShortLinksForAiandText(bk, []);
          setExpanders(shortLinks)
      }

      getCall()
    }, [dispatch])
    // useEffect(() => {
    //     if (collectionData) {
    //         const shortLinks = dispatch(getShortLinks(collectionData, []))
    //         setExpanders(shortLinks)
    //     }
    // }, [collectionData, dispatch])

  return (
    <>
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
              onClick={() => navigate("/text")}
            >
              + Save text expander
            </button>
          </div>
        </div>
        {isProcessing && <LoadingScreen showSpin={isProcessing} />}
        {(expanders.length === 0 || showHeader === true) && !isProcessing && (
          <div className="text-center py-10 mt-10">
            <div className="ct-relative mt-2">
              <img
                className="h-50 w-50 my-0 mx-auto"
                src="/icons/upload-error.svg"
                alt="Cloud ellipse icons"
              />
              <div className="absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400">
                No data! Please add Short Links or Text Expander.
              </div>
            </div>
          </div>
        )}

        <div
          className={expanders.length !== 0 ? "main-box py-2 h-full" : "d-none"}
        >
          {expanders.map((expander, index) => {
            return (
                <TextExpander obj={expander}  />
            )
          })}
        </div>

        {/* <div className={showModal ? "pop-box" : ""}>
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
        </div> */}
      </div>
    </>
  )
}

export default AllTextExpanderPage
