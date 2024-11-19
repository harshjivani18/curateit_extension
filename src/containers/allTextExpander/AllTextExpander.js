import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { message } from "antd"

import Modal from "../../components/modal/Modal"
import LoadingScreen from "../../components/Loadingscreen/Loadingscreen"
import { fetchCurrentTab } from "../../utils/fetch-current-tab"

import {
    deleteCollection,
    removeGemFromCollection,
    editCollection,
    getGemsByMediaType,
    configCollections,
} from "../../actions/collection"
import { deleteGem, setCurrentGem, setCurrentMedia } from "../../actions/gem"
import { updateHighlightsArr } from "../../actions/highlights"
import { getAllCollectionWithSub } from "../../utils/find-collection-id"
import Bookmark from "../../components/folderList/Bookmark"

const AllTextExpander = () => {
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
    const [bookmarks, setBookmarks] = useState([])

    useEffect(() => {
        const getCall = async () => {
          setIsProcessing(true)
          const res = await dispatch(getGemsByMediaType('Ai Prompt'))
          const bk = res?.payload?.data?.data || []
          setBookmarks(bk)
          setIsProcessing(false)
      }

      getCall()
    }, [dispatch])

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
            onCloseModal()
        }
    }

    const onEditGem = (gem) => {
        dispatch(setCurrentGem(gem))
        dispatch(setCurrentMedia(gem.media))
        navigate(`/text`)
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
                content: "Text expander deleted successfully!",
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
        setShowModal(true)
        setShowEdit(true)
        setCurrentObj({ ...data })
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

    const cbs = {
        onModalEdit,
        onModalDelete,
        onEditGem,
        onDeleteGem,
    }


    const onAiPromptLibraryClick = async () => {
        dispatch(configCollections())
            .then((data) => {
                const aiLibraryId = data?.payload?.data?.data?.aiPromptLibraryId
                const username = data?.payload?.data?.data?.username
                const tab = tabDetails || fetchCurrentTab()
                window.chrome.tabs.sendMessage(tab.id, {
                    tabURLs: [`${process.env.REACT_APP_WEBAPP_URL}/u/${username}/c/${aiLibraryId}/ai-prompt-library`],
                    id: "CT_OPEN_WINDOW"
                })
            })
    }

    const onTextExpanderClick = async () => {
        dispatch(configCollections())
            .then((data) => {
                const textExpanderId = data?.payload?.data?.data?.textExpanderId
                const username = data?.payload?.data?.data?.username
                const tab = tabDetails || fetchCurrentTab()
                window.chrome.tabs.sendMessage(tab.id, {
                    tabURLs: [`${process.env.REACT_APP_WEBAPP_URL}/u/${username}/c/${textExpanderId}/text-expander-library`],
                    id: "CT_OPEN_WINDOW"
                })
            })
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
                <div className="mr-1">
                        <button
                            className="text-[#347AE2]"
                            // onClick={() => navigate("/ai-prompt")}
                            onClick={onAiPromptLibraryClick}
                        >
                            + Ai Templates
                        </button>
                    </div>
                    <div className="mr-1">
                        <button
                            className="text-[#347AE2]"
                            // onClick={() => navigate("/ai-prompt")}
                            onClick={onTextExpanderClick}
                        >
                            + Expander Templates
                        </button>
                    </div>
                    <div className="mr-1">
                        <button
                            className="text-[#347AE2]"
                            onClick={() => navigate("/ai-prompt")}
                        >
                            + Add Ai Prompt
                        </button>
                    </div>
                    <div>
                        <button
                            className="text-[#347AE2]"
                            onClick={() => navigate("/text")}
                        >
                            + Add Text Expander
                        </button>
                    </div>
                </div>
                {isProcessing && <LoadingScreen showSpin={isProcessing} />}
                {(bookmarks.length === 0) && !isProcessing && (
                    <div className="text-center py-10 mt-10">
                        <div className="ct-relative mt-2">
                            <img
                                className="h-50 w-50 my-0 mx-auto"
                                src="/icons/upload-error.svg"
                                alt="Cloud ellipse icons"
                            />
                            <div className="absolute top-[85px] left-0 justify-center w-full text-xs text-gray-400">
                                No data! Please add text expander.
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className={bookmarks.length !== 0 ? "main-box py-2 h-full my-2" : "d-none"}
                >
                    {/* <FolderList
                        list={data}
                        draggable={false}
                    /> */}
                    {bookmarks.map((article) => (
                    <Bookmark
                        key={article?.id}
                        obj={article}
                        parent={article?.collection_gems}
                        editGem={onEditGem}
                        />
                    ))}
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
        </>
    )
}

export default AllTextExpander
