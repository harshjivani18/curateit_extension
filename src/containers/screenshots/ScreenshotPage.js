import React, { useEffect, useState,
       useRef }                                     from "react";
import { useSelector,
         useDispatch }                              from "react-redux";
import { useNavigate }                              from "react-router-dom";
import { Button, message, Tooltip,
         Spin }                                     from "antd";
import { v4 as uuidv4 }                             from 'uuid'      

import OperationLayout                              from '../../components/layouts/OperationLayout'
import { copyText,
         panelClose }                               from '../../utils/message-operations'
import session                                      from "../../utils/session";
import { removeDuplicates }                         from "../../utils/equalChecks";
import { fetchCurrentTab }                          from "../../utils/fetch-current-tab";

import { uploadScreenshots,
         updateBookmarkWithExistingCollection, 
         removeGemFromCollection,
         moveGemToSharedCollection,
         addGemToSharedCollection}     from "../../actions/collection";
import { addImage,
         extractImageText,
         updateImage }                              from "../../actions/image";
import { updateHighlightsArr }                      from "../../actions/highlights";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { TEXT_MESSAGE } from "../../utils/constants";

let currentParentDetails            = null

const ScreenshotPage = (props) => {
    // let getParentDetails                = null
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const fileRef                       = useRef(null)
    const currentGem                    = useSelector((state) => state.gem.currentGem)
    const tabDetails                    = useSelector((state) => state.app.tab)
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [selectedFile, 
           setSelectedFile]             = useState(null)
    const [imageSrc, setImageSrc]       = useState(currentGem && currentGem.S3_link && currentGem.S3_link.length !== 0 ? `${currentGem.S3_link[0]}?${Date.now()}` : "")
    const [processing, setProcessing]   = useState(false)
    const [showImageLoader,
           setShowImageLoader]          = useState(false)
    useEffect(() => {
        window.chrome?.storage?.sync.onChanged.addListener(onImageSourceChange)
        window.chrome?.storage?.sync.get(['imageData'], (data) => {
            if (data.imageData && data.imageData.imageSrc) {
                setShowImageLoader(true)
                setImageSrc(data.imageData.imageSrc)
            }
        });
        return () => {
            window.chrome?.storage?.sync.onChanged.removeListener(onImageSourceChange)
            window.chrome.storage.sync.remove('imageData')
        }
    }, [])

    const onImageSourceChange = (e) => {
        const { imageData } = e

        if (!currentGem && (imageData && imageData.newValue)) {
            const { newValue } = imageData
            setShowImageLoader(true)
            setImageSrc(newValue.imageSrc || "")
        }
    }

    const onSubmitBookmark = async (obj) => {
        if ((imageSrc === "" || imageSrc === null || imageSrc === undefined) && selectedFile === null) {
            message.error("Please upload valid file!")
            return
        }

        const mediaCovers  = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers  = removeDuplicates(mediaCovers)
        setProcessing(true)
        let imgPayload = null
        let finalSrc   = imageSrc
        if (selectedFile !== null) {
            const formData  = new FormData()
            formData.append("files", selectedFile)
            const imgRes    = await dispatch(uploadScreenshots(formData))
            if (imgRes.error === undefined && imgRes.payload?.error === undefined) {
                const { data } = imgRes.payload
                if (data && data.length !== 0) {
                    const src = data[0]
                    finalSrc  = src
                    setImageSrc(src)
                }
            } 
        }

        let payload = {
            title: obj.heading,
            description: obj.description,
            expander: obj.shortUrlObj,
            type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            author: session.userId ? parseInt(session.userId) : null,
            url: (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1): obj.assetUrl,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            collections: obj.selectedCollection.id,
            is_favourite: obj.favorite,
            notes: obj.remarks,
            image: finalSrc,
            metaData: {
                covers: finalCovers,
                icon: obj?.favIconImage || '',
                docImages: obj.docImages,
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            _id: uuidv4(),
            showThumbnail: obj?.showThumbnail
        }
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null

        if (currentGem) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem.id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)
            if(isSingleBkShared && !isSelectedCollectionShared){
                message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT)
                setProcessing(false)
                return;
            }
            if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
            }
            imgPayload = await dispatch(updateImage(obj.selectedCollection.id, currentGem.id, payload))
        }
        else {
        isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
        }
            imgPayload = await dispatch(addImage(payload, payload.image))
        }
        setProcessing(false)
        if (imgPayload.error === undefined && imgPayload.payload?.error === undefined) {
            const { data } = imgPayload.payload
            if (currentGem) {
                const isCollectionChanged = currentGem?.parent.id !== obj.selectedCollection.id;
                const o = {
                    ...data,
                    tags: obj.selectedTags
                }
                if (isCollectionChanged) {
                    o["collection_id"] = obj.selectedCollection.id
                    o["collection_gems"] = obj.selectedCollection
                }
                if(isSelectedCollectionShared){
                    dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '',isCurrentCollectionShared))
                    dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : data))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }
                dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : data, obj.selectedCollection, isCollectionChanged, "update", currentGem?.parent))
                dispatch(updateHighlightsArr((currentGem) ? { ...currentGem, ...o } : data, "edit"))
            }
            else {
                const g      = {
                    id: data.id,
                    title: data.title,
                    media: data.media,
                    media_type: data.media_type,
                    url: data.url,
                    remarks: data.remarks,
                    metaData: data.metaData,
                    description: data.description,
                    S3_link: data.S3_link,
                    text: data.text,
                    is_favourite: data.is_favourite,
                    collection_id: obj.selectedCollection.id,
                    collection_gems: obj.selectedCollection,
                    tags: obj.selectedTags,
                    showThumbnail: data?.showThumbnail
                }
                if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    dispatch(updateHighlightsArr(g))
                }
                if(!isSelectedCollectionShared){
                    dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
                    dispatch(updateHighlightsArr(g))
                }
            }
        }
        window.chrome.storage.sync.remove('imageData')
        setSelectedFile(null)
        setImageSrc("")
        navigate("/search-bookmark")
        // panelClose()
    }

    const onDownloadImg = (e) => {
        const link      = document.createElement('a');
        link.href       = imageSrc;
        link.download   = imageSrc;

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    const onCopyImageLink = () => {
        try {
            copyText(imageSrc)
            message.success('Image Copied to clipboard');
        } catch (err) {
            message.error('Not have permission')
        }
    }

    const onFileChange = (e) => {
        const { files }             = e.target
        const file                  = files[0]
        const filePath              = file.name;
        const allowedExtensions     = /(\.jpeg|\.jpg|\.png|\.svg|\.webp)$/i;
        if (!allowedExtensions.exec(filePath)) {
            message.error("File is not supported")
            return;
        }
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        if (fileSize > 25) {
            message.error('File size must be less than 25MB');
            setSelectedFile(null)
            return
        }
        const url = URL.createObjectURL(file)
        setSelectedFile(file)
        setImageSrc(url)
        URL.revokeObjectURL(file)
    }

    const onCopyImageText = async () => {
        if (imageSrc.startsWith("blob")) { 
            message.error('Image is not uploaded yet. So not able to extract text')
            return
        }
        try {
            const resp = await dispatch(extractImageText(imageSrc))
            if (resp.error === undefined && resp.payload?.error === undefined) { 
                const { data } = resp.payload
                if (data) {
                    const { text } = data
                    copyText(text)
                    message.success('Text Copied to clipboard');
                }
            }
            else {
                message.error('Not able to extract text')
            }
        } catch (err) {
            message.error('Not have permission')
        }
    }

    const onUploadFileClick = () => {
        if (fileRef) {
            fileRef.current.click()
        }
    }

    const openEditor = async (editorURL) => {
        const t         = tabDetails || await fetchCurrentTab()
        window.chrome.tabs.sendMessage(t.id, { id: "CT_OPEN_WINDOW", tabURLs: [editorURL], isCloseExt: true })
    }
    
    const onEditImageClick = async () => {
        if (imageSrc === "" || imageSrc === null || imageSrc.startsWith("blob")) {
            message.error('Please upload the file first')
            return
        }
        
        const { REACT_APP_WEBAPP_URL } = process.env
        //
        if (!currentGem && currentParentDetails) {
            const details = currentParentDetails()
            const payload = {
                title: details.heading,
                description: details.description,
                type: typeof details.selectedType === "object" ? details.selectedType?.name : details.selectedType,
                author: session.userId ? parseInt(session.userId) : null,
                url: (details.assetUrl && details.assetUrl.endsWith('/')) ? details.assetUrl?.slice(0, -1): details.assetUrl,
                tags: details.selectedTags?.map((t) => { return t.id }),
                collections: details.selectedCollection.id,
                is_favourite: details.favorite,
                notes: details.remarks,
                image: imageSrc,
                metaData: {
                    docImages: details?.metaData?.docImages || [],
                    covers: [details.imageUrl],
                    defaultIcon: details?.imageUrl,
                    defaultThumbnail: details?.imageUrl || null,
                    icon: { type: "image", icon: details?.imageUrl }
                },
                _id: uuidv4(),
                showThumbnail: details?.showThumbnail
            }
            const gem = await dispatch(addImage(payload, payload.image))
            if (gem.error === undefined && gem.payload?.data) {
                const editorURL = `${REACT_APP_WEBAPP_URL}/u/${session.username}/image-editor/${gem.payload.data.id}/${session.token}?url=${imageSrc}`
                openEditor(editorURL)
            }
            else {
                message.error("Image is not created.")
            }
        }
        else if (currentGem) {
            const editorURL = `${REACT_APP_WEBAPP_URL}/u/${session.username}/image-editor/${currentGem.id}/${session.token}?url=${imageSrc}`
            openEditor(editorURL)
        } 
    }

    const onImageLoadCompleted = () => {
        setShowImageLoader(false)
    }

    const renderFileUpload = () => {
        return (
            <>
                <input type={"file"} className={"d-none"} onChange={onFileChange} ref={fileRef} accept="image/*" />
                <Button onClick={onUploadFileClick}>Upload Image!</Button>
            </>
        )
    }
    
    const setCodeReset = () => {
        setImageSrc('')
    }
    return (
        <OperationLayout currentGem={currentGem}
                         processing={processing}
                         onButtonClick={onSubmitBookmark}
                         pageTitle={currentGem ? "Update screenshot" : "Save screenshot"}
                         isHideBackButton={false}
                         mediaType={"Screenshot"}
                         setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
                         onPanelClose={panelClose}
                         childImageSrc={imageSrc}
                         onImageEditClick={onEditImageClick}
                         setResetData = {setCodeReset}
                         >
            <div className="pt-4">
                {/* <div className="image-header">
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Screenshot</h6>
                    {imageSrc !== "" &&
                        <div className="flex items-center justify-end w-full">   
                            <Tooltip title="Copy image text" placement="bottom">
                                <svg onClick={onCopyImageText} className="mr-10" xmlns="http://www.w3.org/2000/svg" title="Extracting Image Text" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M21 8v12.993A1 1 0 0 1 20.007 22H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.455 3.449 2 4.002 2h10.995L21 8zm-2 1h-5V4H5v16h14V9zM8 7h3v2H8V7zm0 4h8v2H8v-2zm0 4h8v2H8v-2z"/></svg>
                            </Tooltip>
                            <Tooltip title="Download Image" placement="bottom">
                                <svg 
                                onClick={onDownloadImg}
                                className="mr-10"
                                title="Download"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z"/></svg>
                            </Tooltip>
                            <Tooltip title="Copy Image Link" placement="bottom">
                                <svg 
                                onClick={onCopyImageLink}
                                className="mr-5"
                                title="Copy Text"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z"/></svg>
                            </Tooltip>
                            <Tooltip title="Edit Image" placement="bottom">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke-width="1.5" 
                                    stroke="currentColor" 
                                    width="20" height="20"
                                    onClick={onEditImageClick}>
                                    <path stroke-linecap="round" 
                                        stroke-linejoin="round" 
                                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                                </svg>
                            </Tooltip>
                        </div>
                    }
                </div> */}
                <div className='bg-[#F8FBFF] rounded-t-[16px] imgWrapperContainer'>
                    <div>
                        {showImageLoader && <Spin spinning={showImageLoader} tip="Loading Image" />}
                        {imageSrc === "" || imageSrc === null || imageSrc === undefined 
                            ? renderFileUpload()
                            : <img src={imageSrc ? imageSrc : ''} alt="" onLoad={onImageLoadCompleted} 
                                    style={
                                        { 
                                            display: showImageLoader ? 'none' : 'block'
                                        }
                                    } />
                        }
                    </div>
                </div>
            </div>
        </OperationLayout>
    )
}

export default ScreenshotPage