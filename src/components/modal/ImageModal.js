import "./ImageModal.css"
import * as ReactIcons                      from 'react-icons/ri';
import { BiLogoUnsplash }                   from 'react-icons/bi';
import { MagnifyingGlassIcon }              from "@heroicons/react/24/solid";
import { useDispatch }                      from "react-redux";
import { LoadingOutlined, UndoOutlined }    from "@ant-design/icons";
import { useState, useCallback, 
         useEffect }                        from "react";
import { FileUploader }                     from 'react-drag-drop-files'
import { CirclePicker }                     from "react-color"  
import EmojiPicker, { Emoji, EmojiStyle }   from 'emoji-picker-react';
import { Modal, Tabs, Radio, message, Spin,
         Button, Input, Row, Image, Col }   from "antd";
import axios                                from "axios";
import { TbScreenshot, TbUpload }           from "react-icons/tb"
import { FiLink }                           from "react-icons/fi"
import ImageList                            from "./ImageList";
import { checkIsImgValid, 
         removeDuplicateThumbnail }         from "../../utils/equalChecks";
import { TEXT_MESSAGE, debounceFunction,
         rgbToHex,
         GALLEY_UPLOAD_COLORS }             from "../../utils/constants";
import { takeScreenshotOfGivenPage }        from "../../utils/get-site-images";
import { uploadIcons }                      from "../../actions/collection";
// import { uploadBase64Img }                  from "../../actions/upload";

const fileTypes  = ["JPG", "PNG", "GIF","JPEG","WEBP"];

const ImageModal = ({ platform, isSetResetOpt, onResetIcon, currentTab, onClose, currentIcon, currentThumbnail, onIconSelect, onThumbnailSelect, currentURL, siteImages = [] }) => {
    const iconNames = Object.keys(ReactIcons);
    const dispatch  = useDispatch()
    const [currentThumbnailMode, setCurrentThumbnailMode] = useState("screenshot")
    const [iconTab, setIconTab]                           = useState("emoji")
    const [coverTab, setCoverTab]                         = useState("gallery")
    const [loadingImg, setLoadingImg]                     = useState(false)
    const [takingScreenshot, setTakingScreenshot]         = useState(false)
    const [uploadingUrl, setUploadingUrl]                 = useState(false)
    const [imgLink, setImgLink]                           = useState("")
    const [linkError, setLinkError]                       = useState("")
    const [selectedIcon, setSelectedIcon]                 = useState(currentIcon || null)
    const [selectedThumbnail, setSelectedThumbnail]       = useState(currentThumbnail || null)
    const [searchedIcon, setSearchedIcon]                 = useState([]);
    const [searchImages,setSearchImages]                  = useState([])
    const [searchText,setSearchText]                      = useState([])
    const [randomImages,setRandomImages]                  = useState([])
    const [page,setPage]                                  = useState(1)
    const [totalPages, setTotalPages]                     = useState(null);
    const [searchLoading, setSearchLoding]                = useState(false);
    const [newSiteImages, setNewSiteImages]               = useState(siteImages || [])

    const {
        REACT_APP_UNSPLASH_API_ACCESS_KEY,
        REACT_APP_UNSPLASH_API
    }                                       = process.env;   
    
    useEffect(() => {
        const getCall = async () => {
            setSearchLoding(true)
            const res = await axios.get(`${REACT_APP_UNSPLASH_API}/photos/random?count=12&&client_id=${REACT_APP_UNSPLASH_API_ACCESS_KEY}`)
            setRandomImages(res.data)
            setSearchLoding(false)
        }

        getCall()
    },[REACT_APP_UNSPLASH_API_ACCESS_KEY, REACT_APP_UNSPLASH_API])

    const getSearchPhotos = useCallback(async (value) => {
        if (totalPages && page > totalPages) return;
        setSearchLoding(true)
        const res = await axios.get(`${REACT_APP_UNSPLASH_API}/search/photos?query=${value}&per_page=12&client_id=${REACT_APP_UNSPLASH_API_ACCESS_KEY}&page=${page}`)
        setSearchImages([...searchImages,...res.data.results])
        setTotalPages(res.data.total_pages)
        setPage(page + 1)
        setSearchLoding(false)
    }, [page, searchImages, totalPages])

    const handleSearchChange = useCallback((value) => {
        if(!value){
            setSearchImages([])
            setPage(1)
            setTotalPages(null)
            return;
        }

        setSearchText(value)
        getSearchPhotos(value)
    }, [getSearchPhotos])

    const debounceOnChange = useCallback(debounceFunction(handleSearchChange, 500), []);

    const onFileChange = async (files, type) => {
        if (files.length === 0) {
            message.error("Please select a file."); 
            return;
        }
        const fileSize = files[0].size / 1024 / 1024; // Convert to MB
        if (type === "icons" && fileSize > 5) {
            message.error(TEXT_MESSAGE.FILE_SIZE_ERROR);
            return
        }
        setLoadingImg(true)
        const formData = new FormData();
        formData.append('file', files[0])
        const res = await dispatch(uploadIcons(formData))
        setLoadingImg(false)
        if (res.error === undefined) {
            if (type === "icons") {
                const iconObj = {
                    icon: res.payload?.data?.message || '',
                    type: "image"
                }
                setSelectedIcon(iconObj)
                onIconSelect(iconObj)
            }
            else {
                setSelectedThumbnail(res.payload?.data?.message || '')
                onThumbnailSelect((platform === "gem") ? res.payload?.data?.message || '' : {
                    type: "upload",
                    icon: res.payload?.data?.message || '',
                    imagePosition: {
                        "x": 50,
                        "y": 50
                    }
                })
            }
        }
        else {
            message.error("An error occured while uploading image.")
        }
    }

    const onLinkChange = (e) => {
        const { value } = e.target
        setImgLink(value)
        setLinkError("")
    }

    const onLinkSubmit = async (type) => {
        setUploadingUrl(true)
        const isImgValidSrc = await checkIsImgValid(imgLink)
        setUploadingUrl(false)
        setImgLink("")
        if (!isImgValidSrc) {
            setLinkError("Please give valid image url this url may be broken or not valid.")
            return 
        }
        if (type === "icons") {
            const iconObj = {
                type: "image",
                icon: isImgValidSrc
            }
            setSelectedIcon(iconObj)
            onIconSelect(iconObj)
        }
        else {
            setSelectedThumbnail(isImgValidSrc)
            onThumbnailSelect(platform === "gem" ? isImgValidSrc : {
                type: "upload",
                icon: isImgValidSrc,
                imagePosition: {
                    "x": 50,
                    "y": 50
                }
            })
        }
    }  
    
    const onImgClick = async (img, index) => {
        if (currentThumbnailMode === "screenshot" && index === 0) {
            // Take screenshot of given url
            setTakingScreenshot(true)
            const base64 = await takeScreenshotOfGivenPage(currentURL)
            if (typeof base64 === "object" && base64.status === 400) {
                setTakingScreenshot(false)
                message.error(base64.message)
                return 
            }
            setTakingScreenshot(false)
            setSelectedThumbnail(base64)
            onThumbnailSelect(base64)
            return
        }
        setSelectedThumbnail(img)
        onThumbnailSelect(img)
    }

    const onEmojiClick = (emoji) => {
        const iconObj = {
            type: "emoji",
            icon: emoji.unified
        }
        setSelectedIcon(iconObj)
        onIconSelect(iconObj)
    }

    const onColorChangeClick = (color) => {
        const iconObj = {
            type: "color",
            icon: color.hex
        }
        setSelectedIcon(iconObj)
        onIconSelect(iconObj)
    }

    const onIconClick = (iconName) => {
        const iconObj = {
            type: "icon",
            icon: iconName
        }
        setSelectedIcon(iconObj)
        onIconSelect(iconObj)
    }

    const onIconSearch = (e) => {
        const { value } = e.target;
        setTimeout(() => {
            setSearchedIcon(
                iconNames.filter((item) =>
                    item.toLowerCase().trim().includes(value.toLowerCase().trim())
                )
            );
        }, 500);
    }

    const onGalleryClick = (e) => {
        const color = rgbToHex(e.target.style.backgroundColor)
        setSelectedThumbnail(color)
        onThumbnailSelect({
            type: "gallery",
            icon: color
        })
    }

    const onUnsplashClick = async (img) => {
        const formData = new FormData();
        formData.append('fileLink', img)
        const res = await dispatch(uploadIcons(formData))
        if (res.error === undefined) {
            setSelectedThumbnail(res.payload?.data?.message || '')
            onThumbnailSelect({
                type: "unsplash",
                icon: res.payload?.data?.message || '',
                imagePosition: {
                    "x": 50,
                    "y": 50
                }
            })
        }
        else {
            setSelectedThumbnail(img)
            onThumbnailSelect({
                type: "unsplash",
                icon: img,
                imagePosition: {
                    "x": 50,
                    "y": 50
                }
            })
        }
    }

    const onImageError = (e) => {
        const idx = newSiteImages.indexOf(e.target.src)
        if (idx > -1) {
            newSiteImages.splice(idx, 1)
            setNewSiteImages([ ...newSiteImages ])
        }
        // e.target?.parentElement?.parentElement?.remove()
    }

    const renderCollectionUploadPanel = () => {
        const filteredImages     = removeDuplicateThumbnail(newSiteImages)
        const images             = [ ...filteredImages ]
        return (
            <div>
                {renderLinkOption()}
                {renderUploadOption()}
                <div className="mt-4">
                    <Row gutter={[8, 8]} justify={"space-between"}>
                        {images.map((img, index) => {
                            if (img === "") return null
                            return <Col span={12} className="w-full h-full" onClick={() => { setSelectedThumbnail(img); onThumbnailSelect(img); }}>
                                        <div className={`ct-img-col ct-row-border ct-inner-col-div ${selectedThumbnail === img ? "ct-selected-thumbnail" : ""}`}>
                                            <Image wrapperClassName={`ct-img-wrapper`} className="ct-img ct-img-scale-down" src={img} onError={onImageError} preview={false} />
                                        </div>
                                </Col>
                        })}
                    </Row>
                </div>
            </div>
        )
    }

    const renderLinkOption = (type="thumbnail") => {
        return (
            <div className="flex flex-col mb-5">
                <div className="flex w-full">
                    <Input placeholder="Paste link to an image" onChange={onLinkChange} value={imgLink} className="mr-1" />
                    <Button type="primary" onClick={() => onLinkSubmit(type)} className="ct-image-modal-btn">{uploadingUrl ? <LoadingOutlined style={{ fontSize: 24, color: "white", display: "flex" }} spin /> : "Submit" }</Button>
                </div>
                {linkError && <label className="error-label">{linkError}</label>}
            </div>
        )
    }

    const renderUploadOption = (type="thumbnail") => {
        return (
            <FileUploader 
                handleChange={(files) => onFileChange(files, type)} 
                name="drop-zone-section-file" 
                types={fileTypes} 
                onTypeError={(err) => message.error(err)}
                multiple={true}
                disabled={loadingImg}
            >
                    <div className='mb-5 w-full h-[155px] bg-white border-2 border-dashed border-gray-400 flex text-center justify-center align-middle items-center'>
                        <div>
                            <TbUpload className='h-6 w-6 text-gray-500 my-0 mx-auto mb-2' disabled={loadingImg}/>
                            <span>Drag & drop to upload attachment</span>
                            <div className='flex justify-center items-center gap-2 mt-2'>
                                <hr className='w-12' />
                                <span className='text-gray-500'>OR</span>
                                <hr className='w-12' />
                            </div>
                            <Button variant="mt-2 primary" disabled={loadingImg}>Browse Attachment</Button>
                        </div>
                    </div>
            </FileUploader>
        )
    }

    const renderThumbnailTab = () => {
        const finalImages        = removeDuplicateThumbnail(newSiteImages)
        const images             = currentThumbnailMode === "screenshot" ? [ `${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/take-screenshot-img.png`, ...finalImages ] : [ ...finalImages ]
        return (
            <div className="flex flex-col">
                <div className="flex justify-between items-center w-full mb-5">
                    <Radio.Group className="flex justify-center items-center"
                                 optionType="button"
                                 buttonStyle="solid" 
                                 value={currentThumbnailMode} 
                                 onChange={(e) => setCurrentThumbnailMode(e.target.value)}>
                        <Radio.Button className="flex items-center" value={"screenshot"}><TbScreenshot size={18} /></Radio.Button>
                        <Radio.Button className="flex items-center" value={"upload"}><TbUpload size={18} /></Radio.Button>
                        <Radio.Button className="flex items-center" value={"link"}><FiLink size={18} /></Radio.Button>
                    </Radio.Group>
                    <div className="flex items-center">
                        {/* {isSetResetOpt && <Button type="text" className="ct-contents" onClick={() => { setSelectedThumbnail(null); onResetIcon("thumbnail"); }}><UndoOutlined /></Button>} */}
                        <Button type="text" className="error-label" onClick={() => { setSelectedThumbnail(null); onThumbnailSelect(null); }}>Remove</Button>
                    </div>
                </div>
                <div className="">
                    {currentThumbnailMode === "link" ? renderLinkOption() : currentThumbnailMode === "upload" ? renderUploadOption() : null}
                    <Row gutter={[8, 8]} justify={"space-between"}>
                        {images.map((img, index) => {
                            if (img === "") return null
                            if (currentThumbnailMode === "screenshot" && index === 0 && takingScreenshot) {
                                return (<Col span={12} className="w-full h-full">
                                    <div className="ct-img-col flex items-center justify-center">
                                        <Spin tip="Processing Screenshot..." />
                                    </div>
                                </Col>)
                            }
                            return <Col span={12} className="w-full h-full" onClick={() => onImgClick(img, index)}>
                                        <div className={`ct-img-col ${currentThumbnailMode === "screenshot" && index === 0 ? "" : "ct-row-border"} ct-inner-col-div ${selectedThumbnail === img ? "ct-selected-thumbnail" : ""}`}>
                                            <Image wrapperClassName={`ct-img-wrapper ${currentThumbnailMode === "screenshot" && index === 0 ? "w-full" : ""}`} className="ct-img" src={img} preview={false} onError={onImageError} />
                                        </div>
                                </Col>
                        })}
                    </Row>
                </div>
            </div>
        )
    }

    const renderCustomArea = () => {
        const filteredImages     = removeDuplicateThumbnail(newSiteImages)
        const images             = [ ...filteredImages ]
        return (
            <div>
                {renderLinkOption("icons")}
                {renderUploadOption("icons")}
                <div className="mt-4">
                    <Row gutter={[8, 8]} justify={"space-between"}>
                        {images.map((img, index) => {
                            if (img === "") return null
                            return <Col span={12} className="w-full h-full" onClick={() => { setSelectedIcon(img); onIconSelect({ type: "image", icon: img }); }}>
                                        <div className={`ct-img-col ct-row-border ct-inner-col-div ${selectedIcon === img ? "ct-selected-thumbnail" : ""}`}>
                                            <Image wrapperClassName={`ct-img-wrapper`} className="ct-img ct-img-scale-down" src={img} preview={false} onError={onImageError} />
                                        </div>
                                </Col>
                        })}
                    </Row>
                </div>
            </div>
        )
    }

    const renderEmojiArea = () => {
        return (
            <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={"100%"}
                autoFocusSearch={false}
                previewConfig={{
                    defaultCaption: "Pick one!",
                    defaultEmoji: "1f92a" ,
                }}
            />
        )
    }

    const renderColorArea = () => {
        return (
            <CirclePicker color={selectedIcon || ""} onChange={onColorChangeClick} width="100%" />
        )
    }

    const renderIconsArea = () => {
        return(
            <>
                <div className="mb-4">
                    <Input placeholder="Search Icon" onChange={onIconSearch} />
                </div>
                <div className="div-icon-list" style={{height:'450px',overflow:'hidden',overflowY:'auto'}}>
                {searchedIcon?.length > 0
                    ? searchedIcon.map((iconName) => {
                        const Icon = ReactIcons[iconName];

                        return (
                        <div
                            className="div-icon cursor-pointer"
                            key={iconName}
                            onClick={() => onIconClick(iconName)}
                        >
                            <Icon />
                        </div>
                        );
                    })
                    : iconNames.map((iconName) => {
                        const Icon = ReactIcons[iconName];

                        return (
                        <div
                            className="div-icon cursor-pointer"
                            key={iconName}
                            onClick={() => onIconClick(iconName)}
                        >
                            <Icon />
                        </div>
                        );
                    })}
                </div>
            </>
        )
    }

    const renderIconsTab = () => {
        const Icon = selectedIcon?.type === "icon" ? ReactIcons[selectedIcon?.icon] : null
        return (
            <div className="ct-icon-tab-container">
                <div className="flex justify-between items-center">
                    <span className="ct-selected-icon-txt flex items-center">
                        <span className="mr-1">Your selected icon is:</span> {
                            selectedIcon ? selectedIcon.type === "emoji" 
                                                ? <Emoji unified={selectedIcon.icon}
                                                        emojiStyle={EmojiStyle.APPLE}
                                                        size={22} />
                                                : selectedIcon.type === "color"
                                                    ? <div style={{height:'20px',width:'20px',borderRadius:'50%',background: selectedIcon.icon}}></div>
                                                    : selectedIcon.type === "image" 
                                                        ? <img src={selectedIcon.icon} className="w-[20px] h-[20px]" alt="Selected gem" />  
                                                        : Icon
                                                           ? <div><Icon style={{ width: 24, height: 24 }} /></div>
                                                           : null
                                        : null}</span>
                    <div className="flex items-center">
                        {isSetResetOpt && <Button type="text" className="ct-contents" onClick={() => { setSelectedIcon(null); onResetIcon("icons"); }}><UndoOutlined /></Button>}
                        <Button type="text" className="error-label" onClick={() => { setSelectedIcon(null); onIconSelect(null); }}>Remove</Button>
                    </div>  
                </div>
                <Tabs defaultActiveKey={iconTab}
                      onChange={(val) => setIconTab(val)}
                      items={[
                        {
                            key: "emoji",
                            label: "Emoji",
                            children: renderEmojiArea()
                        },
                        {
                            key: "color",
                            label: "Color",
                            children: renderColorArea()
                        },
                        {
                            key: "icons",
                            label: "Icons",
                            children: renderIconsArea()
                        },
                        {
                            key: "custom",
                            label: "Custom",
                            children: renderCustomArea()
                        }
                      ]}
                />
            </div>
        )
    }

    const renderGallery = () => {
        return(
            <div className="w-full flex flex-wrap py-0">
                {
                GALLEY_UPLOAD_COLORS.map(item => (
                <div className="w-[25%] p-1 cursor-pointer" key={item.id} onClick={(e) => onGalleryClick(e)}>
                    <div className={`w-[120px] h-[64px] rounded-[3px]`} style={{backgroundColor: item.bg}}>
                    </div>
                </div>
                ))
                }
            </div>
        );
    }

    const renderUnsplash = () => {
        return(
            <>
            <Input placeholder="Search for an image" className="mb-4 rounded-[50px]" onChange={e => debounceOnChange(e.target.value)}
            prefix={<MagnifyingGlassIcon className="h-4 w-4 text-[#a8a1a1]"/>}
            />

            <div className="w-full flex flex-wrap py-0">
                <ImageList data={searchImages.length>0 ? searchImages : randomImages} onImageClick={onUnsplashClick}/>
            </div>

            {searchLoading && 
                <div className="flex items-center justify-center my-1">
                    <Spin size='middle' tip='Loading...'/>
                </div>
            }

            {
            searchImages?.length > 0 &&
                <div className="text-center">
                    <Button type="link" onClick={(e) => {
                    e.stopPropagation();
                    getSearchPhotos(searchText)
                }}>See more</Button>
                </div>
            }
            
            </>
        )
    }

    const renderCoverTab = () => {
        return (
            <div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center mr-2">
                        <div className="mr-2">Your selected cover is:</div>
                        {currentThumbnail && (currentThumbnail.type === "image" || currentThumbnail.type === "upload") && 
                            <img src={URL.createObjectURL(currentThumbnail.icon) || ""} alt="cover" className="h-[100px]"/>
                        }
                        {currentThumbnail && currentThumbnail.type === "unsplash" &&
                            <img src={currentThumbnail.icon} alt="cover" className="h-[100px]"/>
                        } 
                        {currentThumbnail && currentThumbnail.type === "gallery" &&
                            <div className="mr-2">{currentThumbnail.icon}</div>  
                        }
                    </div>
                    <Button type="text" className="error-label" onClick={() => { setSelectedIcon(null); onThumbnailSelect(null); }}>Remove</Button>
                </div>
                <Tabs defaultActiveKey={coverTab} onChange={(val) => setCoverTab(val)} 
                      items={[
                        {
                            label: `Gallery`,
                            key: 'gallery',
                            children: renderGallery(),
                        },
                        {
                            label: `Upload`,
                            key: 'upload',
                            children: renderCollectionUploadPanel(),
                        },
                        {
                            label: <div className="flex items-center">
                                <BiLogoUnsplash className="h-5 w-5 mr-1"/>
                                <div>Unsplash</div>
                            </div>,
                            key: 'unsplash',
                            children: renderUnsplash(),
                        },
                      ]}/>
            </div>
        )
    }

    const collectionTabs = [
        {
            key: "covers",
            label: "Covers",
            children: renderCoverTab()
        },
        {
            key: "favicon",
            label: "Favicon",
            children: renderIconsTab()
        }
    ]

    const gemTabs = [
        {
            key: "thumbnail",
            label: "Thumbnail",
            children: renderThumbnailTab()
        },
        {
            key: "favicon",
            label: "Favicon",
            children: renderIconsTab()
        }
    ]
    return (
        <Modal open={true} footer={null} onCancel={onClose}>
            <Tabs defaultActiveKey={currentTab} 
                  items={platform === "collection" ? collectionTabs : gemTabs} />
        </Modal>
    )
}

export default ImageModal