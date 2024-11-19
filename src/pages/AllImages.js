/*global chrome*/
import React, { useEffect, useState } from 'react'
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { message, Spin } from 'antd';
import {  PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { getActiveTabURL } from '../utils/send-theme-to-chrome';
import { deleteImage, getAllImages } from '../actions/image';
import { useSelector } from 'react-redux';
import { fetchCurrentTab } from '../utils/fetch-current-tab';

const AllImages = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const pageImages       = useSelector((state) => state.images.images);
    const tabDetails       = useSelector((state) => state.app.tab)
    const [showModal,setShowModal] = useState(false)

    const [loading,setLoading] = useState(false)
    const [imageDetail,setImageDetail] = useState('')
    const [deleteLoading,setDeleteLoading] = useState(false)

    // 

    useEffect(() => {
    const getCall = async () => {
        setLoading(true)
        const tabObj        = tabDetails || await fetchCurrentTab()
        if (tabObj.length !== 0) {
            const response = await dispatch(getAllImages(tabObj.url))
            if(response){
                setLoading(false)
            }
        }else{
            setLoading(false)
        }
    }

    getCall()
  },[])

  const navigateToEdit = (image) => {
    const gemId = image.id
    const collectionId = image.media.collections

    navigate(`/image/${collectionId}/${gemId}`)
  }

  const openDeleteModal = (image) => {
    setImageDetail(image)
    setShowModal(true)
  }

  const hideDeleteModal = () => {
    setShowModal(false)
    setImageDetail('')
  }

  // 

  const handleDeleteImage = async () => {
    const tabs = await getActiveTabURL()
    const url = tabs.url.endsWith('/') ? tabs.url.slice(0, -1) : tabs.url
    const gemId = imageDetail && imageDetail.id
    const collectionId = imageDetail && imageDetail.media.collections

    setDeleteLoading(true)
    const res = await dispatch(deleteImage(collectionId,gemId))

    if(res.error === undefined){
      await dispatch(getAllImages(url))

      setShowModal(false)
      setDeleteLoading(false)
      message.success('Image deleted successfully');
    }else{
      setShowModal(false)
      setDeleteLoading(false)
      message.error('Error Occurred');
    }
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
            pageImages && pageImages.length>0 ? pageImages.map((image,i) => {
              return(
                 <>
              <div className="mx-auto w-full" key={i}>
                <div className='group ct-relative'>

                  <div className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">

                    <div className='flex justify-start items-center gap-1'>
                        <div className='highlightItem'>
                          <div>
                              {image?.media?.title}
                          </div>
                      </div>
                    </div>

                  </div>

                  <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100' style={{top:'-10px'}}>
                      <button className='edit-btn' 
                      onClick={() => navigateToEdit(image)}
                      >
                        <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                      </button>
                      <button 
                      onClick={() => openDeleteModal(image)}
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
                    No Image saved.
                </p>
            </>
        }

        <div className={showModal === true ? "pop-box p-fixed" : ""}>
          <div className={showModal === true ? "popup-delete-model" : ""}>
            {
              showModal && <div className='popup-delete'>
                <h1 className='content-h'>Confirm delete?</h1>
                  <div className='btnn-pop'>
                    <button className='yes-btn' onClick={() => handleDeleteImage()} disabled={deleteLoading}>{deleteLoading ? 'Deleting..' : 'Yes'}</button>
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

export default AllImages;