import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import './PDFPage.css'

import React, { useState,
       useEffect }              from "react";
import { useSelector,
         useDispatch }          from "react-redux";
import { useSearchParams,
         useNavigate }          from 'react-router-dom';
import { Viewer, Worker }       from '@react-pdf-viewer/core';
import { defaultLayoutPlugin }  from '@react-pdf-viewer/default-layout';
import { XMarkIcon,
         PencilSquareIcon,
         TrashIcon,
         XCircleIcon,
         CheckCircleIcon }      from '@heroicons/react/24/outline';
import { BsThreeDotsVertical }  from 'react-icons/bs'
import { RiCheckboxBlankCircleFill, 
         RiFileCopyLine }       from 'react-icons/ri'
import { v4 as uuidv4 }         from 'uuid'
import { message,
         Drawer,
         Space, 
         Popover,
         Spin}                  from "antd";
import {
    highlightPlugin,
}                               from '@react-pdf-viewer/highlight';

import Input                    from "../../components/input/Input";
import OperationLayout          from '../../components/layouts/OperationLayout'
import Modal                    from '../../components/modal/Modal';
import HighlightPage            from '../highlights/Highlight';
import { panelClose }           from "../../utils/message-operations";
import session                  from '../../utils/session';
import { HIGHLIGHTED_COLORS,
         PDF_IMG_LINK, 
         TEXT_MESSAGE}         from '../../utils/constants';
// import { copyText }             from '../../utils/message-operations';
import { findWords }            from '../../utils/find-words';
import { updateTags }           from '../../utils/update-tags';
import { removeDuplicates }     from '../../utils/equalChecks';

import { addPdfHighlight, 
         deletePdfHighlight, 
         getAllPdfHighlights, 
         getPdfDetails, 
         updatePdfHighlight}    from '../../actions/pdf';
import { addGemToSharedCollection, getAllCollections, moveGemToSharedCollection, removeGemFromCollection }    from '../../actions/collection';
import { setCurrentGem, 
         setCurrentMedia }      from '../../actions/gem';
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from '../../utils/find-collection-id';

const PDFPage = (props) => {
    let timer                               = null;
    const dispatch                          = useDispatch()
    // const navigate                          = useNavigate()
    const noteEles                          = new Map();
    const [searchParams]                    = useSearchParams()
    const file                              = searchParams.get("file")
    const oFile                             = searchParams.get("originalFile")
    // const currentGem                        = useSelector((state) => state.gem.currentGem);
    const pdfHighlights                     = useSelector((state) => state.pdfHighlights.pdfHighlights)
    const pdfDetails                        = useSelector((state) => state.pdfHighlights.pdfDetails)
    const userTags                          = useSelector((state) => state.user.userTags)
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [originalFile, setOriginalFile]   = useState(pdfDetails?.media?.url || oFile || "")
    const [fileLink, setFileLink]           = useState(pdfDetails?.media?.s3link || file || "")
    const [currentTags, setCurrentTags]     = useState([])
    const [selectedHighlightColor,
           setSelectedHighlightColor]       = useState(HIGHLIGHTED_COLORS[0])
    const [processing, setProcessing]       = useState(false)
    const [openDrawer, setOpenDrawer]       = useState(false)
    const [showForm, setShowForm]           = useState(false)
    const [isReading, setIsReading]         = useState(false)
    const [showHighlightForm, 
           setShowHighlightForm]            = useState(false)
    const [showConfirmButton, 
           setShowConfirmButton]            = useState({ value: false, index: ''});

    useEffect(() => {
        const getCall = async () => {
            setIsReading(true)
            await dispatch(getAllPdfHighlights(file))
            await dispatch(getAllCollections())
            await dispatch(getPdfDetails(file))
            setIsReading(false)
            setOriginalFile(oFile)
            setFileLink(file)
        }
        getCall()
        return () => {
            clearTimeout(timer)
        }
    }, [])

    const transform = (slot) => ({
        ...slot,
        SwitchThemeMenuItem: () => <></>,
        OpenMenuItem: () => <></>,
        Open: () => <></>,
        SwitchTheme: () => <></>,
    });

    const jumpToNote = (note) => {
        if (noteEles.has(note._id)) {
            noteEles.get(note._id).scrollIntoView();
        }
    };

    const onSubmitBookmark = async (obj) => {
        const imgURL       = obj.imageUrl !== "" ? obj.imageUrl : PDF_IMG_LINK
        const mediaCovers  = pdfDetails?.metaData?.covers ? [ imgURL, ...pdfDetails?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [imgURL]
        const finalCovers  = removeDuplicates(mediaCovers)
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null
        if (pdfDetails && pdfDetails.length > 0) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections,pdfDetails[0].id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,pdfDetails[0]?.collection_id || pdfDetails[0]?.parent?.id || pdfDetails[0]?.collection_gems || pdfDetails[0]?.collection_id?.id)
            setProcessing(true)
            let payload = {
                remarks: obj.remarks,
                expander: obj.shortUrlObj,
                s3link: pdfDetails[0]?.media?.s3link || file,
                pdfLink: file,
                collections: obj.selectedCollection.id,
                tags: obj.selectedTags ? obj.selectedTags.map((t) => { return {id: t.id, tag: t.tag} }) : [],
                type: 'PDF',
                url: obj.assetUrl,
                title: obj.heading,
                metaData: {
                    covers: finalCovers,
                    icon: obj?.favIconImage || '',
                    docImages: obj.docImages,
                    defaultIcon: obj?.defaultFavIconImage || '',
                    defaultThumbnail: obj?.defaultThumbnailImg || null,
                },
                fileType: "url",
                description: obj.description
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
                await dispatch(updatePdfHighlight(payload.collections,pdfDetails[0].id,payload))
                dispatch(removeGemFromCollection(pdfDetails[0].id || '', payload.collections || '',isCurrentCollectionShared))
                dispatch(moveGemToSharedCollection(obj.selectedCollection.id,pdfDetails[0].id,payload))
                await dispatch(getPdfDetails(file))
                setProcessing(false)
                onPDFFormClose()
            }
            await dispatch(updatePdfHighlight(payload.collections,pdfDetails[0].id,payload))
            setProcessing(false)
            await dispatch(getPdfDetails(file))
            onPDFFormClose()
            return 
        }
        setProcessing(true)
        let payload = {
            remarks: obj.remarks,
            s3link:  file,
            collections: obj.selectedCollection?.id,
            tags: obj.selectedTags ? obj.selectedTags.map((t) => { return {id: t.id, tag: t.tag} }) : [],
            pdfLink: file,
            type: "PDF",
            url: originalFile,
            title: obj.heading || 'PDF file',
            metaData: {
                covers: finalCovers,
                docImages: obj.docImages,
                icon: obj?.favIconImage || '',
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            description: obj.description,
            fileType: "url",
        }
        isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
                payload ={
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
        }
        await dispatch(addPdfHighlight(payload))
        if(isSelectedCollectionShared){
            dispatch(addGemToSharedCollection(obj.selectedCollection.id,payload))
        }
        setProcessing(false)
        await dispatch(getPdfDetails(file))
        onPDFFormClose()
    }

    const onSavePDFClick = () => {
        setShowForm(true)
        setOpenDrawer(true)
    }

    const onDeleteHighlight = async (highlight) => {
        const collectionId  = highlight.media.collections
        const gemId         = highlight.id

        const res           = await dispatch(deletePdfHighlight(collectionId, gemId))
        if (res.error === undefined) {
            await dispatch(getAllPdfHighlights(file))
        }

        setShowConfirmButton({value:false,index:''})
        message.open({
            type: res.error === undefined ? "success" : "error",
            content: res.error === undefined ? "Highlight deleted successfully" : "An error occured while processing your request."
        })
    }

    const onEditHighlight = (highlight, media) => {
        dispatch(setCurrentGem({ ...highlight, parent: { id: highlight.media.collections} }))
        dispatch(setCurrentMedia(media))
        setOpenDrawer(true)
        setShowHighlightForm(true)
    }

    const onSidebarClick = () => {
        setOpenDrawer(true)
        setShowForm(false)
    }

    const onPDFFormClose = () => {
        setOpenDrawer(false)
        setShowForm(false)
        setShowHighlightForm(false)
        setShowConfirmButton({value:false,index:'', obj: null})
        panelClose()
    }

    const onCloseHighlight = async () => {
        await dispatch(getAllPdfHighlights(file))
        onPDFFormClose()
        dispatch(setCurrentGem(null))
        dispatch(setCurrentMedia(null))
    }

    const onPDFLoaded = (e) => {
        timer = setTimeout(async () => {
            const { doc } = e
            const pageDoc = doc._transport.fontLoader._document
            const text    = pageDoc.body.innerText
            const tags    = findWords(text)
            const res     = await updateTags(tags, userTags)
            setCurrentTags([ ...res ])
        }, 1000)
    }

    const onColorClick = async (color, props, payload) => {
        const foundColor = HIGHLIGHTED_COLORS.filter(item => item.colorCode === color)
        let newPayload = {
            ...payload,
            colorCode: foundColor.length !== 0 ? foundColor[0] : payload.colorCode,
        }

        const res = await dispatch(addPdfHighlight(newPayload))
        if(res.error === undefined){
            await dispatch(getAllPdfHighlights(file))
        }

        setOpenDrawer(true)
        props.cancel();
    }

    const onOpenSidebar = (props) => {
        setOpenDrawer(true)
        props.cancel()
    }

    const onCopyText = (text, props) => {
        window.navigator.clipboard.writeText(text)
        message.success('Text Copied to clipboard');
        // try {
        //     copyText(text);
        //     alert('Text Copied to clipboard');
        //     props.cancel();
        // } catch (err) {
        //     console.log(err)
        //     alert('Not have permission')
        //     props.cancel();
        // }
    }

    const renderHighlightContent = (props) => {
        const payload = {
            collections: session.unfiltered_collection_id,
            tags: currentTags,
            comments:'',
            type: 'Highlight',
            text: props.selectedText,
            colorCode: selectedHighlightColor,
            box: {
                highlightAreas: props.highlightAreas
            },
            metaData: {
                covers: [PDF_IMG_LINK],
                docImages: [PDF_IMG_LINK],
                icon: { type: "image", icon: PDF_IMG_LINK },
                defaultIcon: PDF_IMG_LINK,
                defaultThumbnail: PDF_IMG_LINK,
            },
            s3link: file,
            _id: uuidv4(),
            title:props.selectedText,
            url: originalFile
        }

        return(
            <div
                style={{
                    background: '#eee',
                    display: 'flex',
                    position: 'absolute',
                    left: `${props.selectionRegion.left}%`,
                    top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
                    transform: 'translate(0, 8px)',
                    zIndex: 1,
                }}
            >
                <button className="pdf-menu-button">
                    <span className="pdf-yellowSpan" onClick={() => onColorClick('#FFFAB3', props, payload)}></span>
                    <span className="pdf-greenSpan" onClick={() => onColorClick('#D2F9C8', props, payload)}></span>
                    <span className="pdf-redSpan" onClick={() => onColorClick('#FFAFED', props, payload)}></span>
                    <span className="pdf-violetSpan" onClick={() => onColorClick('#C1C1FF', props, payload)}></span>

                    <span className="pdf-msgSpan" onClick={() => onOpenSidebar(props)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='message-svg'>
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M14.45 19L12 22.5 9.55 19H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6.55zm-1.041-2H20V5H4v12h6.591L12 19.012 13.409 17z" />
                        </svg>
                    </span>
                    <span className="pdf-tagSpan" onClick={() => onOpenSidebar(props)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='tag-svg'>
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                    </span>
                    <span className="pdf-copySpan" onClick={() => onCopyText(payload.text, props)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='copy-svg'>
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path
                                d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zm2 0h8v10h2V4H9v2z" />
                        </svg>
                    </span>
                </button>
            </div>
        ) 
    }

    const renderHighlights = (props) => {
        return (
            <div>
                {pdfHighlights?.map((note) => (
                    <div key={note.media._id}>
                        {note.media.box.highlightAreas
                            .filter((area) => area.pageIndex === props.pageIndex)
                            .map((area, idx) => (
                                <div
                                    key={idx}
                                    style={Object.assign(
                                        {},
                                        {
                                            background: note.media?.colorCode?.colorCode,
                                            opacity: 0.4,
                                        },
                                        props.getCssProperties(area, props.rotation)
                                    )}
                                    onClick={() => jumpToNote(note)}
                                    ref={(ref)=> {
                                        noteEles.set(note.media._id, ref );
                                    }}
                                />
                            ))}
                    </div>
                ))}
            </div>
        )
    }

    const renderHighlightTarget = (props) => {
        return props.toggle()
    }
    
    const renderToolbar = (Toolbar) => {
        return (
            <>
                <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                <div onClick={onSidebarClick} className='c-p' title="Open Sidebar" style={{marginRight:'20px'}}>
                    <svg width="20" height="22" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_2856_47919)">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M166.673 98.3454C170.875 101.082 174.304 103.316 178.341 106.189C184.635 110.63 188.692 115.428 190.487 119.709C191.512 122.295 192.026 125.056 191.999 127.839C191.998 131.26 191.308 134.647 189.971 137.794C189.056 140.143 187.681 142.284 185.926 144.09C184.171 145.895 182.072 147.329 179.755 148.304C177.893 149.021 175.897 149.317 173.908 149.172C171.92 149.027 169.987 148.444 168.248 147.466C166.427 146.507 164.829 145.173 163.558 143.55C162.286 141.928 161.371 140.055 160.872 138.053C160.171 135.24 160.798 127.407 164.683 127.728C166.904 127.91 167.485 130.135 167.924 131.816C168.048 132.293 168.161 132.727 168.297 133.057C169.785 136.696 173.141 137.041 175.096 135.709C178.021 133.723 176.927 129.886 176.177 128.492C174.53 125.433 171.444 122.953 165.986 119.857C163.53 118.521 160.968 117.391 158.327 116.477L158.131 116.403C156.545 115.823 154.873 115.268 153.213 114.75L151.185 114.096C151.143 116.85 151.287 119.603 151.615 122.337C152.63 130.292 155.771 137.156 157.563 141.073C158.072 142.185 158.472 143.059 158.684 143.654C161.487 151.524 161.966 156.113 161.487 161.048C160.946 166.797 158.106 176.184 149.402 180.231C146.461 181.727 143.22 182.537 139.922 182.599C136.624 182.661 133.355 181.974 130.36 180.588C123.906 177.504 122.049 173.927 120.218 168.992C119.307 166.604 118.914 164.049 119.064 161.496C119.215 158.944 119.905 156.453 121.091 154.189C122.966 150.896 126.057 148.477 129.696 147.453C134.158 146.207 137.33 148.453 137.441 150.698C137.515 152.24 135.498 154.51 134.773 155.262C133.04 157.076 131.601 163.49 135.498 165.958C139.199 168.277 146.243 165.711 146.968 159.469C147.78 152.536 145.235 138.411 134.859 123.879C129.24 115.748 126.178 106.115 126.069 96.2208V95.8014V95.382C126.178 85.4883 129.24 75.8545 134.859 67.7241C145.235 53.192 147.78 39.067 146.968 32.134C146.243 25.8919 139.186 23.3259 135.498 25.6452C131.601 28.0877 133.003 34.5272 134.773 36.3407C135.498 37.0932 137.515 39.3631 137.441 40.9051C137.33 43.1503 134.158 45.3831 129.696 44.1495C126.057 43.126 122.966 40.7064 121.091 37.4139C119.905 35.1502 119.215 32.6591 119.064 30.1066C118.914 27.554 119.307 24.9986 120.218 22.6104C122.049 17.6883 123.893 14.0984 130.36 11.0144C133.355 9.62921 136.624 8.94189 139.922 9.00385C143.22 9.0658 146.461 9.87541 149.402 11.3721C158.106 15.4184 160.946 24.8063 161.487 30.555C161.966 35.4648 161.487 40.0662 158.684 47.9491C158.471 48.5712 158.048 49.5008 157.507 50.6885C155.711 54.6357 152.617 61.4334 151.615 69.2661C151.287 72.0001 151.143 74.7533 151.185 77.5067L153.213 76.8529C154.824 76.3348 156.496 75.7797 158.131 75.1999L158.327 75.1258C160.968 74.2118 163.53 73.0813 165.986 71.7457C171.444 68.674 174.53 66.1944 176.177 63.1103C176.927 61.7163 178.021 57.8798 175.096 55.8936C173.141 54.5613 169.785 54.9191 168.297 58.5459C168.161 58.8761 168.048 59.3095 167.924 59.7868C167.485 61.4674 166.904 63.6926 164.683 63.8752C160.798 64.1959 160.171 56.3624 160.872 53.5497C161.371 51.5478 162.286 49.6744 163.558 48.0523C164.829 46.4302 166.427 45.096 168.248 44.1372C169.987 43.1585 171.92 42.576 173.908 42.4311C175.897 42.2861 177.893 42.5822 179.755 43.2983C182.072 44.2742 184.171 45.7074 185.926 47.513C187.681 49.3185 189.056 51.4595 189.971 53.8088C191.308 56.9563 191.998 60.3425 191.999 63.7642C192.025 66.5468 191.511 69.3079 190.487 71.8938C188.692 76.2238 184.635 81.0473 178.341 85.4636C173.726 88.6934 169.915 91.1847 164.819 94.5157C164.173 94.9379 163.506 95.3736 162.814 95.8261C164.187 96.7259 165.462 97.5566 166.673 98.3454ZM118.804 123.274C120.07 123.916 120.771 124.483 120.931 125.026C121.002 126.036 120.71 127.039 120.107 127.851C106.867 151.228 79.8213 163.86 52.7757 159.259C27.021 154.904 5.88856 133.637 1.41375 107.558C0.980679 105.044 0.703622 102.441 0.434041 99.9086L0.39339 99.5269L0.393384 99.5268C0.270451 98.2932 0.147519 97.0596 0 95.826C0.0758392 81.7211 4.75234 68.029 13.3147 56.8429C21.877 45.6567 33.8541 37.5918 47.4151 33.881C60.9762 30.1701 75.3751 31.0175 88.4109 36.2936C101.447 41.5696 112.402 50.9841 119.603 63.0979C120.685 64.825 121.066 66.071 120.832 66.7988C120.599 67.5266 119.652 68.2545 117.943 69.0317C108.551 73.2753 99.5892 72.5228 90.5412 66.7494C76.3423 57.6823 56.3409 58.3485 42.9902 68.3162C31.4958 76.9145 26.6399 88.3379 28.9756 101.353C31.5204 115.576 40.7774 125.334 55.7385 129.59C68.6712 133.254 80.5589 131.638 91.0452 124.767C100.056 118.858 109.141 118.34 118.804 123.274ZM70.4661 107.126H73.9451C75.2297 107.126 76.4617 107.638 77.3701 108.55C78.2784 109.461 78.7887 110.698 78.7887 111.987C78.7887 113.276 78.2784 114.512 77.3701 115.424C76.4617 116.335 75.2297 116.847 73.9451 116.847H70.4661C69.1815 116.847 67.9495 116.335 67.0411 115.424C66.1327 114.512 65.6224 113.276 65.6224 111.987C65.6224 110.698 66.1327 109.461 67.0411 108.55C67.9495 107.638 69.1815 107.126 70.4661 107.126ZM73.9451 74.7803H70.4661C69.1815 74.7803 67.9495 75.2924 67.0411 76.2039C66.1327 77.1154 65.6224 78.3517 65.6224 79.6408C65.6224 80.9299 66.1327 82.1662 67.0411 83.0777C67.9495 83.9892 69.1815 84.5013 70.4661 84.5013H73.9451C75.2297 84.5013 76.4617 83.9892 77.3701 83.0777C78.2784 82.1662 78.7887 80.9299 78.7887 79.6408C78.7887 78.3517 78.2784 77.1154 77.3701 76.2039C76.4617 75.2924 75.2297 74.7803 73.9451 74.7803Z" fill="#105FD3"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_2856_47919">
                                <rect width="192" height="192" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>
                </div>
                <div className="c-p" title="Save PDF file" style={{marginRight:'20px'}} onClick={onSavePDFClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18 19h1V6.828L17.172 5H16v4H7V5H5v14h1v-7h12v7zM4 3h14l2.707 2.707a1 1 0 0 1 .293.707V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 11v5h8v-5H8z"/></svg>
                </div>
            </>
        )
    }

    const renderForm = () => {
        let pdfObj = null
        if (pdfDetails && pdfDetails.length > 0) {
            let pdf = pdfDetails[0]
            pdfObj = { 
                ...pdf,
                tags: pdf.tags || pdf?.media?.tags || [],
                collection_gems: { id: pdf?.media?.collections },
                collection_id: pdf?.media?.collections,
            }
        }
        return (
            <OperationLayout currentGem={pdfObj}
                             processing={processing}
                             onButtonClick={onSubmitBookmark}
                             isHideHeader={true}
                             requestURL={oFile}
                             layoutTags={currentTags}
                             mediaType={"PDF"}
                             childPdfSrc={file}
                             >
                <div className='pt-4'>
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Original URL</h6>
                    <Input size="medium w-full mb-2" type="text" name="url" placeholder="Original Url" 
                           value={originalFile} 
                           disabled />
                </div>
                <div className='pt-4'>
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">File Link</h6>
                    <Input size="medium w-full mb-2" type="text" name="url" placeholder="S3 url" 
                           value={fileLink} 
                           disabled
                    />
                </div>
                <div className="flex flex-col items-center justify-center truncate">
                    <img src="/images/pdf.png" alt="pdf" class="w-20 h-20" />
                    <a href={originalFile} target="_blank" rel="noreferrer"><span>{originalFile?.split("/").pop()}</span></a>
                </div>
            </OperationLayout>
        )
    }

    const renderPopoverActions = (p, i) => {
        return (
            <div className="popover-container">
                <button onClick={() => onEditHighlight(p, p.media)} className={"popover-btn"}>
                    <PencilSquareIcon className='w-5 h-5 text-gray-800 hover:text-gray-500'  /><span>{`Edit`}</span>
                </button>
                <button onClick={() => setShowConfirmButton({value:true, index:i, obj: p})} className={"popover-btn"}>
                    <TrashIcon className='w-5 h-5 text-gray-800 hover:text-gray-500' color="#C85C54" /><span className="red-text-clr">{`Delete`}</span>
                </button>
            </div>
        )
    }

    const renderHighlightList = () => {
        if (pdfHighlights.length === 0) return <div className='flex flex-col gap-4 p-4'><h4>There are no highlights for this page.</h4></div>
        return (
            <div className='flex flex-col gap-4 p-4'>
                {pdfHighlights.map((p, i) => {
                    return (
                        <div>
                            <div className='border-[1px] border-gray-300 border-b-0 rounded-b-0 rounded-sm py-2 pr-2'>
                                <div className={`py-1 pl-3 border-l-4 ${p.media?.colorCode?.border || "border-pink-500"}`}>
                                    <div className='flex justify-start items-start gap-2'
                                         onClick={() => jumpToHighlightArea(p.media.box.highlightAreas[0])}>
                                        <p className={`flex-1 text-xs text-gray-600`}>{p.media?.text || "Curateit"}</p>
                                        <div>
                                            <RiCheckboxBlankCircleFill className={`h-4 w-4 ${p.media?.colorCode && p.media.colorCode.text ? p.media.colorCode.text : "text-pink-400"} mb-3`} />
                                            <RiFileCopyLine className='h-4 w-4 text-gray-500' onClick={() => onCopyText(p.media?.text, props)} />
                                        </div>
                                    </div>
                                </div>
                                {/* <div>
                                    <button onClick={() => onEditHighlight(p, p.media)} style={{marginRight:'10px'}}>
                                        <PencilSquareIcon className='w-5 h-5 text-gray-800 hover:text-gray-500'  />
                                    </button>
                                    {
                                        (showConfirmButton.value && showConfirmButton.index === i) 
                                            ? <>
                                                <button onClick={() => setShowConfirmButton({value:false,index:''})} style={{marginRight:'10px'}}>
                                                    <XCircleIcon className='w-5 h-5 text-red-800 hover:text-red-500' />
                                                </button>
        
                                                <button onClick={() => onDeleteHighlight(p)}>
                                                    <CheckCircleIcon className='w-5 h-5 text-green-800 hover:text-green-500' />
                                                </button>
                                            </>
                                            : 
                                                <button onClick={() => setShowConfirmButton({value:true, index:i})}>
                                                    <TrashIcon className='w-5 h-5 text-gray-800 hover:text-gray-500' />
                                                </button>
                                    }
                                </div> */}
                            </div>
                            <div className='pl-4 border-[1px] border-gray-300 border-t-0 rounded-t-0 rounded-sm'>
                                <hr className='w-full bg-gray-300 -mr-5' />
                                <div className='text-gray-500 flex justify-end items-center py-2 pr-1'>
                                    <div className='flex justify-end items-center gap-2'>
                                        <Popover placement="bottomLeft" content={renderPopoverActions(p, i)}>
                                            <button>
                                                <BsThreeDotsVertical className="h-4 w-4" />
                                            </button>
                                        </Popover>
                                    </div>
                                </div>
                            </div>
                            {showConfirmButton.value && showConfirmButton.obj === p &&
                                <Modal showOpen={showConfirmButton.value}
                                    deleteCollections={() => onDeleteHighlight(p)}
                                    cancel={() => setShowConfirmButton({value:false,index:'',obj: null})}
                                    collectionName={""} />
                            }
                        </div>
                    )
                })}
            </div>
        )
    }

    const defaultLayoutPluginInstance       = defaultLayoutPlugin({
        renderToolbar,
        sidebarTabs: (defaultTabs) => [
            defaultTabs[0],
        ],
    });
    const { renderDefaultToolbar }          = defaultLayoutPluginInstance.toolbarPluginInstance;

    const highlightPluginInstance           = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights,
    });
    const { jumpToHighlightArea }           = highlightPluginInstance;

    const renderPDFViewer = () => {
        return (
            <div className="pdfWrapperDiv">
                <Worker workerUrl={"/scripts/pdf-worker.min.js"}>
                    <div
                        style={{
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            height: '100%',
                            overflow: 'hidden',
                        }}>
                        <div
                            style={{
                                flex: '1 1 0',
                                overflow: 'auto',
                                }}
                        >
                            <Viewer
                                fileUrl={file}
                                onDocumentLoad={onPDFLoaded}
                                plugins={[
                                    defaultLayoutPluginInstance,
                                    highlightPluginInstance
                                ]}
                            />
                        </div>
                    </div>
                </Worker>
            </div>
        )
    }

    const renderPDFFormDrawer = () => {
        return (
            <Drawer 
                closable={false}
                maskClosable={false}
                className={"pdf-drawer"}
                extra={
                    <Space>
                        <div className='h-6 w-6 rounded-sm bg-[#C85C54] cursor-pointer'>
                            <XMarkIcon className="h-6 w-6 text-white p-1" onClick={onPDFFormClose} />
                        </div>
                    </Space>
                }
                title={
                    <>
                        <div className='flex justify-between items-center'>
                            <span>PDF Details</span>
                        </div>
                    </>
                } 
                placement="right" 
                onClose={onPDFFormClose} 
                open={openDrawer}>
                {showForm ? renderForm() : showHighlightForm ? <HighlightPage isHideHeader={true} onClose={onCloseHighlight} /> : renderHighlightList()}
            </Drawer>
        )
    }
    
    return (
        <>
            {
                !isReading 
                    ? renderPDFViewer() 
                    : <div style={{width:'100vw',height:'100vh', display:'flex',justifyContent:'center',alignItems:'center'}}>
                            <Spin size='middle' tip='Loading...'/>
                        </div>
            }
            {openDrawer && renderPDFFormDrawer()}
        </>
    )
}

export default PDFPage