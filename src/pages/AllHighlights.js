/*global chrome*/
import React, { useEffect, useState } from 'react'
import Header from '../components/header/Header';
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { addHighlight, deleteHighlight, getAllHighlights } from '../actions/highlights';
import Loadingscreen from '../components/Loadingscreen/Loadingscreen'
import { message, Spin } from 'antd';
import {  PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom';
import { getActiveTabURL } from '../utils/send-theme-to-chrome';
import { MdOutlineOpenInNew } from 'react-icons/md';
import { fetchCurrentTab } from '../utils/fetch-current-tab';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const AllHighlights = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const pageHighlights       = useSelector((state) => state.highlights.highlights);
  const tabDetails      = useSelector((state) => state.app.tab)
  const [showModal,setShowModal] = useState(false)

  const [loading,setLoading] = useState(false)
  const [highlightDetail,setHighlightDetail] = useState('')
  const [deleteLoading,setDeleteLoading] = useState(false)

  useEffect(() => {
    const getCall = async () => {
        setLoading(true)
        const tabObj       = tabDetails || await fetchCurrentTab()
        if (tabObj) {
            const response = await dispatch(getAllHighlights(tabObj.url))
            if(response){
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    }

    getCall()
  },[])

  const navigateToEdit = (highlight) => {
    const highlightId= highlight._id
    const gemId = pageHighlights[0].id
    const collectionId = highlight.collections

    // :collectionId/:gemId/:highlightId
    navigate(`/highlight/${collectionId}/${gemId}/${highlightId}`)
  }

  const openDeleteModal = (highlight) => {
    setHighlightDetail(highlight)
    setShowModal(true)
  }

  const hideDeleteModal = () => {
    setShowModal(false)
    setHighlightDetail('')
  }

  const handleDeleteHighlight = async () => {
    const tabs = await getActiveTabURL()
    const gemId = pageHighlights[0].id 
    const collectionId = highlightDetail && highlightDetail.collections
    const details_id = highlightDetail && highlightDetail.details.id
    const highlightId = highlightDetail && highlightDetail._id

    setDeleteLoading(true)
    const res = await dispatch(deleteHighlight(collectionId,gemId,highlightId))

    if(res.error === undefined){
      const response = await dispatch(getAllHighlights(tabs.url))
      if(response.error === undefined){
        const highlightData = response.payload.data
        window.chrome.tabs.sendMessage(tabs.id, { value: {
          details_id,
          highlightData
        }, type: "CT_HIGHLIGHT_DATA_DELETE" })
      }

      setShowModal(false)
      setDeleteLoading(false)
      message.success('Highlight deleted successfully');
      chrome.storage.sync.set({
        'siteData': {urlFromSite: '',tabIdFromSite: ''},
        'highlightedData': {text: '', box: {}, details: null, styleClassName: "" }
      })
    }else{
      setShowModal(false)
      setDeleteLoading(false)
      message.error('Error Occurred');
      chrome.storage.sync.set({
        'siteData': {urlFromSite: '',tabIdFromSite: ''},
        'highlightedData': {text: '', box: {}, details: null, styleClassName: "" }
      })
    }
  }

  const handleScrollToView = async (highlight) => {

    const tabs = await getActiveTabURL()

    window.chrome.tabs.sendMessage(tabs.id, { value: highlight, type: "CT_SCROLL_TO_VIEW" })
  }

  return (
    <>
      {
        loading ?  
        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
            <Spin size='middle' tip='Loading...'/>
        </div>
         : 

        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px]' style={{height:'450px',overflow:'auto'}}>
        {
            (pageHighlights && pageHighlights[0]?.media && pageHighlights[0]?.media?.length>0) ? pageHighlights[0].media.map((highlight,i) => {
              return(
                 <>
              <div className="mx-auto w-full" key={i}>
                <div className='group ct-relative'>

                  <div className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">

                    <div className='flex justify-start items-center gap-1'>
                        <div className='highlightItem'>
                          <div className='highlight-text-div' style={{"--highlight-text-color": `${highlight?.color?.colorCode || highlight?.color}`}}>
                              {highlight?.text}
                          </div>
                      </div>
                    </div>

                  </div>

                  <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100' style={{top:'-10px'}}>
                    <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 mx-3 cursor-pointer' 
                    onClick={() => handleScrollToView(highlight)} 
                    />
                      <button className='edit-btn' 
                      onClick={() => navigateToEdit(highlight)}
                      >
                        <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                      </button>
                      <button 
                      onClick={() => openDeleteModal(highlight)}
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
                    Select text on a web-page and right click Save highlight from context menu.
                </p>
            </>
        }

        <div className={showModal === true ? "pop-box p-fixed" : ""}>
          <div className={showModal === true ? "popup-delete-model" : ""}>
            {
              showModal && <div className='popup-delete'>
                <h1 className='content-h'>Confirm delete?</h1>
                  <div className='btnn-pop'>
                    <button className='yes-btn' onClick={() => handleDeleteHighlight()} disabled={deleteLoading}>{deleteLoading ? 'Deleting..' : 'Yes'}</button>
                    <button className='no-btn' onClick={() => hideDeleteModal()} disabled={deleteLoading}>No</button>
                    </div>
                  </div>
                  }
          </div>
        </div>
      </div>
      }
    </>
  )
}

export default AllHighlights