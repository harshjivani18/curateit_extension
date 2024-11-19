import React, {
    useState,
    useEffect,
    useRef
} from "react";
import {
    useSelector,
    useDispatch
} from "react-redux";
import { useNavigate } from "react-router";
import {
    message,
    Button
} from "antd";

import OperationLayout from '../../components/layouts/OperationLayout'
import {
    panelClose,
    copyText
} from "../../utils/message-operations";
import { removeDuplicates } from "../../utils/equalChecks";
import session from "../../utils/session";

import { createVideo, updateVideo } from "../../actions/videos";
import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import { addGem } from "../../actions/gems";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { TEXT_MESSAGE } from "../../utils/constants";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import ReactPlayer from "react-player";

let currentParentDetails            = null;

const VideoPage = (props) => {
    const dispatch = useDispatch()
    const fileRef = useRef(null)
    const navigate = useNavigate()
    const currentGem = useSelector((state) => state.gem.currentGem);
    const tabDetails                    = useSelector((state) => state.app.tab)
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [videoFile, setVideoFile] = useState(null)
    const [videoSrc, setVideoSrc] = useState(currentGem && currentGem.S3_link && currentGem.S3_link.length !== 0 ? currentGem.S3_link[0] : currentGem?.media?.videoLink ? currentGem.media.videoLink : "")
    const [processing, setProcessing] = useState(false)
    const [title, setTitle] = useState("");
    const [fileType, setfileType] = useState(currentGem && currentGem?.fileType ? currentGem?.fileType : "url")

    const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])

    const updateFileType = (type) => {
        // if (type === "file") {
        //     setVideoSrc("")
        // }
        setfileType(type);
    }

    useEffect(() => {
        const getCall = async () => {
            const currentTab = tabDetails || await fetchCurrentTab()
            if (fileType === "url") {
                setVideoSrc(currentTab.url)
            } 
        }
        getCall()
    }, [])

    const onSubmitBookmark = async (obj) => {
        if (!currentGem && (!videoFile || videoSrc === "" || !fileRef) && obj?.fileType === "file") {
            message.error("Please upload a valid video file!")
            return
        }

        setProcessing(true)
        const mediaCovers = currentGem?.metaData?.covers ? [obj.imageUrl, ...currentGem?.metaData?.covers] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers = removeDuplicates(mediaCovers)
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null

        if (currentGem) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem.id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)
            let payload = null
            if (videoFile) {
                payload = new FormData()
                payload.append("files", videoFile)
                payload.append("title", obj.heading)
                payload.append("description", obj.description)
                payload.append("expander", obj.shortUrlObj)
                payload.append("metaData", JSON.stringify({
                    covers: finalCovers,
                    defaultIcon: obj?.defaultFavIconImage || '',
                    icon: obj?.favIconImage || null,
                    docImages: obj?.docImages,
                    defaultThumbnail: obj?.defaultThumbnailImg || ''
                }))
                payload.append("url", (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1) : obj.assetUrl)
                payload.append("tags", JSON.stringify(obj.selectedTags.map((t) => { return t.id })))
                payload.append("notes", obj.remarks)
                payload.append("is_favourite", obj.favorite)
                payload.append("collections", obj.selectedCollection.id)
                payload.append("showThumbnail", obj.showThumbnail)
                payload.append("fileType", obj?.fileType)
            }
            else {
                payload = {
                    url: (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1) : obj.assetUrl,
                    title: obj.heading,
                    description: obj.description,
                    expander: obj.shortUrlObj,
                    tags: obj.selectedTags.map((o) => { return o.id }),
                    collections: obj.selectedCollection.id,
                    is_favourite: obj.favorite,
                    notes: obj.remarks,
                    metaData: {
                        covers: finalCovers,
                        icon: obj?.favIconImage || '',
                        docImages: obj.docImages,
                        defaultIcon: obj?.defaultFavIconImage || '',
                        defaultThumbnail: obj?.defaultThumbnailImg || null,
                    },
                    showThumbnail: obj?.showThumbnail,
                    fileType: obj?.fileType,
                    html: obj?.html
                }
            }

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

            const audioUpdateRes = await dispatch(updateVideo(payload, currentGem.id))
            if (audioUpdateRes.error === undefined && audioUpdateRes.payload?.error === undefined && audioUpdateRes.payload) {
                const { data } = audioUpdateRes.payload
                if (data) {
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
                }
            }
        }
        else if (!videoFile || videoSrc === "" || !fileRef) {
            let finalObj = {
                title: obj.heading,
                description: obj.description,
                media_type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
                author: session.userId ? parseInt(session.userId) : null,
                url: obj.assetUrl,
                media: {
                    covers: finalCovers
                },
                metaData: {
                    type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
                    title: obj.heading,
                    icon:  obj?.favIconImage ||  "",
                    defaultIcon: obj?.defaultFavIconImage || '',
                    defaultThumbnail: obj?.defaultThumbnailImg || null,
                    url: obj.assetUrl,
                    docImages: obj.docImages,
                    covers: finalCovers
                },
                collection_gems: obj.selectedCollection.id,
                remarks: obj.remarks,
                tags: obj.selectedTags?.map((t) => { return t.id }),
                is_favourite: obj.favorite,
                showThumbnail: obj?.showThumbnail,
                fileType: obj?.fileType,
                html:obj?.html
            }
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            if(isSelectedCollectionShared){
                    finalObj ={
                        ...finalObj,
                        author: isSelectedCollectionShared?.data?.author?.id
                    }
            }
            const gemRes = await dispatch(addGem({ data: finalObj }))
            if (gemRes.error === undefined && gemRes.payload.error === undefined) {
                const { data } = gemRes.payload
                if (data.data) {
                    const d = data.data;
                    // const gTags  = d.tags.map((t) => { return { id: t.id, tag: t.tag }})
                    const g = {
                        id: d.id,
                        title: d.title,
                        media: d.media,
                        media_type: d.media_type,
                        url: d.url,
                        remarks: d.remarks,
                        metaData: d.metaData,
                        description: d.description,
                        S3_link: d.S3_link,
                        is_favourite: d.is_favourite,
                        collection_id: obj.selectedCollection.id,
                        tags: obj.selectedTags,
                        showThumbnail: obj?.showThumbnail,
                        fileType: d?.fileType
                    }
                    if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    setProcessing(false)
                    setVideoFile(null)
                    setVideoSrc("")
                    return navigate("/search-bookmark")
                    }
                    dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
                }
            }
        }
        else {
            const formData = new FormData()
            formData.append("files", videoFile)
            formData.append("title", obj.heading)
            formData.append("description", obj.description)
            formData.append("metaData", JSON.stringify({
                covers: finalCovers,
                defaultIcon: obj?.defaultFavIconImage || '',
                icon: obj?.favIconImage || null,
                docImages: obj?.docImages,
                defaultThumbnail: obj?.defaultThumbnailImg || ''
            }))
            formData.append("url", (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1) : obj.assetUrl)
            formData.append("tags", JSON.stringify(obj.selectedTags.map((t) => { return t.id })))
            formData.append("notes", obj.remarks)
            formData.append("is_favourite", obj.favorite)
            formData.append("collections", obj.selectedCollection.id)
            formData.append("showThumbnail", obj.showThumbnail)
            formData.append("fileType", obj?.fileType)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            if(isSelectedCollectionShared){
                formData.append("author", isSelectedCollectionShared?.data?.author?.id)
            }

            const audio = await dispatch(createVideo(formData))
            if (audio.error === undefined && audio.payload && audio.payload.error === undefined) {
                const { data } = audio.payload
                if (data) {
                    if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,data))
                    setProcessing(false)
                    setVideoFile(null)
                    setVideoSrc("")
                    return navigate("/search-bookmark")
                    }
                    dispatch(updateBookmarkWithExistingCollection(data, obj.selectedCollection, false, "add", null))
                }
            }
        }
        setProcessing(false)
        setVideoFile(null)
        setVideoSrc("")
        navigate("/search-bookmark")
    }

    const onDownloadAudio = () => {
        if (videoSrc) {
            const link = document.createElement('a');
            link.href = videoSrc;
            link.download = videoSrc;

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    }

    const onCopyAudioLink = () => {
        try {
            copyText(videoSrc)
            message.success('Video Link Copied to clipboard');
        } catch (err) {
            message.error('Not have permission')
        }
    }

    const onFileChange = (e) => {
        const { files } = e.target
        const file = files[0]
        const filePath = file.name;
        const allowedExtensions = /(\.mp4|\.mov|\.wmv|\.avi|\.flv|\.webm)$/i;
        if (!allowedExtensions.exec(filePath)) {
            message.error("File is not supported")
            return;
        }
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        if (fileSize > 25) {
            message.error('File size must be less than 25MB');
            setVideoFile(null)
            return
        }
        setVideoFile(file)
        setVideoSrc(URL.createObjectURL(file))
        const nameArr = filePath.split('.');
        nameArr.splice(-1);
        setTitle(nameArr.join('.'));
    }

    const onUploadFileClick = () => {
        if (fileRef) {
            fileRef.current.click()
        }
    }

    const renderFileUpload = () => {
        return (
            <>
                <input type={"file"} className={"d-none"} onChange={onFileChange} ref={fileRef} accept="video/*" />
                <Button onClick={onUploadFileClick}>Upload Video!</Button>
            </>
        )
    }

    const handleUpdateInformation = (gemObj) => {
        setDetails({...details,...gemObj})
    }

    const handleUploadInformation = (obj) => {
        setVideoFile(obj.videoFile)
        setVideoSrc(obj.videoSrc)
    }
    return (
        <OperationLayout currentGem={currentGem}
            processing={processing}
            onButtonClick={onSubmitBookmark}
            pageTitle={currentGem ? "Update Video" : "Save Video"}
            isHideBackButton={false}
            mediaType={"Video"}
            onPanelClose={panelClose}
            title={title}
            updateFileType={updateFileType}
            setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
            getUpdateInformation = {handleUpdateInformation}
            getUploadInformation = {handleUploadInformation}
        >
            {/* <div className="pt-4">
                <div className="image-header">
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Video</h6>
                    {(videoSrc !== "") && <svg
                        onClick={onDownloadAudio}
                        className="dwldSvg"
                        title="Download"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z" /><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" /></svg>}
                    {(videoSrc !== "") && <svg
                        onClick={onCopyAudioLink}
                        className="linkSvg"
                        title="Copy Text"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z" /><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" /></svg>}
                </div>
                <div className='bg-[#F8FBFF] rounded-t-[16px] imgWrapperContainer'>
                    <div>
                        {videoSrc && videoSrc !== ""
                            ? <video autoPlay={false} controls>
                                <source src={videoSrc} />
                            </video>
                            : fileType === "file" ? renderFileUpload() : null
                        }
                    </div>
                </div>
            </div> */}
            {
            fileType === 'file' && videoSrc &&  
            <div className="ct-relative">
                <div className="">
                  <div className="px-1 md:px-2 flex items-center justify-center">
                    <video autoPlay={false} controls>
                      <source src={videoSrc} />
                    </video>
                  </div>
                </div>
            </div>
            }
            {
            fileType === 'url' && details?.imageUrl &&  
                <img src={details?.imageUrl}
                alt={details?.title || details?.description || ""} 
                className='w-full object-cover block h-[200px] rounded-lg'
                onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                }}
            />
            }
            {/* {
            fileType === 'url' &&  (details?.assetUrl || videoSrc) &&  
            <div className="ct-relative">
                <div className="gradient-add-bookmark-div">
                  <ReactPlayer
                    url={details?.assetUrl || videoSrc} 
                    playing={false}
                    controls={true}
                    width="100%"
                    height={'200px'}
                  />
                </div>
            </div>
            }

            {
            fileType === 'file' && videoSrc &&
            <>
            <div className="ct-relative">
                <div className="gradient-add-bookmark-div after:h-[15%]">
                  <div className="px-1 md:px-2 flex items-center justify-center">
                    <video autoPlay={false} controls>
                      <source src={videoSrc} />
                    </video>
                  </div>
                </div>
            </div>
            </>
            } */}
        </OperationLayout>
    )
}

export default VideoPage