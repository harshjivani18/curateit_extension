/*global chrome*/
import React, { useEffect, useState } from 'react'
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { message, Spin } from 'antd';
import {  PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getActiveTabURL } from '../utils/send-theme-to-chrome';
import { MdOutlineOpenInNew } from 'react-icons/md';
import { deleteCode, getAllCodes } from '../actions/code';
import { useSelector } from 'react-redux';
import { fetchCurrentTab } from '../utils/fetch-current-tab';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const AllCodes = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const pageCodes       = useSelector((state) => state.codes.codes);
    const tabDetails      = useSelector((state) => state.app.tab)
    const [showModal,setShowModal] = useState(false)

    const [loading,setLoading] = useState(false)
    const [codeDetail,setCodeDetail] = useState('')
    const [deleteLoading,setDeleteLoading] = useState(false)

    useEffect(() => {
    const getCall = async () => {
        setLoading(true)
        const tabObj        = tabDetails || await fetchCurrentTab()
        if (tabObj) {
            const response = await dispatch(getAllCodes(tabObj.url))
            if(response){
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    }

    getCall()
  },[])

  const navigateToEdit = (code) => {
    const gemId = pageCodes[0].id
    const codeId = code._id
    const collectionId = code.collections

    navigate(`/code/${collectionId}/${gemId}/${codeId}`)
  }

  const openDeleteModal = (code) => {
    setCodeDetail(code)
    setShowModal(true)
  }

  const hideDeleteModal = () => {
    setShowModal(false)
    setCodeDetail('')
  }

  const handleDeleteCode = async () => {
    const tabs = await getActiveTabURL()
    const url = tabs.url.endsWith('/') ? tabs.url.slice(0, -1) : tabs.url
    const gemId = pageCodes[0]?.id
    const collectionId = codeDetail && codeDetail.collections
    const codeId = codeDetail && codeDetail._id

    setDeleteLoading(true)
    const res = await dispatch(deleteCode(collectionId,gemId,codeId))

    if(res.error === undefined){
      await dispatch(getAllCodes(url))

      setShowModal(false)
      setDeleteLoading(false)
      message.success('Code deleted successfully');
    }else{
      setShowModal(false)
      setDeleteLoading(false)
      message.error('Error Occurred');
    }
  }

  const handleScrollToView = async (code) => {
    // const boxDetails= highlight.media[0].box

    // const tabs = await getActiveTabURL()

    // window.chrome.tabs.sendMessage(tabs.id, { value: boxDetails, type: "SCROLL_TO_VIEW" })
  }

    return(
        <>
      {
        loading ?  
        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
            <Spin size='middle' tip='Loading...'/>
        </div>
         : 

        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px]' style={{height:'450px',overflow:'auto'}}>
        {
            (pageCodes && pageCodes[0]?.media && pageCodes[0]?.media.length>0) ? pageCodes[0].media.map((code,i) => {
              return(
                 <>
              <div className="mx-auto w-full" key={i}>
                <div className='group ct-relative'>

                  <div className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">

                    <div className='flex justify-start items-center gap-1'>
                        <div className='highlightItem'>
                          <div>
                              {code.title}
                          </div>
                      </div>
                    </div>

                  </div>

                  <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100' style={{top:'-10px'}}>
                      <button className='edit-btn' 
                      onClick={() => navigateToEdit(code)}
                      >
                        <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                      </button>
                      <button 
                      onClick={() => openDeleteModal(code)}
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
                    No code snippet saved.
                </p>
            </>
        }

        <div className={showModal === true ? "pop-box p-fixed" : ""}>
          <div className={showModal === true ? "popup-delete-model" : ""}>
            {
              showModal && <div className='popup-delete'>
                <h1 className='content-h'>Confirm delete?</h1>
                  <div className='btnn-pop'>
                    <button className='yes-btn' onClick={() => handleDeleteCode()} disabled={deleteLoading}>{deleteLoading ? 'Deleting..' : 'Yes'}</button>
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

export default AllCodes;