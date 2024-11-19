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

import { addPdfHighlight, createPdf, getPdfDetails, updatePdf } from "../../actions/pdf";
import { updateBookmarkWithExistingCollection } from "../../actions/collection";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";

let currentParentDetails            = null;

const UploadPDFPage = (props) => {
    const dispatch = useDispatch()
    const fileRef = useRef(null)
    const navigate = useNavigate()
    const currentGem = useSelector((state) => state.gem.currentGem);
    const tabDetails                    = useSelector((state) => state.app.tab)
    const [pdfFile, setPdfFile] = useState(null)
    const [pdfSrc, setPdfSrc] = useState(currentGem && currentGem?.media?.pdfLink || (currentGem?.S3_link && currentGem?.S3_link?.length>0 && currentGem?.S3_link[0] ) || '')
    const [processing, setProcessing] = useState(false)
    const [pdfFilename, setPDFFileName] = useState(currentGem && (currentGem.S3_link && currentGem?.S3_link?.length>0) ? currentGem?.S3_link[0].split("/").pop() : (currentGem?.media?.pdfLink && currentGem?.media?.pdfLink?.split("/")?.pop() || ''))
    const [pdfTitle, setPdfTitle] = useState("");
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
        //     setPdfSrc("")
        // }
        setfileType(type);
    }

    // useEffect(() => {
    //     const getCall = async () => {
    //         const currentTab = tabDetails || await fetchCurrentTab()
    //         if (fileType === "url") {
    //             setPdfSrc(currentTab.url)
    //         } 
    //     }
    //     getCall()
    // }, [])

    const onSubmitBookmark = async (obj) => {
        if (!currentGem && (!pdfFile || pdfSrc === "" || !fileRef) && (obj?.fileType && obj?.fileType === "file")) {
            message.error("Please upload a valid pdf file!")
            return
        }

        setProcessing(true)
        const mediaCovers = currentGem?.metaData?.covers ? [obj.imageUrl, ...currentGem?.metaData?.covers] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers = removeDuplicates(mediaCovers)
        if (currentGem) {
            const payload = {
                url: (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1) : obj.assetUrl,
                title: obj?.heading || 'PDF file',
                description: obj.description,
                expander: obj.shortUrlObj,
                tags: obj.selectedTags.map((o) => { return o.id }),
                collections: obj.selectedCollection.id,
                is_favourite: obj.favorite,
                notes: obj.remarks,
                metaData: {
                    covers: finalCovers,
                    icon: obj?.favIconImage || '',
                    defaultIcon: obj?.defaultFavIconImage || '',
                    docImages: obj.docImages,
                    defaultThumbnail: obj?.defaultThumbnailImg || null,
                },
                showThumbnail: obj?.showThumbnail,
                fileType: obj?.fileType
            }

            const audioUpdateRes = await dispatch(updatePdf(payload, currentGem.id))
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
                    dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : data, obj.selectedCollection, isCollectionChanged, "update", currentGem?.parent))
                }
            }
        }
        if(!currentGem && (fileType === 'file' || obj?.fileType === 'file')){
            const formData = new FormData()
            formData.append("files", pdfFile)
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

            const audio = await dispatch(createPdf(formData))
            if (audio.error === undefined && audio.payload && audio.payload.error === undefined) {
                const { data } = audio.payload
                if (data) {
                    dispatch(updateBookmarkWithExistingCollection(data, obj.selectedCollection, false, "add", null))
                }
            }
        }
        if(!currentGem && (fileType === 'url' || obj?.fileType === 'url')){
            const payload = {
            remarks: obj?.remarks,
            s3link:  pdfSrc,
            collections: obj?.selectedCollection?.id,
            tags: obj?.selectedTags ? obj?.selectedTags.map((t) => { return {id: t.id, tag: t.tag} }) : [],
            pdfLink: pdfSrc,
            type: "PDF",
            url: pdfSrc || obj?.assetUrl,
            title: obj?.heading || 'PDF file',
            metaData: {
                covers: finalCovers,
                docImages: obj?.docImages,
                icon: obj?.favIconImage || '',
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            description: obj?.description,
            fileType: "url",
        }

        const res = await dispatch(addPdfHighlight(payload))
        dispatch(updateBookmarkWithExistingCollection(res?.payload?.data, obj?.selectedCollection, false, "add", null))
        dispatch(getPdfDetails(pdfSrc))
        }
        // else {
        //     const formData = new FormData()
        //     formData.append("files", pdfFile)
        //     formData.append("title", obj.heading)
        //     formData.append("description", obj.description)
        //     formData.append("metaData", JSON.stringify({
        //         covers: finalCovers,
        //         defaultIcon: obj?.defaultFavIconImage || '',
        //         icon: obj?.favIconImage || null,
        //         docImages: obj?.docImages,
        //         defaultThumbnail: obj?.defaultThumbnailImg || ''
        //     }))
        //     formData.append("url", (obj.assetUrl && obj.assetUrl.endsWith('/')) ? obj.assetUrl?.slice(0, -1) : obj.assetUrl)
        //     formData.append("tags", JSON.stringify(obj.selectedTags.map((t) => { return t.id })))
        //     formData.append("notes", obj.remarks)
        //     formData.append("is_favourite", obj.favorite)
        //     formData.append("collections", obj.selectedCollection.id)
        //     formData.append("showThumbnail", obj.showThumbnail)
        //     formData.append("fileType", obj?.fileType)

        //     const audio = await dispatch(createPdf(formData))
        //     if (audio.error === undefined && audio.payload && audio.payload.error === undefined) {
        //         const { data } = audio.payload
        //         if (data) {
        //             dispatch(updateBookmarkWithExistingCollection(data, obj.selectedCollection, false, "add", null))
        //         }
        //     }
        // }
        setProcessing(false)
        setPdfFile(null)
        setPdfSrc("")
        navigate("/search-bookmark")
    }

    const onDownloadPDF = () => {
        if (pdfSrc) {
            const link = document.createElement('a');
            link.href = pdfSrc;
            link.download = pdfSrc;

            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    }

    const onCopyPDFLink = () => {
        try {
            copyText(pdfSrc)
            message.success('PDF Link Copied to clipboard');
        } catch (err) {
            message.error('Not have permission')
        }
    }

    const onFileChange = async (e) => {
        const { files } = e.target
        const file = files[0]
        const filePath = file.name;
        const allowedExtensions = /(\.pdf)$/i;
        if (!allowedExtensions.exec(filePath)) {
            message.error("File is not supported")
            return;
        }
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        if (fileSize > 25) {
            message.error('File size must be less than 25MB');
            setPdfFile(null)
            return
        }
        setPdfFile(file)
        setPdfSrc(URL.createObjectURL(file))
        setPDFFileName(file.name)
        const nameArr = filePath.split('.');
        nameArr.splice(-1);
        setPdfTitle(nameArr.join('.'));
    }

    const onUploadFileClick = () => {
        if (fileRef) {
            fileRef.current.click()
        }
    }

    const renderFileUpload = () => {
        return (
            <>
                <input type={"file"} className={"d-none"} onChange={onFileChange} ref={fileRef} accept='application/pdf' />
                <Button onClick={onUploadFileClick}>Upload PDF!</Button>
            </>
        )
    }

    const renderPDFThumbnail = () => {
        return (
            <div className="flex flex-col items-center justify-center truncate">
                <img src="/images/pdf.png" alt="pdf" class="w-20 h-20" />
                <a href={pdfSrc} target="_blank" rel="noreferrer"><span>{pdfFilename}</span></a>
            </div>
        )
    }

    const handleUpdateInformation = (gemObj) => {
        setDetails({...details,...gemObj})
    }

    const handleUploadInformation = (obj) => {
        setPdfFile(obj.pdfFile)
        setPdfSrc(obj.pdfSrc)
        setPDFFileName(obj.pdfName)
    }

    return (
        <OperationLayout currentGem={currentGem}
            processing={processing}
            onButtonClick={onSubmitBookmark}
            pageTitle={currentGem ? "Update PDF" : "Save PDF"}
            isHideBackButton={false}
            mediaType={"PDF"}
            onPanelClose={panelClose}
            title={pdfTitle}
            updateFileType={updateFileType}
            setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
            getUpdateInformation = {handleUpdateInformation}
            getUploadInformation = {handleUploadInformation}
            childPdfSrc={pdfSrc}
        >
            <div className="pt-4">
                {/* <div className="image-header">
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">PDF</h6>
                    {pdfSrc !== "" && <svg
                        onClick={onDownloadPDF}
                        className="dwldSvg"
                        title="Download"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z" /><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" /></svg>}
                    {pdfSrc !== "" && <svg
                        onClick={onCopyPDFLink}
                        className="linkSvg"
                        title="Copy Text"
                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z" /><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" /></svg>}
                </div> */}
                <div className='bg-[#F8FBFF] rounded-t-[16px] imgWrapperContainer'>
                    <div>
                        {pdfSrc !== "" ? renderPDFThumbnail() : fileType === "file" ? renderFileUpload() : null}
                    </div>
                </div>
            </div>
        </OperationLayout>
    )
}

export default UploadPDFPage