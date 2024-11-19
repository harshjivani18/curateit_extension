/*global chrome*/
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { deleteAccount } from "../../actions/user"
import { deleteAllCollections, resetCollectionData } from "../../actions/collection"
import { fetchCurrentTab } from "../../utils/fetch-current-tab"
import { sendEnableFloatCodeMenuToChrome, sendEnableFloatImageMenuToChrome, sendEnableFloatMenuToChrome, sendSidebarPositionToChrome, sendSidebarViewType, sendThemeToChrome } from "../../utils/send-theme-to-chrome"
import LayoutCommon from "../../components/commonLayout/LayoutCommon"
import BackHeader from "../../components/backHeader/BackHeader"
import AccountDisplay from "../../components/accountDisplay/AccountDisplay"
import AccountType from "../../components/accountType/AccountType"
import DisplaySetting from "../../components/displaySetting/DisplaySetting"
import DataShortcuts from "../../components/dataShortcuts/DataShortcuts"
import OtherSetting from "../../components/otherSetting/OtherSetting"
import Modal from "../../components/modal/Modal"
import Loadingscreen from "../../components/Loadingscreen/Loadingscreen"
import { deleteAllGems } from "../../actions/gems"
import { message } from "antd"
import BlockDomainComponent from "../../components/common/BlockDomainComponent"
import ButtonToggleSetting from "../../components/displaySetting/ButtonToggleSetting"

export const SettingPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const tabDetails = useSelector((state) => state.app.tab)
  const [showModal, setShowModal] = useState(false)
  const [modelMessage, setModalMessage] = useState("")
  const [deleteType, setDeleteType] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDeleteAccount = () => {
    setDeleteType("account")
    setModalMessage("Are you sure you want to delete your account?")
    setShowModal(true)
  }

  const handleDeleteCollections = () => {
    setDeleteType("collections")
    setModalMessage("Are you sure you want to delete all collections?")
    setShowModal(true)
  }

  const handleDeleteGems = () => {
    setDeleteType("gems")
    setModalMessage("Are you sure you want to delete all gems?")
    setShowModal(true)
  }

  const onModalDelete = () => {
    if (deleteType === "account") {
      deleteUerAccount();
    }else if(deleteType === "gems"){
      deleteAllGemsRequest();
    }else if(deleteType === "collections"){
       deleteAllCollectionsRequest()
    }else {
      onCloseModal(); 
    }
  }

  const onCloseModal = () => {
    setDeleteType("")
    setModalMessage("")
    setShowModal(false)
  }

  const logout = async () => {
    const tab = tabDetails || (await fetchCurrentTab())
    localStorage.removeItem("CT_HIGHLIGHT_DATA")
    localStorage.removeItem("bookmarkFetchingStatus")
    localStorage.removeItem("show_spinner")
    localStorage.removeItem("collectionData")
    localStorage.removeItem("userId")
    localStorage.removeItem("DATA")
    localStorage.removeItem("CT_THEME")
    localStorage.removeItem("token")
    localStorage.removeItem("socialTrue")
    localStorage.removeItem("sidebarPosition")
    localStorage.removeItem("enableFloatMenu")
    localStorage.removeItem("sidebarOrder")
    localStorage.removeItem("unfiltered_collection_id")
    localStorage.removeItem("mode")
    localStorage.removeItem("username")
    localStorage.removeItem("color-theme")
    dispatch(resetCollectionData())
    sendThemeToChrome(false, "Logout", tab)
    sendSidebarPositionToChrome("right", tab)
    sendEnableFloatImageMenuToChrome(true, tab)
    sendEnableFloatCodeMenuToChrome(true, tab)
    sendSidebarViewType('right', tab)
    sendEnableFloatMenuToChrome(true, tab)
    chrome.storage.sync.set({
      curateitBookmarks: [],
      expires: "",
    })
    chrome.storage.sync.set({
      userData: {
        token: "",
        userId: "",
        unfilteredCollectionId: "",
        apiUrl: "",
        webappURL: ""
      },
    })
    window.chrome.tabs.sendMessage(tab.id, {
      value: JSON.stringify([]),
      type: "CT_HIGHLIGHT_DATA",
    })
    chrome.storage.sync.remove(["CT_SHORT_LINKS"])
    //Remove COOKIES FOR WEB APP
    chrome.cookies.remove({
      url: process.env.REACT_APP_WEBAPP_URL,
      name: 'curateittoken',
    })
    window.chrome.tabs.sendMessage(tab.id, { type: "LOGOUT_EXPAND_IFRAME" })
    navigate("/login")
  }

  const deleteUerAccount = () => {
    setIsProcessing(true)
    dispatch(deleteAccount()).then((res) => {
      if (res?.payload?.status === 200) {
        setIsProcessing(false)
        logout()
      }else{
        setIsProcessing(false);
         message.error("An error occurred while deleting. Please try again!")
         navigate("/search-bookmark")
      }
    })
  }

  const deleteAllGemsRequest = () => {
    setIsProcessing(true)
    dispatch(deleteAllGems()).then(res => {
      if (res?.payload?.status === 200) {
        setIsProcessing(false)
        dispatch(resetCollectionData())
        navigate('/search-bookmark');
      }else{
        setIsProcessing(false)
        message.error(
          "An error occurred while deleting. Please try again!"
        )
        navigate("/search-bookmark")
      }
    })
  }

  const deleteAllCollectionsRequest = () => {
    setIsProcessing(true)
    dispatch(deleteAllCollections()).then(res => {
      if (res?.payload?.status === 200) {
        setIsProcessing(false)
        dispatch(resetCollectionData())
        navigate('/search-bookmark');
      }else{
        setIsProcessing(false)
        message.error(
          "An error occurred while deleting your. Please try again!"
        )
        navigate("/search-bookmark")
      }
    })
  }

  return (
    <LayoutCommon>
      {isProcessing && (
        <div className="h-full w-full absolute z-50 flex justify-center items-center bg-[rgba(255,255,255,0.8)]">
          <Loadingscreen showSpin={isProcessing} />
        </div>
      )}
      <BackHeader />
      <div className="p-4 text-[#062046]">
        <AccountDisplay />
        <AccountType />
        <DisplaySetting />
        <DataShortcuts
          deleteCollections={handleDeleteCollections}
          deleteGems={handleDeleteGems}
        />
        <BlockDomainComponent/>
        <OtherSetting handleDeleteAccount={handleDeleteAccount} />
      </div>
      <div className={showModal ? "pop-box2 pr-5" : ""}>
        <div className={showModal === true ? "popup-delete-model" : ""}>
          {showModal && (
            <div className="border-t-[1px]">
              <Modal
                showOpen={showModal}
                edit={false}
                cancel={onCloseModal}
                message={modelMessage}
                deleteCollections={onModalDelete}
              />
            </div>
          )}
        </div>
      </div>
    </LayoutCommon>
  )
}
