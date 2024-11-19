
import './SEOModal.css';

import { useState }                     from "react"
import { useDispatch }                  from 'react-redux';
import { Input, Avatar, 
         Collapse, Button, Card, message, Spin }         from "antd"
import { WithContext as ReactTags }     from 'react-tag-input';
import SEOImageUploadModal              from './SEOImageUploadModal';
import { PiMagicWandLight, PiUploadSimpleLight } from 'react-icons/pi';
import TextareaAutosize from "react-textarea-autosize";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { KEY_CODES, SLUG_REGEX,  } from '../../utils/constants';
import { autoGenerateSeoDetails } from '../../actions/login';
import { isValidURL } from '../../utils/equalChecks';
import session from '../../utils/session';

const { TextArea }      = Input
const { Panel }         = Collapse

const SEOModal = ({ onSubmit, seoObj, defaultImg, existingThumbnails, typeId, type="user", renderingPlace='drawer', altInfo=null, showAltInfo=false, isMobile=false,loading=false,baseDetails=null }) => {
    const dispatch                      = useDispatch()
    const [seoObject, setSeoObject]     = useState(seoObj && altInfo ? { ...seoObj, seo: { ...seoObj.seo, altInfo } } : seoObj)
    const [showModal, setShowModal]     = useState(false)
    const [fetchingSeo, setFetchingSeo] = useState(false)
    const [isEmpty, setIsEmpty]         = useState(false)
    const [urlError, setUrlError]       = useState("")
    const [titleError, setTitleError]   = useState("")
    const [descError, setDescError]     = useState("")
    const [slugError, setSlugError]     = useState("")
    const [altInfoError, 
           setAltInfoError]             = useState("") 

    const [isTitleEditing, setIsTitleEditing] = useState(false);
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
    const [isCanonicalUrlEditing, setIsCanonicalUrlEditing] = useState(false);
    const [isSlugEditing, setIsSlugEditing] = useState(false);
    const [isOgTypeEditing, setIsOgTypeEditing] = useState(false);

    const enableTitleInput = () => {
    setIsTitleEditing(true);
  };

  const disableTitleInput = () => {
    setIsTitleEditing(false);
  };

  const onKeyDownTitle = (event) => {
    if (event.key === "Enter") {
      disableTitleInput();
    }
  };

  //desc
  const enableDescriptionInput = () => {
    setIsDescriptionEditing(true);
  };

  const disableDescriptionInput = () => {
    setIsDescriptionEditing(false);
  };

  const onKeyDownDescription = (event) => {
    if (event.key === "Enter") {
      disableDescriptionInput();
    }
  };

  //canurl
  const enableCanonicalUrlInput = () => {
    setIsCanonicalUrlEditing(true);
  };

  const disableCanonicalUrlInput = () => {
    setIsCanonicalUrlEditing(false);
  };

  const onKeyDownCanonicalUrl = (event) => {
    if (event.key === "Enter") {
      disableCanonicalUrlInput();
    }
  };

  //slug
  const enableSlugInput = () => {
    setIsSlugEditing(true);
  };

  const disableSlugInput = () => {
    setIsSlugEditing(false);
  };

  const onKeyDownSlug = (event) => {
    if (event.key === "Enter") {
      disableSlugInput();
    }
  };

  //OgType
  const enableOgTypeInput = () => {
    setIsOgTypeEditing(true);
  };

  const disableOgTypeInput = () => {
    setIsOgTypeEditing(false);
  };

  const onKeyDownOgType = (event) => {
    if (event.key === "Enter") {
      disableOgTypeInput();
    }
  };

    const onAddManually = () => {
        setIsEmpty(true)
        setSeoObject({ seo: { title: "", description: "", keywords: "", canonical: "", slug: "" }, opengraph: { title: "", description: "", type: "", image: "" } })
    }

    const onKeywordDelete = (i) => {
        const keywords = seoObject?.seo?.keywords || ""
        const arr      = keywords.split(",")
        arr.splice(i, 1)
        setSeoObject({ ...seoObject, seo: { ...seoObject.seo, keywords: arr.join(",") } }) 
        if (isEmpty) setIsEmpty(false)
    }

    const onKeywordAdd = (tag) => {
        const keywords = seoObject?.seo?.keywords || ""
        setSeoObject({ ...seoObject, seo: { ...seoObject.seo, keywords: `${keywords},${tag.text}`  }})
        if (isEmpty) setIsEmpty(false)
    }

    const onRemoveAllKeywords = () => {
        setSeoObject({ ...seoObject, seo: { ...seoObject.seo, keywords: "" }})
        if (isEmpty) setIsEmpty(false)
    }

    const onFileUploadClick = () => {
        setShowModal(true)
        if (isEmpty) setIsEmpty(false)
    }

    const onModalClose = () => {
        setShowModal(false)
        if (isEmpty) setIsEmpty(false)
    }

    const onThumbnailSelect = (url) => {
        setSeoObject({ ...seoObject, opengraph: { ...seoObject?.opengraph, image: url } })
        setShowModal(false)
        if (isEmpty) setIsEmpty(false)
    }

    const onAutoGenerateClick = async () => {
        setFetchingSeo(true)
        const typeKey   = type === "gem" ? "gemId" : type === "collection" ? "collectionId" : type === "tag" ? "tagId" : "userId"
        const res       = await dispatch(autoGenerateSeoDetails(type === "user" ? `type=user` : `type=${type}&${typeKey}=${typeId}`))
        setFetchingSeo(false)
        if (res.error === undefined) {
            setSeoObject(res.payload.data)
            if (isEmpty) setIsEmpty(false)
        }
        else {
            message.error("Failed to auto-generate SEO details")
        }
    }

    const onTitleChange = (e) => { 
        const { value } = e.target
        if (isEmpty) setIsEmpty(false)
        if (value.length < 4) {
            setTitleError("Title is too short")
        }
        else if (value.length > 65) {
            setTitleError("Title is too long")
        }
        else {
            setTitleError("")
        }
        setSeoObject({ 
            ...seoObject, 
            seo: { ...seoObject.seo, title: value },
            opengraph: { ...seoObject?.opengraph, title: value }
        })
    }

    const onDescriptionChange = (e) => { 
        const { value } = e.target
        if (isEmpty) setIsEmpty(false)
        if (value.length < 4) {
            setDescError("Description is too short")
        }
        else if (value.length > 155) {
            setDescError("Description is too long")
        }
        else {
            setDescError("")
        }
        setSeoObject({ 
            ...seoObject, 
            seo: { ...seoObject.seo, description: value },
            opengraph: { ...seoObject?.opengraph, description: value }
        }) 
    }

    const onURLChange = (e) => { 
        const { value } = e.target
        if (isEmpty) setIsEmpty(false)
        setSeoObject({ ...seoObject, seo: { ...seoObject?.seo, canonical: value }}) 
        if (isValidURL(value) === false) {
            setUrlError("Please enter a valid URL")
        }
        else {
            setUrlError("")
        }
    }

    const onAltInfoChange = (e) => {
        const { value } = e.target
        if (isEmpty) setIsEmpty(false)
        if (value.length < 4) {
            setAltInfoError("Alt Info is too short")
        }
        else if (value.length > 65) {
            setAltInfoError("Alt Info is too long")
        }
        else {
            setAltInfoError("")
        }
        const sObj = {
            ...seoObject.seo,
            altInfo: value,
        }
        setSeoObject({ ...seoObject, seo: sObj })
    }

    const onSlugChange = (e) => {
        const { value } = e.target
        if (isEmpty) setIsEmpty(false)
        if (SLUG_REGEX.test(value)) {
            setSlugError("Please enter a valid slug")
        }
        else if (value.length < 4) {
            setSlugError("Slug is too short")
        }
        else if (value.length > 65) {
            setSlugError("Slug is too long")
        }
        else {
            setSlugError("")
        }
        const sObj = {
            ...seoObject.seo,
            slug: value,
        }
        if (baseDetails) {
            sObj.canonical = `${process.env.NEXT_PUBLIC_BASE_URL}/u/${session.username}/${baseDetails?.type}/${baseDetails?.id}/${value}`
        }
        setSeoObject({ ...seoObject, seo: sObj })
    }

    const onSubmitForm = () => {
        if (urlError !== "" || titleError !== "" || descError !== "" || slugError !== "" || altInfoError !== "") {
            message.error("Please correct the errors before saving")
            return
        }
        onSubmit(seoObject) 
    }

    const renderPreviewPanel = () => {
        return (
            <div>
                <p className='text-sm text-[#74778B]'>This is what it will look like when this page is shared with everyone</p>
                <Card
                    cover={<img src={seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com") ? seoObject?.opengraph?.image : defaultImg} alt={seoObject?.seo?.title || "Curateit - Curate, Save, Search gems of web, 10x your productivity"}
                    className='h-[150px] object-contain'
                    />}
                    className={`border border-solid border-[#DADEE8] relative mt-4 rounded-lg shadow`}
                    bodyStyle={{padding:'24px 16px'}}
                    >
                    <div className='text-lg'>{seoObject?.seo?.title}</div>
                    <div className='text-sm text-[#74778B] mt-1'>{seoObject?.seo?.description}</div>
                </Card>
            </div>
        )
    }

    if (!seoObject && fetchingSeo) return (
        <div className='flex flex-col items-center justify-center w-full h-full'>
            <Spin size='large' tip="Fetching SEO Details from AI..." />
        </div>
    )
    if (!seoObject) return (
        <div className='flex flex-col'>
            <p>SEO details are being generated, please be patient and check again later.</p>
            <div className='flex justify-between items-center mt-4 w-full'>
                <Button type="primary" onClick={onAddManually} className='mt-2 bookmark-addBtn seo-submit-btn'>Add Manually</Button>
                <Button type="primary" onClick={onAutoGenerateClick} className='mt-2 bookmark-addBtn seo-submit-btn'>Generate With AI</Button>
            </div>
            {/* </Modal> */}
        </div>
    )

    return (
        <>
        {
        renderingPlace === 'drawer' && type !== 'collection' && type !== 'tag' &&
            <div className='bg-[#FAFCFF] rounded-[6px] border border-solid border-[#DADEE8] p-3 mb-3'>
                <Collapse
                    className='mb-4' 
                    defaultActiveKey={['1']}
                >
                    <Panel header={<label className='mb-1 font-medium block text-md'>Preview</label>} key="1">
                        {renderPreviewPanel()}
                    </Panel>    
                </Collapse>
            <div className="form-group mb-4">
                <div className={`form-group mb-4`}>
                    <div className='flex justify-between items-center w-full'>
                        <Button type="primary" onClick={onFileUploadClick} className='mt-2 bookmark-addBtn' ghost>Upload Picture</Button>
                        <Button type="primary" onClick={onAutoGenerateClick} className='mt-2 bookmark-addBtn seo-submit-btn'>{fetchingSeo ? "Fetching...." : "Generate with AI"}</Button>
                    </div>
                </div>
                {showAltInfo && <div className="form-group mb-4">
                    <label className='mb-1 font-medium block'>Image Alt Info</label>
                    <Input value={seoObject?.seo?.altInfo || ""} onChange={onAltInfoChange} />
                    <div className='flex justify-between items-center w-full'>
                        {seoObject?.seo?.altInfo?.length > 4 && seoObject?.seo?.altInfo?.length < 65 && altInfoError === ""
                            ? <span className='text-gray-500 text-xs'>Alt Info should be between 50 to 65 characters long</span>
                            : <span className='text-red-500 text-xs'>{altInfoError}</span>
                        }
                        <span className='text-xs text-[#74778B]'>{seoObject?.seo?.altInfo?.length || 0} / 70</span>
                    </div>
                </div>}
                <label className='mb-1 font-medium block'>Title</label>
                <Input value={seoObject?.seo?.title} onChange={onTitleChange} />
                <div className='flex justify-between items-center w-full'>
                    {seoObject?.seo?.title?.length > 4 && seoObject?.seo?.title?.length < 65 && titleError === ""
                        ? <span className='text-gray-500 text-xs'>Title should be between 50 to 65 characters long</span>
                        : <span className='text-red-500 text-xs'>{titleError}</span>
                    }
                    <span className='text-xs text-[#74778B]'>{seoObject?.seo?.title?.length || 0} / 65</span>
                </div>
            </div>
            <div className="form-group mb-4">
                <label className='mb-1 font-medium block'>Description</label>
                <TextArea rows={4} value={seoObject?.seo?.description} onChange={onDescriptionChange} />
                <div className='flex justify-between items-center w-full'>
                    {seoObject?.seo?.description?.length > 4 && seoObject?.seo?.description?.length < 155 && descError === ""
                        ? <span className='text-gray-500 text-xs'>Description should be between 100 to 155 characters long</span>
                        : <span className='text-red-500 text-xs'>{descError}</span>
                    }
                    <span className='text-xs text-[#74778B]'>{seoObject?.seo?.description?.length || 0} / 155</span>
                </div>
            </div>
            <div className="form-group mb-4">
                <label className='mb-1 font-medium block'>Keywords</label>
                <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                <ReactTags 
                    tags={seoObject?.seo?.keywords && typeof seoObject?.seo?.keywords === "string" ? seoObject?.seo?.keywords?.split(",").map((t, index) => { return { id: t, text: t.trim() } }) : seoObject?.seo?.keywords || []}
                    delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                    handleDelete={onKeywordDelete}
                    handleAddition={onKeywordAdd}
                    inputFieldPosition="bottom"
                    placeholder="Enter Keywords"
                    onClearAll={onRemoveAllKeywords}
                    clearAll
                    autocomplete
                />
                </div>
            </div>
            <div className="form-group mb-4">
                <label className='mb-1 font-medium block'>Canonical URL</label>
                <Input value={seoObject?.seo?.canonical} onChange={onURLChange} disabled />
                {urlError !== "" && <span className='text-red-500 text-xs'>{urlError}</span>}
            </div>
            <div className="form-group mb-4">
                <label className='mb-1 font-medium block'>Slug</label>
                <Input value={seoObject?.seo?.slug} onChange={onSlugChange} />
                <div className='flex justify-between items-center w-full'>
                    {seoObject?.seo?.slug?.length > 4 && seoObject?.seo?.slug?.length < 65 && slugError === ""
                        ? <span className='text-gray-500 text-xs'>Slug should be between 50 to 65 characters long</span>
                        : <span className='text-red-500 text-xs'>{slugError}</span>
                    }
                    <span className='text-xs text-[#74778B]'>{seoObject?.seo?.slug?.length || 0} / 65</span>
                </div>
            </div>
            {seoObject?.opengraph && <>
                {seoObject?.opengraph?.type && <div className="form-group mb-4">
                    <label className='mb-1 font-medium block'>OG Type</label>
                    <Input value={seoObject?.opengraph?.type} onChange={(e) => { setSeoObject({ ...seoObject, opengraph: { ...seoObject?.opengraph, type: e.target.value }}) }} />
                </div>}
                {((seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com")) || defaultImg) && <div className="form-group mb-4 mt-1">
                    <Avatar
                        src={seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com") ? seoObject?.opengraph?.image : defaultImg}
                        size={50}
                        shape='square'
                    />
                </div>}
            </>}
            <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
            <Button type='primary' className={`${isMobile ? 'rounded-full w-[80%]' : 'rounded-md'}  bg-[#347AE2] hover:bg-[#347AE2] border-[#347AE2] hover:border-[#347AE2]`} 
                    onClick={onSubmitForm}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </div>
            </div>
        }

        {
        renderingPlace === 'drawer' && (type === 'collection' || type === 'tag') &&
        <>
        <div className="flex items-center justify-between">
            <div className='flex flex-col'>
                <div className="text-sm font-medium text-[#292B38]">Editable Preview</div>
                <div className="text-xs text-[#74778B] mt-1">This is what it will look like when it is shared with everyone</div>
            </div>

            {
                <div className="flex justify-center items-center px-2 w-10 h-10 bg-white rounded-lg aspect-square cursor-pointer text-[#74778B] border border-solid border-[#78A6EC] hover:shadow-md" onClick={onAutoGenerateClick}>
                {fetchingSeo ? <AiOutlineLoading3Quarters className="text-[#74778B] h-6 w-6 aspect-square"/> : <PiMagicWandLight className="text-[#347AE2] h-6 w-6 aspect-square"/>} 
               </div>
            }
        </div>

        <div className='flex flex-col mt-2 bg-white rounded-lg max-md:max-w-full border border-solid border-[color:var(--greyscale-200,#ABB7C9)] p-3'>

            <div className="relative">
                <div className="gradient-add-bookmark-div">
                  <img 
                    src={seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com") ? seoObject?.opengraph?.image : defaultImg} 
                    alt={seoObject?.seo?.title || "Curateit - Curate, Save, Search gems of web, 10x your productivity"}
                    className='w-full object-cover block h-[200px] rounded-lg'
                  />
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                    <div></div>

                    <div className="flex items-center">
                        <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" 
                        onClick={onFileUploadClick}
                        >
                        <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                        </div>
                    </div>

                </div>

            </div>

            {
              isTitleEditing ? 
              <div>
                <TextareaAutosize
                  onBlur={disableTitleInput}
                  onKeyDown={onKeyDownTitle}
                  value={seoObject?.seo?.title || ''}
                  onChange={onTitleChange}
                  className="w-full text-xl font-medium text-gray-500 resize-none mt-2 !outline-none !focus:outline-none textarea-border"
                  autoFocus={true}
                />

                <div className='flex justify-between items-center w-full'>
                    {seoObject?.seo?.title?.length > 4 && seoObject?.seo?.title?.length < 65 && titleError === ""
                        ? <span className='text-gray-500 text-xs'>Title should be between 50 to 65 characters long</span>
                        : <span className='text-red-500 text-xs'>{titleError}</span>
                    }
                    <span className='text-xs text-[#74778B]'>{seoObject?.seo?.title?.length || 0} / 65</span>
                </div>
              </div>
                :
              <div className="mt-2 text-xl font-medium text-gray-500 break-words" onClick={enableTitleInput}>
                {seoObject?.seo?.title}
              </div>
            }
            
            {
              isDescriptionEditing ? 
              <div>
                <TextareaAutosize
                  onBlur={disableDescriptionInput}
                  onKeyDown={onKeyDownDescription}
                  value={seoObject?.seo?.description || ''}
                  onChange={onDescriptionChange}
                  className="w-full text-base text-[#74778B] resize-none mt-2 !outline-none !focus:outline-none textarea-border"
                  autoFocus={true}
                />

                <div className='flex justify-between items-center w-full'>
                    {seoObject?.seo?.description?.length > 4 && seoObject?.seo?.description?.length < 155 && descError === ""
                        ? <span className='text-gray-500 text-xs'>Description should be between 100 to 155 characters long</span>
                        : <span className='text-red-500 text-xs'>{descError}</span>
                    }
                    <span className='text-xs text-[#74778B]'>{seoObject?.seo?.description?.length || 0} / 155</span>
                </div>
              </div>
                :
              <div className="mt-2 text-base text-[#74778B] break-words" onClick={enableDescriptionInput}>
                {seoObject?.seo?.description}
              </div>
            }

            {
              isCanonicalUrlEditing ? 
              <div>
                <TextareaAutosize
                  onBlur={disableCanonicalUrlInput}
                  onKeyDown={onKeyDownCanonicalUrl}
                  value={seoObject?.seo?.canonical || ''}
                  onChange={onURLChange}
                  className="w-full text-base text-[#74778B] resize-none mt-2 !outline-none !focus:outline-none textarea-border"
                  autoFocus={true}
                />
                {urlError !== "" && <span className='text-red-500 text-xs'>{urlError}</span>}
              </div>
                :
              <div className="mt-2 text-base text-[#74778B] break-words" onClick={enableCanonicalUrlInput}>
                {seoObject?.seo?.canonical}
              </div>
            }
            
            {
              isSlugEditing ? 
              <div>
                <TextareaAutosize
                  onBlur={disableSlugInput}
                  onKeyDown={onKeyDownSlug}
                  value={seoObject?.seo?.slug || ''}
                  onChange={onSlugChange}
                  className="w-full text-base text-[#74778B] resize-none mt-2 !outline-none !focus:outline-none textarea-border"
                  autoFocus={true}
                />
                <div className='flex justify-between items-center w-full'>
                    {seoObject?.seo?.slug?.length > 4 && seoObject?.seo?.slug?.length < 65 && slugError === ""
                        ? <span className='text-gray-500 text-xs'>Slug should be between 50 to 65 characters long</span>
                        : <span className='text-red-500 text-xs'>{slugError}</span>
                    }
                    <span className='text-xs text-[#74778B]'>{seoObject?.seo?.slug?.length || 0} / 65</span>
                </div>
              </div>
                :
              <div className="mt-2 text-base text-[#74778B] break-words" onClick={enableSlugInput}>
                {seoObject?.seo?.slug}
              </div>
            }

            {seoObject?.opengraph && <>
                {seoObject?.opengraph?.type && 
                <>
                {
              isOgTypeEditing ? 
              <div>
                <TextareaAutosize
                  onBlur={disableOgTypeInput}
                  onKeyDown={onKeyDownOgType}
                  value={seoObject?.opengraph?.type || ''}
                  onChange={(e) => { setSeoObject({ ...seoObject, opengraph: { ...seoObject?.opengraph, type: e.target.value }}) }}
                  className="w-full text-base text-[#74778B] resize-none mt-2 !outline-none !focus:outline-none textarea-border"
                  autoFocus={true}
                />
              </div>
                :
              <div className="mt-2 text-base text-[#74778B] break-words" onClick={enableSlugInput}>
                {seoObject?.opengraph?.type}
              </div>
            }
                </>
                }
                {((seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com")) || defaultImg) && <div className="form-group mb-4 mt-1">
                    <Avatar
                        src={seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com") ? seoObject?.opengraph?.image : defaultImg}
                        size={50}
                        shape='square'
                    />
                </div>}
            </>}

            <div className='my-2 addBk-tag-wrapper bg-white p-2'>
            <ReactTags 
                    tags={seoObject?.seo?.keywords && typeof seoObject?.seo?.keywords === "string" ? seoObject?.seo?.keywords?.split(",").map((t, index) => { return { id: t, text: t.trim() } }) : seoObject?.seo?.keywords || []}
                    delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                    handleDelete={onKeywordDelete}
                    handleAddition={onKeywordAdd}
                    inputFieldPosition="bottom"
                    placeholder="Enter Keywords"
                    onClearAll={onRemoveAllKeywords}
                    clearAll
                    autocomplete
                />
            </div>
        </div>

        <div className={`mt-4 flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
            <Button type='primary' className={`${isMobile ? 'rounded-full w-[80%]' : 'rounded-md'}  bg-[#347AE2] hover:bg-[#347AE2] border-[#347AE2] hover:border-[#347AE2]`} 
                    onClick={onSubmitForm}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
        </div>
        </>
        }

        {
        renderingPlace === 'profile' &&
        <div className={`${isMobile ? 'px-4 flex flex-col-reverse pb-4' : 'flex flex-row flex-wrap user-setting-profile-wrapper'}`}>
            <div className={`${isMobile ? '' : 'flex-[0.6]'}`}>
                <div className={`form-group mb-4`}>
                    <Button type="primary" onClick={onFileUploadClick} className='mt-2 bookmark-addBtn' ghost>Upload Picture</Button>
                </div>
                {showAltInfo && <div className="form-group mb-4">
                    <label className='mb-1 font-medium block'>Image Alt Info</label>
                    <Input value={seoObject?.seo?.altInfo || ""} onChange={onAltInfoChange} />
                    <div className='flex justify-between items-center w-full'>
                        {seoObject?.seo?.altInfo?.length > 4 && seoObject?.seo?.altInfo?.length < 65 && altInfoError === ""
                            ? <span className='text-gray-500 text-xs'>Alt Info should be between 50 to 65 characters long</span>
                            : <span className='text-red-500 text-xs'>{altInfoError}</span>
                        }
                        <span className='text-xs text-[#74778B]'>{seoObject?.seo?.altInfo?.length || 0} / 65</span>
                    </div>
                </div>}
                <div className="form-group mb-4">
                <label className='mb-1 font-medium block'>Title</label>
                    <Input value={seoObject?.seo?.title} onChange={onTitleChange} />
                    <div className='flex justify-between items-center w-full'>
                        {seoObject?.seo?.title?.length > 4 && seoObject?.seo?.title?.length < 65 && titleError === ""
                            ? <span className='text-gray-500 text-xs'>Title should be between 50 to 65 characters long</span>
                            : <span className='text-red-500 text-xs'>{titleError}</span>
                        }
                        <span className='text-xs text-[#74778B]'>{seoObject?.seo?.title?.length || 0} / 65</span>
                    </div>
                </div>
                <div className="form-group mb-4">
                    <label className='mb-1 font-medium block'>Description</label>
                    <TextArea rows={4} value={seoObject?.seo?.description} onChange={onDescriptionChange} />
                    <div className='flex justify-between items-center w-full'>
                        {seoObject?.seo?.description?.length > 4 && seoObject?.seo?.description?.length < 155 && descError === ""
                            ? <span className='text-gray-500 text-xs'>Description should be between 100 to 155 characters long</span>
                            : <span className='text-red-500 text-xs'>{descError}</span>
                        }
                        <span className='text-xs text-[#74778B]'>{seoObject?.seo?.description?.length || 0} / 155</span>
                    </div>
                </div>
                <div className="form-group mb-4">
                    <label className='mb-1 font-medium block'>Keywords</label>
                    <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                    <ReactTags 
                        tags={seoObject?.seo?.keywords && typeof seoObject?.seo?.keywords === "string" ? seoObject?.seo?.keywords?.split(",").map((t, index) => { return { id: t, text: t.trim() } }) : seoObject?.seo?.keywords || []}
                        delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                        handleDelete={onKeywordDelete}
                        handleAddition={onKeywordAdd}
                        inputFieldPosition="bottom"
                        placeholder="Enter Keywords"
                        onClearAll={onRemoveAllKeywords}
                        clearAll
                        autocomplete
                    />
                    </div>
                </div>
                {seoObject?.opengraph && <>
                    {seoObject?.opengraph?.type && <div className="form-group mb-4">
                        <label className='mb-1 font-medium block'>OG Type</label>
                        <Input value={seoObject?.opengraph?.type} onChange={(e) => { setSeoObject({ ...seoObject, opengraph: { ...seoObject?.opengraph, type: e.target.value }}) }} />
                    </div>}
                    {((seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com")) || defaultImg) && <div className="form-group mb-4 mt-1">
                        <Avatar
                            src={seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com") ? seoObject?.opengraph?.image : defaultImg}
                            size={50}
                            shape='square'
                        />
                    </div>}
                </>}
                <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
                <Button type='primary' className={`${isMobile ? 'rounded-full w-[80%]' : 'rounded-md'}  bg-[#347AE2] hover:bg-[#347AE2] border-[#347AE2] hover:border-[#347AE2]`} 
                        onClick={onSubmitForm}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            <div className={`${isMobile ? 'py-4' : 'flex-[0.4] flex justify-end'}`}>
                <div className='flex flex-col gap-4'>
                    <div className={`${isMobile ? 'w-fit' : 'w-[300px]'} `}>
                        <label className='mb-1 font-medium block text-lg'>Preview</label>
                        <p className='text-sm text-[#74778B]'>This is what it will look like when this page is shared with everyone</p>
                        <Card
                        cover={<img src={seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com") ? seoObject?.opengraph?.image : defaultImg} alt={seoObject?.seo?.title || "Curateit - Curate, Save, Search gems of web, 10x your productivity"}
                        className='h-[150px] object-contain'
                        />}
                        className={`border border-solid border-[#DADEE8] relative mt-4 rounded-lg shadow`}
                        bodyStyle={{padding:'24px 16px'}}
                        >
                        <div className='text-lg'>{seoObject?.seo?.title}</div>
                        <div className='text-sm text-[#74778B] mt-1'>{seoObject?.seo?.description}</div>
                        </Card>
                    </div>
                    <Button type="primary" onClick={onAutoGenerateClick} className='mt-2 bookmark-addBtn seo-submit-btn'>{fetchingSeo ? "Fetching...." : "Generate with AI"}</Button>
                </div>
            </div>
        </div>
        }
        {showModal && <SEOImageUploadModal currentTab={"thumbnail"} 
                                           onClose={onModalClose} 
                                           onThumbnailSelect={onThumbnailSelect}
                                           existingThumbnails={existingThumbnails || []}
                                           currentThumbnail={seoObject?.opengraph?.image && !seoObject?.opengraph?.image?.includes("example.com") ? seoObject?.opengraph?.image : defaultImg} />}
        </>
    )
}

export default SEOModal