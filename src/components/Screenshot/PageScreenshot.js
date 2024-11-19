/*global chrome*/
import './pageScreen.css'
import React, { Fragment, useEffect, useState, useRef } from 'react'
import {useSelector, useDispatch} from 'react-redux'
import { ArrowUpTrayIcon, PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Dialog, Transition } from '@headlessui/react'
import { addUploadReset } from '../../actions/upload'
import { fetchUrlScreenshotData, fetchUrlScreenshotDataReset } from '../../actions/domain'
import { uploadBookmarkCover, uploadScreenshots, 
         updateBookmarkWithExistingCollection } from '../../actions/collection'
import Error from "../../components/common/error";
import { message, Spin } from 'antd'

function b64ToFile(dataurl, filename) {
  var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}
const fileTypes = [
  "image/jpg",
  "image/jpeg",
  "image/png"
];

const PageScreenshot = ({ open, setOpen, coverImages, setCoverImages, setImageUrl, currentGem, selectedCollection, existingCovers, setAllThumbnails, setShowThumbnail }) => {
  const [url, setUrl] = useState('')
  const [openUrl, setOpenUrl] = useState(false)
  const [screenshotSpin, setScreenshotSpin] = useState(false)
  const imgRef = useRef()
  const inputRef = useRef(null)

  const dispatch = useDispatch()

  const uploadedFileData = useSelector(state => state.upload.uploadFileData)
  const urlScreenshotData = useSelector((state) =>  state.domain.urlScreenshotData)
  
  useEffect(() => {
    if(uploadedFileData && uploadedFileData[0]){
      setScreenshotSpin(true)
      setCoverImages(prev => [uploadedFileData[0]?.url,...prev])
      setImageUrl(uploadedFileData[0]?.url)
      setScreenshotSpin(false)
      dispatch(addUploadReset())
    }
    if(urlScreenshotData && urlScreenshotData.title){
      // 
      setScreenshotSpin(true)
      let screenshot = urlScreenshotData?.Extras?.filter(component => {
        if(component.__component === "extras.screenshots"&& component.screenshot){
          return component
        }
      })[0]?.screenshot?.url
      if(screenshot){
        setScreenshotSpin(true)
        setCoverImages(prev => [screenshot,...prev])
        setImageUrl(screenshot)
        setScreenshotSpin(false)
      }
      dispatch(fetchUrlScreenshotDataReset())
    }
  }, [uploadedFileData, urlScreenshotData])

  const setupNewCovers = (res) => {
    setScreenshotSpin(true)
    if (res.error === undefined && res.payload.error === undefined && res.payload.data && res.payload.data.media?.covers) {
      const newCovers = res?.payload?.data?.metaData?.covers
      if (newCovers) {
        setCoverImages([ ...newCovers ])
        setAllThumbnails(coverImages.length > 0 && newCovers.length > 0 ? [ newCovers[0], ...coverImages ] : coverImages.length === 0 && newCovers > 0 ? [ newCovers[0] ] : coverImages)
        setImageUrl(newCovers.length > 0 ? newCovers[newCovers.length - 1] : "")
      }
      setScreenshotSpin(false)
    }
    else if (res.error === undefined && res.payload.error === undefined && res.payload.data) {
      const { data } = res.payload
      if (data) {
        setScreenshotSpin(true)
        setCoverImages([ ...coverImages, ...data ])
        setAllThumbnails(coverImages.length > 0 && data.length > 0 ? [ ...data, ...coverImages ] : coverImages.length === 0 ? [ ...data ] : coverImages)
        setImageUrl(data.length > 0 ? data[data.length - 1] : "")
        setScreenshotSpin(false)
      }
    }
  }

  const screenCaptureHandler = async () => {
    setScreenshotSpin(true)
    const tabs = await chrome.tabs.query({active:true, currentWindow: true})
    await chrome.tabs.sendMessage(tabs[0].id, "toggle")
    const tab  = await chrome.tabs.captureVisibleTab(
      tabs[0].windowId,
      {
      format : "png",
      quality : 100
      })
    await chrome.tabs.sendMessage(tabs[0].id, "toggle")
    const fileName = 'myFiles'
    const convertedFile = b64ToFile(tab, fileName)
    const formData = new FormData()
    formData.append("files", convertedFile)
    if (currentGem) {
      dispatch(uploadBookmarkCover(currentGem.id, formData)).then((res) => {
        setupNewCovers(res)
        if (res && res.error === undefined && res.payload?.error === undefined) {
          const { data } = res.payload
          if (data) {
            dispatch(updateBookmarkWithExistingCollection({ ...currentGem, ...data }, selectedCollection, false, "update", currentGem.parent))
          }
        }
      })
      setScreenshotSpin(false)
    }
    else {
      dispatch(uploadScreenshots(formData)).then((res) => {
        setupNewCovers(res)
      })
      setScreenshotSpin(false)
    }

  }

  const uploadedFileHandler = (e) => {
    setScreenshotSpin(true)
    const fileType = validFileType(e.target.files[0])
    if(fileType){
      const formData = new FormData()
      formData.append("files", e.target.files[0])
      if (currentGem) {
        dispatch(uploadBookmarkCover(currentGem.id, formData)).then((res) => {
          if (res && res.error === undefined && res.payload?.error === undefined) {
            const { data } = res.payload
            if (data) {
              dispatch(updateBookmarkWithExistingCollection({ ...currentGem, ...data }, selectedCollection, false, "update", currentGem.parent))
            }
          }
          setupNewCovers(res)
        })
        setScreenshotSpin(false)
      }
      else {
        dispatch(uploadScreenshots(formData)).then((res) => {
          setupNewCovers(res)
        })
        setScreenshotSpin(false)
      }
      
      e.target.files = null
    }else{
      setScreenshotSpin(false)
      message.error("File type invalid")
    }
    
  }

  const urlImageHandler = () => {
    setOpenUrl(false)
    setScreenshotSpin(true)
    if(url.charAt(url.length-1) === '/'){
      dispatch(fetchUrlScreenshotData(url))
      setScreenshotSpin(false)
    }else{
    dispatch(fetchUrlScreenshotData(`${url}/`))
    setScreenshotSpin(false)
    }
  }
  const changeUrl = (value) => {
    setUrl(value);
  }
  const validFileType=(file)=> {
    return fileTypes.includes(file.type);
  }

  const onCoverImageClick = (cover) => {
    setImageUrl(cover)
    setCoverImages([ cover, ...existingCovers ])
    setShowThumbnail(true)
    setOpen(false)
  }

  const handleShowThumbnailChange = () => {
    setShowThumbnail(false)
    setOpen(false);
  }

  return (
    <>
    <Error />
   {!openUrl? <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="ct-relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" style={{ height: '622px' }} />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="modal-container ct-relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  {/* <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div> */}
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                      <div className='flex items-center'>
                        <button className='back-btn' onClick={()=>setOpen(false)}><ArrowLeftIcon className='h-5 w-5 mr-3'/></button>
                        Cover
                      </div>
                      <div className='flex justify-end items-center gap-2'>
                        {/* <button onClick={()=>setOpenUrl(true)}><PlusIcon className='h-5 w-5 mr-3'/></button> */}
                          <button className='text-gray-700 text-sm' onClick={handleShowThumbnailChange}>Clear</button>
                        <div onClick={()=>imgRef.current.click()} className="pointer">
                          <ArrowUpTrayIcon className='h-5 w-5'/>
                        </div>
                        <input className='hidden' ref={imgRef} onChange={(e) => uploadedFileHandler(e)} type="file" name="bookmark-image" id="bookmark-image" accept="image/png, image/jpeg" />
                      </div>     
                    </Dialog.Title>
                    <div className="mt-2">
                      <div className='flex flex-wrap screenshot-container'>
                        {
                          coverImages?.map((cover,i) => (
                            <div className='box'  key={i} onClick={() => onCoverImageClick(cover)}>
                              <img src={cover} width={"140px"} height={"90px"}  alt="" className='screen-fit' />
                            </div>
                          ))
                        }
                        { screenshotSpin ? 
                            <div className= 'box pointer'>
                              <Spin />
                            </div>
                          :""
                        }
                      <div className= 'box pointer' onClick={screenCaptureHandler}>
                        <h1>Screenshot</h1>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>:null}
    {openUrl?<Transition.Root show={openUrl} as={Fragment}>
      <Dialog as="div" className="ct-relative z-10" initialFocus={inputRef} onClose={setOpenUrl}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="url-modal-container ct-relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-left sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      URL
                    </Dialog.Title>
                    <div className="mt-2">
                      <Dialog.Description as='input' ref={inputRef} autoFocus className='input medium w-full' value={url} size="w-full mb-2" type="text" name="link" placeholder="https://" onChange={(e)=>changeUrl(e.target.value)}></Dialog.Description>
                    {/* <input autoFocus={true} className='input medium w-full' value={url} size="w-full mb-2" type="text" name="link" placeholder="https://" onChange={(e)=>changeUrl(e.target.value)}/> */}
                    </div>
                  </div>
                </div>
                <div className="mt-5 mb-3 sm:mt-6 flex justify-start">
                  <button
                    type="button"
                    className="inline-flex justify-start rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    onClick={() => urlImageHandler()}
                  >
                    Save
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>:null}
  </>
  )
}

export default PageScreenshot