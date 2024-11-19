
import "./ImageModal.css"
import axios                                from "axios";
import { BiLogoUnsplash }                   from "react-icons/bi";
import { MagnifyingGlassIcon }              from "@heroicons/react/24/solid";
import { useDispatch }                      from "react-redux";
import { LoadingOutlined }                  from "@ant-design/icons";
import { useState, useEffect, 
         useCallback }                      from "react";
import { FileUploader }                     from 'react-drag-drop-files'
import { Modal, Row, Col, message, Spin,
         Image,
         Button, Input }                    from "antd";
import { TbUpload }                         from "react-icons/tb"
import { checkIsImgValid, removeDuplicateThumbnail }                  from "../../utils/equalChecks";
import ImageList from "./ImageList";
import { debounceFunction } from "../../utils/constants";
import { uploadIcons } from "../../actions/collection";

const fileTypes  = ["JPG", "PNG", "GIF","JPEG","WEBP"];

const SEOImageUploadModal = ({ onClose, currentThumbnail, onThumbnailSelect, existingThumbnails=[] }) => {
    const dispatch  = useDispatch()

    const [loadingImg, setLoadingImg]                     = useState(false)
    const [uploadingUrl, setUploadingUrl]                 = useState(false)
    const [imgLink, setImgLink]                           = useState("");
    const [linkError, setLinkError]                       = useState("")
    const [searchImages,setSearchImages]                  = useState([])
    const [searchText,setSearchText]                      = useState([])
    const [randomImages,setRandomImages]                  = useState([])
    const [page,setPage]                                  = useState(1)
    const [totalPages, setTotalPages]                     = useState(null);
    const [searchLoading, setSearchLoding]                = useState(false); 
    const [newImages, setNewImages]                       = useState(existingThumbnails || [])

    useEffect(() => {
        const getCall = async () => {
            setSearchLoding(true)
            const res = await axios.get(`${process.env.REACT_APP_UNSPLASH_API}/photos/random?count=12&&client_id=${process.env.REACT_APP_UNSPLASH_API_ACCESS_KEY}`)
            setRandomImages(res.data)
            setSearchLoding(false)
        }

        getCall()
    },[process.env.REACT_APP_UNSPLASH_API_ACCESS_KEY, process.env.REACT_APP_UNSPLASH_API])

    const getSearchPhotos = useCallback(async (value) => {
        if (totalPages && page > totalPages) return;
        setSearchLoding(true)
        const res = await axios.get(`${process.env.REACT_APP_UNSPLASH_API}/search/photos?query=${value}&per_page=12&client_id=${process.env.REACT_APP_UNSPLASH_API_ACCESS_KEY}&page=${page}`)
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

    const onFileChange = async (files) => {
        if (files.length === 0) {
            message.error("Please select a file."); 
            return;
        }
        const fileSize = files[0].size / 1024 / 1024; // Convert to MB
        setLoadingImg(true)
        const formData = new FormData();
        formData.append('file', files[0])
        const res = await dispatch(uploadIcons(formData, false, 200, 200))
        setLoadingImg(false)
        if (res.error === undefined) {
            onThumbnailSelect(res.payload?.data?.message || '')
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

    const onLinkSubmit = async () => {
        setUploadingUrl(true)
        const isImgValidSrc = await checkIsImgValid(imgLink, true)
        setUploadingUrl(false)
        if (typeof isImgValidSrc === "object" && isImgValidSrc.status === 400) { 
            setLinkError(isImgValidSrc.message)
            return
        }
        setImgLink("")
        if (!isImgValidSrc) {
            setLinkError("Please give valid image url this url may be broken or not valid.")
            return 
        }
        onThumbnailSelect(isImgValidSrc)
    }  

    const onUnsplashClick = async (img) => {
        const formData = new FormData();
        formData.append('fileLink', img)
        const res = await dispatch(uploadIcons(formData))
        if (res.error === undefined) {
            onThumbnailSelect(res.payload?.data?.message || '')
        }
    }

    const onImageError = (e) => {
        const idx = newImages.indexOf(e.target.src)
        if (idx > -1) {
            newImages.splice(idx, 1)
            setNewImages([ ...newImages ])
        }
    }

    const renderLinkOption = () => {
        return (
            <div className="flex flex-col mb-5">
                <div className="flex w-full">
                    <Input placeholder="Paste link to an image" onChange={onLinkChange} value={imgLink} className="mr-1 h-[33px]" />
                    <Button type="primary" onClick={() => onLinkSubmit()} className="ct-image-modal-btn">{uploadingUrl ? <LoadingOutlined style={{ fontSize: 24, color: "white", display: "flex" }} spin /> : "Submit" }</Button>
                </div>
                {linkError && <label className="error-label">{linkError}</label>}
            </div>
        )
    }

    const renderUploadOption = () => {
        return (
            <FileUploader 
                handleChange={(files) => onFileChange(files)} 
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

    const renderCustomArea = () => {
        return (
            <div>
                {renderLinkOption()}
                {renderUploadOption()}
            </div>
        )
    }

    const renderUnsplash = () => {
        return(
            <>
            <Input placeholder="Search for an image" className="mb-4 rounded-[50px]" onChange={e => debounceOnChange(e.target.value)}
            prefix={<MagnifyingGlassIcon className="h-4 w-4 text-[#a8a1a1]"/>}
            />

            <div className="w-full flex flex-wrap py-0">
                <ImageList data={searchImages.length>0 ? searchImages : randomImages} handleUnSplashUploadChange={onUnsplashClick}/>
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


    const gemTabs = [
        {
            key: "upload",
            label: "Upload",
            children: renderCustomArea()
        },
        {
            label: <div className="flex items-center">
                <BiLogoUnsplash className="h-5 w-5 mr-1"/>
                <div>Unsplash</div>
            </div>,
            key: 'unsplash',
            children: renderUnsplash(),
        }
    ]

    const images = removeDuplicateThumbnail(newImages)
    return (
        <Modal open={true} footer={null} onCancel={onClose}>
            <div className="flex items-center justify-between">
                <div className="flex items-center mr-2">
                    <div className="mr-2">Your selected cover is:</div>
                    {currentThumbnail && 
                        <img src={currentThumbnail} alt="cover" className="h-[100px]"/>
                    }
                </div>
                <Button type="text" className="error-label" onClick={() => {  onThumbnailSelect(null); }}>Remove</Button>
            </div>
            {renderCustomArea()}
            {images.length > 0 &&
                <div className="">
                    <Row gutter={[8, 8]} justify={"space-between"}>
                        {images.map((img) => {
                            if (!img || img === "") return null
                            return <Col span={12} className="w-full h-full" onClick={() => onThumbnailSelect(img)}>
                                        <div className={`ct-img-col ct-row-border ct-inner-col-div ${currentThumbnail === img ? "ct-selected-thumbnail" : ""}`}>
                                            <Image wrapperClassName={`ct-img-wrapper`} className="ct-img ct-img-scale-down" src={img} preview={false} onErrore={onImageError} />
                                        </div>
                                </Col>
                        })}
                    </Row>
                </div>
            }
        </Modal>
    )
}

export default SEOImageUploadModal