"use client"
import "./SingleFile.css"
import React, { useState } from 'react'
import { Button, Modal, Spin, message } from 'antd'
import { useDispatch, useSelector } from "react-redux"
import { showSingleFilePopup } from "../../actions/app"
import session from '../../utils/session'
import { BiSave } from 'react-icons/bi'
import { fetchCurrentTab } from "../../utils/fetch-current-tab"
import { addGem } from "../../actions/gems"


const SingleFileModal = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [html, setHtml] = useState(true);
    const [imageUrl, setImageUrl] = useState(true);



    const { showSingleFileModal } = useSelector(state => state.app)
    const dispatch = useDispatch()

    const onHideModal = () => {
        dispatch(showSingleFilePopup(false))
    }

    const saveToCurateit = async () => {
        setIsLoading(true)
        const currentTab = await fetchCurrentTab()
        window.chrome.tabs.sendMessage(currentTab.id, { type: "GET_TAB_DETAILS" }, (response) => {
            const obj = {
                data: {title: response?.title,
                description: response?.description,
                url: response?.url,
                metaData: {
                    type: "Link",
                    title: response?.title || "", 
                    icon: {
                      type: "image",
                      icon: response?.favicon || null,
                    },
                    defaultIcon: response?.favicon || null,
                    defaultThumbnail: response?.thumbnail || null,
                    docImages: response?.allImages,
                    url: response?.url,
                },
                media: {
                    covers: response?.thumbnail ? [response?.thumbnail] : [],
                },
                media_type: "Link",
                collection_gems: session?.unfiltered_collection_id,
                author: session?.userId,
                tags: []
            }
            }
            dispatch(addGem(obj))
            setIsLoading(false)
            dispatch(showSingleFilePopup(false))
            message.success("Saved to Curateit")
        })

    }

    const downloadHTML = async () => {
        const currentTab = await fetchCurrentTab()
        window.chrome.tabs.sendMessage(currentTab.id, { type: "DOWNLOAD_HTML" }, (response) => {
            console.log("response", response)
        })

    }

    return (
        <Modal open={showSingleFileModal}
            //    title={"Plan Limit Exceeded"}
            footer={false}
            onCancel={onHideModal}
            className="ct-single-file-modal"
            width={800}
            height={600}
            destroyOnClose
        >
            { isLoading ? <div className='flex items-center justify-center h-full'><Spin /></div> : null}
            <div className='flex flex-col items-center justify-center h-full'>
                <Button className='flex items-center ct-single-file-btn' onClick={saveToCurateit}>
                    <img className='mr-1' style={{ height: "14px", width: "14px" }} src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`} alt="icon" onError={(e) => {
                        e.target.onerror = null;
                        // e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                    />
                    Save To Curateit</Button>
                <Button type="primary" className='bg-[#347AE2] mt-2 flex items-center ct-single-file-btn' onClick={downloadHTML}><BiSave className='mr-1' /> Download as HTML</Button>
                {/* <a onclick="this.href='data:text/html;charset=UTF-8,'+encodeURIComponent(document.documentElement.outerHTML)" href="#" download="page.html">Download</a> */}
            </div>
        </Modal>
    )
}

export default SingleFileModal