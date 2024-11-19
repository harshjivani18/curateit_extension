import { useSearchParams } from "react-router-dom";
import React, { useState } from 'react'
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import {
    highlightPlugin,
} from '@react-pdf-viewer/highlight';
// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import { Drawer, message, Space, Spin } from "antd";
import session from "../utils/session";
import { v4 as uuidv4 } from 'uuid';
import { CheckIcon, PencilSquareIcon, TrashIcon, XMarkIcon,XCircleIcon,CheckCircleIcon } from '@heroicons/react/24/outline'
import BookmarkFooter from "../components/bookmarkFooter/BookmarkFooter";
import { WithContext as ReactTags } from 'react-tag-input';
import TypeComboBox from "../components/combobox/TypeComboBox";
import ComboBox from "../components/combobox/ComboBox";
import { useSelector } from "react-redux";
import { addTag } from "../actions/tags";
import { KEY_CODES } from "../utils/constants";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getAllCollections } from "../actions/collection";
import { addPdfHighlight, deletePdfHighlight, getAllPdfHighlights, getPdfDetails, getSinglePdfHighlight, singlePdfHighlightReset, updatePdfHighlight } from "../actions/pdf";
import Input from "../components/input/Input";
import Button from "../components/Button/Button";
import { copyText } from '../utils/message-operations'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const hightlightColors = [
  {
    id:1,
    border: "border-l-violet-500",
    bg: "#C1C1FF",
    text: "text-violet-500",
    colorCode: '#C1C1FF',
  },
  {
    id:2,
    border: "border-l-pink-500",
    bg: "#FFAFED",
    text: "text-pink-500",
    colorCode: '#FFAFED',
  },
  {
    id:3,
    border: "border-l-green-300",
    bg: "#D2F9C8",
    text: "text-green-300",
    colorCode: '#D2F9C8',
  },
  {
    id:4,
    border: "border-l-yellow-200",
    bg: "#FFFAB3",
    text: "text-yellow-200",
    colorCode: '#FFFAB3',
  }
]


const PdfHighlight = () => {
    const dispatch = useDispatch()
    const [searchParams] = useSearchParams()
    const file = searchParams.get('file')
    const originalFile = searchParams.get('originalFile')
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [pdfDetailsDrawerOpen, setPdfDetailsDrawerOpen] = useState(false);

    const [showTab,setShowTab] = useState(true)
    const [selectedTags, setSelectedTags] = useState([]);
    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [error, setError] = useState(false)
    const [selectedHighlight, setselectedHighlight] = useState(hightlightColors[0]);
    const [showConfirmButton, setShowConfirmButton] = useState({ value: false, index: ''});
    const [comments, setComments] = useState('');
    const [highlightTitle, setHighlightTitle] = useState('');

  //states
  
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedType, setSelectedType] = useState('');

    const pdfHighlights       = useSelector((state) => state.pdfHighlights.pdfHighlights);
    const pdfDetails       = useSelector((state) => state.pdfHighlights.pdfDetails);
    const singlePdfHighlight       = useSelector((state) => state.pdfHighlights.singlePdfHighlight);
    const collections       = useSelector((state) => state.collection.collectionData);
    const userTags          = useSelector((state) => state.user.userTags)
    const [loading, setLoading] = useState(false)
    const [loadingState, setLoadingState] = useState(false)
    const [gemSingleId, setGemSingleId] = useState('')
    const [loadingBtn, setLoadingBtn] = useState(false)

    //states for pdf
    const [pdfTitle, setPdfTitle] = useState('')
    const [pdfDescription, setPdfDescription] = useState('')
    const [pdfComments, setPdfComments] = useState('')
    const [selectedPdfCollection, setSelectedPdfCollection] = useState('');
    const [selectedPdfType, setSelectedPdfType] = useState('');
    const [selectedPdfTags, setSelectedPdfTags] = useState([]);
    const [pdfTitleError, setPdfTitleError] = useState(false)


    useEffect(() => {
        const getCall = async () => {
            setLoading(true)
            //get all highlights
            const res = await dispatch(getAllPdfHighlights(file))
            await dispatch(getAllCollections())
            await dispatch(getPdfDetails(file))
            if(res){
                setLoading(false)
            }
        }

        getCall()
    },[])

    useEffect(() => {
    if(singlePdfHighlight && singlePdfHighlight.length>0){
        setSelectedTags(singlePdfHighlight[0].media.tags || [])
        setSelectedCollection(singlePdfHighlight[0]?.collection_gems || '')
        setSelectedType(singlePdfHighlight[0].media.type || '')
        setComments(singlePdfHighlight[0].media.comments || '')
        setselectedHighlight(singlePdfHighlight[0].media.colorCode)
        setHighlightTitle(singlePdfHighlight[0].media.title)
    }
  }, [singlePdfHighlight]);

    //highlights

    useEffect(() => {
        if(pdfDetails && pdfDetails.length>0){
            setPdfTitle(pdfDetails[0]?.media?.title)
            setPdfDescription(pdfDetails[0]?.media?.description)
            setPdfComments(pdfDetails[0]?.media?.comments)
            setSelectedPdfType('PDF')
            setSelectedPdfTags(pdfDetails[0]?.media?.tags)
            const foundCollection = collections.filter(item => item.id === pdfDetails[0]?.media?.collections)
            setSelectedPdfCollection(foundCollection[0] || pdfDetails[0]?.media?.collections)
        }
    },[pdfDetails])
   
    
    const noteEles = new Map();
  
    const handleSideBar = () => {
        setDrawerOpen(true)
    }

    const handlePdfDetailSidebar = () => {
        setPdfDetailsDrawerOpen(true)
    }
    
    const transform = (slot) => ({
        ...slot,
        SwitchThemeMenuItem: () => <></>,
        OpenMenuItem: () => <></>,
        Open: () => <></>,
        SwitchTheme: () => <></>,
    });

    const renderToolbar = (Toolbar) => (
        <>
        <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
        <div onClick={handleSideBar} className='c-p' title="Open Sidebar" style={{marginRight:'20px'}}>
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
        <div className="c-p" title="Save PDF file" style={{marginRight:'20px'}} onClick={handlePdfDetailSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18 19h1V6.828L17.172 5H16v4H7V5H5v14h1v-7h12v7zM4 3h14l2.707 2.707a1 1 0 0 1 .293.707V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4 11v5h8v-5H8z"/></svg>
        </div>
        </>
    );
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar,
        sidebarTabs: (defaultTabs) => [
            defaultTabs[0],
        ],
    });
    const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;


    //highlights plugin
    const renderHighlightTarget = (props) => (
        props.toggle()
    );



    const renderHighlightContent = (props) => {
        const payload = {
            collections: session.unfiltered_collection_id,
            tags:[],
            comments:'',
            type: 'Highlight',
            text: props.selectedText,
            colorCode: selectedHighlight,
            box: {
                highlightAreas: props.highlightAreas
            },
            s3link: file,
            _id: uuidv4(),
            title:props.selectedText,
            url: originalFile
        }

        const handleColor = async (color) => {
            const foundColor = hightlightColors.filter(item => item.colorCode === color)
            let newPayload = {
                ...payload,
                colorCode: foundColor.length !== 0 ? foundColor[0] : payload.colorCode,
            }

            const res = await dispatch(addPdfHighlight(newPayload))
            if(res.error === undefined){
                await dispatch(getAllPdfHighlights(file))
            }

            setDrawerOpen(true)
            props.cancel();
        }

        const openSidebar = () => {
            setDrawerOpen(true)
            props.cancel();
        }

        const handleCopyText = (text) => {
            try {
                copyText(text);
                alert('Text Copied to clipboard');
                props.cancel();
            } catch (err) {
                alert('Not have permission')
                props.cancel();
            }
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
                <span className="pdf-yellowSpan" onClick={() => handleColor('#FFFAB3')}></span>
                <span className="pdf-greenSpan" onClick={() => handleColor('#D2F9C8')}></span>
                <span className="pdf-redSpan" onClick={() => handleColor('#FFAFED')}></span>
                <span className="pdf-violetSpan" onClick={() => handleColor('#C1C1FF')}></span>

                <span className="pdf-msgSpan" onClick={openSidebar}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='message-svg'>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M14.45 19L12 22.5 9.55 19H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6.55zm-1.041-2H20V5H4v12h6.591L12 19.012 13.409 17z" />
                    </svg>
                </span>
                <span className="pdf-tagSpan" onClick={openSidebar}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='tag-svg'>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                    </svg>
                </span>
                <span className="pdf-copySpan" onClick={() => handleCopyText(payload.text)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="24" id='copy-svg'>
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path
                            d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zm2 0h8v10h2V4H9v2z" />
                    </svg>
                </span>
            </button>
        </div>
        ) 
    };


    const jumpToNote = (note) => {
        if (noteEles.has(note._id)) {
            noteEles.get(note._id).scrollIntoView();
        }
    };

    const renderHighlights = (props) => {
        return(<div>
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
                                        background: note.media.colorCode.colorCode,
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
        </div>)
    }

    const highlightPluginInstance = highlightPlugin({
        renderHighlightTarget,
        renderHighlightContent,
        renderHighlights,
    });

    const { jumpToHighlightArea } = highlightPluginInstance;

    const handleCloseDrawer = () => {
        setDrawerOpen(false)
        setShowConfirmButton({value: false, index: ''})
        setShowTab(true)
        dispatch(singlePdfHighlightReset())
        resetValues()
    }
    
    const deleteHighlight = async(note)=> {
        const collectionId = note.media.collections
        const gemId = note.id

        const res = await dispatch(deletePdfHighlight(collectionId,gemId))
        if(res.error === undefined){
            setShowConfirmButton({value:false,index:''})
            await dispatch(getAllPdfHighlights(file))
            message.success('Highlight deleted successfully');
        }else{
        message.error('Error Occurred');
        }
    }

    const switchToHighlighTab = () => {
        setShowTab(true)
        dispatch(singlePdfHighlightReset())
        resetValues()
    }

    const navigateToEdit = async(note) => {
        const gemId = note.id
        const collectionId = note.media.collections

        setShowTab(false)
        setLoadingState(true)
        setGemSingleId(gemId)
        const res = await dispatch(getSinglePdfHighlight(collectionId,gemId))
        if(res){
            setLoadingState(false)
        }
    }

    const onTagDelete = (i) => {
    selectedTags.splice(i, 1)
    setSelectedTags([ ...selectedTags ])
  }

  const onTagAdd = async (tag) => {
    const existingIdx = userTags?.findIndex((t) => { return t.tag === tag.text })
    if (existingIdx !== -1) {
      setSelectedTags([ ...selectedTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }])
    }
    else {
      const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
      if (res.error === undefined && res.payload.error === undefined) {
        setSelectedTags([ ...selectedTags, { id: res.payload?.data?.data?.id, tag: tag.text } ])
      }
      return res;
    }
    
  }

  const resetValues = () => {
    setSelectedTags([])
    setSelectedCollection('')
    setSelectedType('')
    setComments('')
    setselectedHighlight('')
    setHighlightTitle('')
  }

  const submitHandler = async () => {
    setError(false)
    if (selectedCollection?.id === undefined) {
      setError(true)
      return;
    }
    setLoadingBtn(true)
    const payload = {
        comments: comments,
        s3link:  file,
        collections: selectedCollection?.id,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type:typeof selectedType === "object" ? selectedType?.name : 'Highlight',
        _id: singlePdfHighlight[0].media._id,
        box: singlePdfHighlight[0].media.box,
        text: singlePdfHighlight[0].media.text,
        colorCode: selectedHighlight,
        url: originalFile,
        title: highlightTitle
      }

    const res = await dispatch(updatePdfHighlight(payload.collections,gemSingleId,payload))
    
    if(res.error === undefined){
      await dispatch(getAllPdfHighlights(file))
      setGemSingleId('')
      setLoadingBtn(false)
      dispatch(singlePdfHighlightReset())
      setShowTab(true)
      resetValues()
    }else{
      await dispatch(getAllPdfHighlights(file))
      setGemSingleId('')
      setLoadingBtn(false)
      dispatch(singlePdfHighlightReset())
      setShowTab(true)
      resetValues()
    }
  }

  const handleCopy = async (text) => {
    if(text){
        try {
            copyText(text);
            message.success('Text Copied to clipboard');
        } catch (err) {
            message.error('Not have permission')
        }
    }
  }

  const onTagPdfDelete = (i) => {
    selectedPdfTags.splice(i, 1)
    setSelectedPdfTags([ ...selectedPdfTags ])
  }

  const onTagPdfAdd = async (tag) => {
    const existingIdx = userTags?.findIndex((t) => { return t.tag === tag.text })
    if (existingIdx !== -1) {
      setSelectedPdfTags([ ...selectedPdfTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }])
    }
    else {
      const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
      if (res.error === undefined && res.payload.error === undefined) {
        setSelectedPdfTags([ ...selectedPdfTags, { id: res.payload?.data?.data?.id, tag: tag.text } ])
      }
      return res;
    }
    
  }

  const handleClosePdfDetailsDrawer = () => {
        setPdfDetailsDrawerOpen(false)
        resetValues()
    }

  const handleSubmitPdfDetails = async() => {
    setError(false)
    if (selectedPdfCollection?.id === undefined) {
      setError(true)
      return;
    }
    if (pdfTitle === '') {
      setPdfTitleError(true)
      return;
    }
    setLoadingBtn(true)
    
    if(pdfDetails && pdfDetails.length>0){
        const payload = {
        comments: pdfComments,
        s3link: pdfDetails[0]?.media?.s3link || file,
        collections: selectedPdfCollection?.id,
        tags: selectedPdfTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type: 'PDF',
        url: pdfDetails[0]?.media?.url || originalFile,
        title: pdfTitle,
        description: pdfDescription
      }

    const res = await dispatch(updatePdfHighlight(payload.collections,pdfDetails[0].id,payload))
    
    if(res.error === undefined){
      await dispatch(getPdfDetails(file))
      setLoadingBtn(false)
      setPdfDetailsDrawerOpen(false)
      setPdfTitleError(false)
    }else{
      await dispatch(getPdfDetails(file))
      setLoadingBtn(false)
      setShowTab(true)
      setPdfDetailsDrawerOpen(false)
      setPdfTitleError(false)
    }

    return;
    }else{
    const payload = {
            comments: pdfComments,
            s3link: file,
            collections: selectedPdfCollection?.id,
            tags: selectedPdfTags.map((t) => { return {id: t.id, tag: t.tag} }),
            type:'PDF',
            url: originalFile,
            title: pdfTitle,
            description: pdfDescription
        }

        const res = await dispatch(addPdfHighlight(payload))
        
        if(res.error === undefined){
        await dispatch(getPdfDetails(file))
        setLoadingBtn(false)
        setPdfDetailsDrawerOpen(false)
        setPdfTitleError(false)
        }else{
        await dispatch(getPdfDetails(file))
        setLoadingBtn(false)
        setShowTab(true)
        setPdfTitleError(false)
        setPdfDetailsDrawerOpen(false)
        }
    }
  }

  const prepareTags = () => {
    const tagArr = []
    userTags.forEach((t) => {
      if (t.tag) {
        tagArr.push({
          id: t.tag,
          text: t.tag
        })
      }
    })
    return tagArr
  }


    return(
        <>
           {
            loading ? 
            <>
                <div style={{width:'100vw',height:'100vh', display:'flex',justifyContent:'center',alignItems:'center'}}>
                    <Spin size='middle' tip='Loading...'/>
                </div>
            </>
            : 

            <>
            <div className="pdfWrapperDiv">
                <Worker workerUrl={"/scripts/pdf-worker.min.js"}>
                    <div
                        style={{
                            border: '1px solid rgba(0, 0, 0, 0.3)',
                            display: 'flex',
                            height: '100%',
                            overflow: 'hidden',
                        }}
                        >
                        <div
                            style={{
                                flex: '1 1 0',
                                overflow: 'auto',
                                }}
                        >
                            <Viewer
                                fileUrl={file}
                                plugins={[
                                    defaultLayoutPluginInstance,
                                    highlightPluginInstance
                                ]}
                            />
                       </div>
                    </div>
                </Worker>
            </div>

            {
                drawerOpen ? 
                <Drawer 
                closable={false}
                maskClosable={false}
                extra={
                <Space>
                    <div className='h-6 w-6 rounded-sm bg-[#C85C54] cursor-pointer'>
                      <XMarkIcon className="h-6 w-6 text-white p-1" 
                        onClick={handleCloseDrawer}
                        />
                    </div>
                </Space>
                }
                title={
                    <>
                    <div className='flex justify-between items-center'>
                        <div className='flex justify-start items-center p-0'>
                            <h1
                                className={classNames(showTab ? 'text-black' : 'bg-blue-500 border-blue-500 text-white', 'cursor-pointer px-3 py-2 border-2 border-r-0 rounded-l-lg')}>
                                    Info
                            </h1>
                            <h1 onClick={() => switchToHighlighTab()}
                                className={classNames(showTab ? 'bg-blue-500 border-blue-500 text-white' : 'text-black', 'cursor-pointer px-3 py-2 border-2 border-l-0 rounded-r-lg')}>
                                    Highlights 
                            </h1>
                        </div>
                    </div>
                    </>
                } 
                placement="right" 
                onClose={handleCloseDrawer} 
                open={drawerOpen}>
                    <>
                    {
                        showTab ? 
                        // all
                        <>
                        {
                        pdfHighlights.length>0 ? pdfHighlights.map((note,i) => (
                            <div className='mt-4'>
                        <div
                            className="border-b-[1px] border-[rgda(0,0,0,0.3)] p-1 pb-2"
                        >
                            <blockquote
                                style={{ borderColor: note.media.colorCode.colorCode }}
                                className='border-l-4 text-justify pl-3 mb-2 cursor-pointer'
                                onClick={() => jumpToHighlightArea(note.media.box.highlightAreas[0])}
                            >
                                {note.media.text} 
                            </blockquote>
                            <div>
                                <button 
                                onClick={() => navigateToEdit(note)}
                                style={{marginRight:'10px'}}
                                >
                                    <PencilSquareIcon className='w-5 h-5 text-gray-800 hover:text-gray-500'  />
                                </button>

                                {
                                    (showConfirmButton.value && showConfirmButton.index === i) ? <>
                                    <button 
                                    onClick={() => setShowConfirmButton({value:false,index:''})}
                                    style={{marginRight:'10px'}}
                                    >
                                        <XCircleIcon className='w-5 h-5 text-red-800 hover:text-red-500' />
                                    </button>

                                    <button 
                                    onClick={() => deleteHighlight(note)}
                                    >
                                        <CheckCircleIcon className='w-5 h-5 text-green-800 hover:text-green-500' />
                                    </button>
                                    </>
                                    : 
                                    <button 
                                    onClick={() => setShowConfirmButton({value:true, index:i})}
                                    >
                                        <TrashIcon className='w-5 h-5 text-gray-800 hover:text-gray-500' />
                                    </button>
                                }

                                
                            </div>
                            
                        </div>
                            </div>
                        ))
                        :
                        <div style={{ textAlign: 'center' }}>There is no Highlights</div>
                        }
                        </> 
                        
                        : 
                        

                        //single
                        <>
                            {
                                loadingState ? 
                                <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
                                    <Spin size='middle' tip='Loading...'/>
                                </div>
                                : 

                                <>
                                <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] '>
                                    <div className='ct-relative' onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }} >
                                <div className='bg-white rounded-md p-2 border-2'>
                                    <div>
                                    <svg 
                                    className='pdf-highlight-copy-svg'
                                    onClick={() => handleCopy(singlePdfHighlight[0]?.media.text || '')}
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/></svg>
                                        <div 
                                        style={{height:'auto'}}
                                        className={classNames(selectedHighlight?.border ,'flex-1 text-xs text-gray-500 border-l-4 pl-2 py-0 outline-none w-full')} 
                                        >
                                        {singlePdfHighlight[0]?.media.text || ''}
                                        </div>
                                    </div>
                                    <div className='flex justify-end items-baseline space-x-3'>
                                        <div className='flex justify-end space-x-2 items-center'>
                                            {hightlightColors?.map(color => (
                                            <button 
                                                key={color.id} 
                                                style={{backgroundColor: `${color.bg}`}}
                                                className={classNames('flex justify-center items-center h-4 w-4 rounded-full border-[1px] border-gray-400')}
                                                onClick={() => { 
                                                setselectedHighlight(color)
                                                }}
                                            >
                                                <CheckIcon 
                                                className={classNames(color.id === selectedHighlight?.id ? "" : color.text,'h-2 w-2')} 
                                                />
                                            </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                                {/* title */}
                                <div className='pt-4'>
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">Title</h6>
                                <Input size="medium w-full mb-2" type="text" name="url" placeholder="Enter Title" 
                                value={highlightTitle} 
                                onChange={(e) => setHighlightTitle(e.target.value)}
                                />

                                </div>
                                <div className='pt-6 flex justify-between space-x-2'>
                                {/* Collections */}
                                <div className="flex-1">
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Collections</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                    <div onClick={() => setShowCollectionInput(true)} className="w-full">
                                        <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} setSelectedCollection = {setSelectedCollection} selectedCollection={selectedCollection} error={error}/>
                                    </div>
                                    </div>
                                </div>
                                {/* Types */}
                                <div className={classNames("flex-1", showCollectionInput && 'hidden')}>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Type</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                    <div 
                                    // onClick={() => setShowTypeInput(true)} 
                                    className="w-full">
                                        <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType} type={'Highlight'}/>
                                    </div>
                                    </div>
                                </div>
                                </div>
                                {/* TAGS */}
                                <div className='pt-4'>
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">Tags</h6>
                                <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                                    <ReactTags 
                                        tags={selectedTags.map((t) => { return { id: t.tag, text: t.tag }  })}
                                        suggestions={prepareTags()}
                                        delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                                        handleDelete={onTagDelete}
                                        handleAddition={onTagAdd}
                                        inputFieldPosition="bottom"
                                        placeholder="Enter Tag"
                                        onClearAll={() => setSelectedTags([])}
                                        clearAll
                                        autocomplete
                                    />
                                </div>
                                </div>
                                <div className='pt-4'>
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">Original URL</h6>
                                <Input size="medium w-full mb-2" type="text" name="url" placeholder="Original Url" 
                                value={singlePdfHighlight[0]?.media?.url || ''} 
                                disabled
                                />
                                </div>
                                <div className='pt-4'>
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">File Link</h6>
                                <Input size="medium w-full mb-2" type="text" name="url" placeholder="S3 url" 
                                value={singlePdfHighlight[0]?.media?.s3link || ''} 
                                disabled
                                />
                                </div>
                                {/* REMARKS */}
                                <div className='mt-4'>
                                <h6 className='text-xs text-gray-500 mb-1'>Comment</h6>
                                <textarea  placeholder='Add your comments' className='w-full text-sm p-2 border-2 rounded-md h-14 outline-none resize-none' 
                                onChange={(e) => setComments(e.target.value)} value={comments}
                                ></textarea>
                                </div>
                                {/* ADD PHOTOS */}
                                    </div>
                           
                                    <div className='flex justify-between items-center mt-4'>
                                        <div>
                                            <Button variant="primary small text-xs" onClick={submitHandler}>
                                            {loadingBtn ? 'Loading' : `Save to collection`}
                                            </Button>
                                        </div>
                                    </div >
                                </div>
                                </>
                            }
                        </>
                    }
                    </>
                </Drawer>
                : 
                <></>
            }

            {/* pdf details drawer */}
            {
                pdfDetailsDrawerOpen ? 
                
                <Drawer 
                closable={false}
                maskClosable={false}
                extra={
                <Space>
                    <div className='h-6 w-6 rounded-sm bg-[#C85C54] cursor-pointer'>
                      <XMarkIcon className="h-6 w-6 text-white p-1" 
                        onClick={handleClosePdfDetailsDrawer}
                        />
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
                onClose={handleClosePdfDetailsDrawer} 
                open={pdfDetailsDrawerOpen}>
                   <>
                    <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5'>
                        <div className='ct-relative' onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}>
                        <div className='grid grid-cols-8 gap-2'>
                                <div className='col-span-7' >
                                <Input size="medium w-full mb-2" type="text" name="link" placeholder="Title" 
                                value={pdfTitle} 
                                onChange={(e)=>setPdfTitle(e.target.value)}
                                />
                                {pdfTitleError && <span className='error-label'>Title is required</span>}
                                <Input size="medium w-full" type="text" name="description" placeholder="Enter description" 
                                value={pdfDescription} 
                                
                                onChange={(e) => setPdfDescription(e.target.value)}
                                />
                                <div className='pt-6 flex justify-between space-x-2'>
                                    {/* Collections */}
                                    <div 
                                    className={classNames("flex-1", showTypeInput && "hidden")}
                                    >
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Collections</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                        <div 
                                        onClick={() => setShowCollectionInput(true)} 
                                        className="w-full">
                                        <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} setSelectedCollection={setSelectedPdfCollection} selectedCollection={selectedPdfCollection} error={error}/> 
                                        
                                        </div>
                                    </div>
                                    </div>
                                    {/* Types */}
                                    <div 
                                    className={classNames("flex-1", showCollectionInput && 'hidden')}
                                    >
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Types</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                        <div 
                                        // onClick={() => setShowTypeInput(true)} 
                                        className="w-full">
                                            <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedPdfType} type={'PDF'}
                                            disabled={true}
                                            /> 
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                <div className='pt-4'>
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">Original URL</h6>
                                <Input size="medium w-full mb-2" type="text" name="url" placeholder="Original Url" 
                                value={pdfDetails[0]?.media?.url || originalFile} 
                                disabled
                                />
                                </div>
                                <div className='pt-4'>
                                <h6 className="block text-xs font-medium text-gray-500 mb-1">File Link</h6>
                                <Input size="medium w-full mb-2" type="text" name="url" placeholder="S3 url" 
                                value={pdfDetails[0]?.media?.s3link || file} 
                                disabled
                                />
                                </div>

                                <div className='pt-4'>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Tags</h6>
                                    <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                                    <ReactTags 
                                        tags={selectedPdfTags?.map((t) => { return { id: t.tag, text: t.tag }  })}
                                        suggestions={prepareTags()}
                                        delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                                        handleDelete={onTagPdfDelete}
                                        handleAddition={onTagPdfAdd}
                                        inputFieldPosition="bottom"
                                        placeholder="Enter Tag"
                                        onClearAll={() => setSelectedPdfTags([])}
                                        clearAll
                                        autocomplete
                                    />
                                    </div>
                                </div>
                                <div className='pt-4'>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Comment</h6>
                                    <Input size="medium w-full mb-2 h-20" type="text" name="descriptions" placeholder="Add your comments" value={pdfComments}
                                    onChange={(e) => setPdfComments(e.target.value)}
                                    />
                                </div>
                            
                                </div>
                            </div>
                    </div>

                    <div className='flex justify-between items-center mt-4'>
                        <div>
                            <Button variant="primary small text-xs" onClick={handleSubmitPdfDetails}>
                                {loadingBtn ? 'Loading' : `Save to collection`}
                            </Button>
                        </div>
                    </div >
                    </div>
                    </>
                </Drawer>
                
                :
                
                <></>
            }
            
            </>
           }
        </>
    )
}

export default PdfHighlight;