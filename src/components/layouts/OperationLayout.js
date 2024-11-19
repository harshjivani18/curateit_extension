/*global chrome*/
import "./OperationLayout.css"
import React, {
  useEffect, useRef,
  useState
} from "react"
import {
  useSelector,
  useDispatch
} from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { message, Spin, Input as AntInput, Select, Space, Rate, List, Collapse, DatePicker, Radio, Tooltip, Switch } from 'antd'
import { parser } from 'html-metadata-parser'
import {
  WithContext as ReactTags
} from 'react-tag-input';
import Header from "../header/Header"
import Input from "../input/Input"
import Button from '../Button/Button'
// import Footer from './LayoutFooter'
import ComboBox from "../combobox/ComboBox";
import TypeComboBox from "../combobox/TypeComboBox";
import CheckBox from "../checkbox/CheckBox";
import PageScreenshot from "../Screenshot/PageScreenshot";
import { updateTags } from "../../utils/update-tags";
import { KEY_CODES, TEXT_MESSAGE, countriesCurreny, getCurrencyAndPrice, getPlatformFromURL, getTutorialVideoForMediaTypes, normalizeUrl } from "../../utils/constants";
import session from "../../utils/session";
import { fetchCurrentTab } from "../../utils/fetch-current-tab";
import { checkValidFileTypes, removeDuplicateThumbnail } from "../../utils/equalChecks";
import {
  getCollectionById,
  checkBookmarkExists,
  checkGemExists,
  getAllLevelCollectionPermissions,
  getBookmarkPermissions
} from "../../utils/find-collection-id";
import { readHtmlDocument } from "../../utils/read-html-page";

// import { fetchUrlData }                         from "../../actions/domain";
import { addTag } from "../../actions/tags";
import {
  removeGemFromCollection, saveSelectedCollection, updateBookmarkWithExistingCollection,
  uploadBookmarkCover,
  // uploadIcons,
  uploadScreenshots,
  setLoadedKeys,
  addCollectionCount,
  setExpandedKeys,
  getBookmarkDetailsMicrolink,
} from "../../actions/collection";
import {
  setCurrentGem,
  setCurrentMedia
} from "../../actions/gem";
import { updateUserTags } from "../../actions/user";
import LayoutCommon from "../commonLayout/LayoutCommon";
import { deleteGem } from "../../actions/gems";
import { updateHighlightsArr } from "../../actions/highlights";
import { setActiveHomeTab, setShortLinks } from "../../actions/app";
import { getSearchBooks, getSelectedBook, getSearchMovies, getSelectedMovie } from "../../actions/search"
import { getAllTypeHighlights } from "../../actions/highlights";
import CodeHighlight from "../../containers/page-highlights/CodeHighlight";
import ImageHighlight from "../../containers/page-highlights/ImageHighlight";
import TextHighlight from "../../containers/page-highlights/TextHighlight";
import { HIGHLIGHT_MEDIA_TYPES } from "../../utils/constants";
import { MdOutlineArrowDropDown, MdOutlineArrowRight, MdOutlineOpenInNew } from "react-icons/md";
import ButtonToggleSetting from "../displaySetting/ButtonToggleSetting";
import { getAmazonItemUrl, getRecentURLDetails } from "../../utils/message-operations";
// import DialogModal from "../modal/Dialog";
import FavIconComponent from "./FavIconComponent";
import { Link01Icon, Mic02Icon, Upload04Icon } from "../../hugeicons/Stroke";
import { IoMdRefresh } from "react-icons/io";
import { Validator } from "../../utils/validations";
// import TranslatorComponent from "../audioTranscript/TranslatorComponent";
// import { render } from "@testing-library/react";
import TextareaAutosize from "react-textarea-autosize";
import FavIcon from "../common/bookmarkComponents/FavIcon";
import BookmarkOptionComponent from "../common/bookmarkComponents/BookmarkOptionComponent";
import MediaTypeUI from "../common/bookmarkComponents/MediaTypeUI";
import { GlobeAltIcon, InformationCircleIcon, LockClosedIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { savePDFUrl } from "../../actions/pdf";
import TutorialVideoModal from "../modal/TutorialVideoModal";
import { BsInfoCircle } from "react-icons/bs";
import { AI_SITES, PROMPT_CATEGORY } from "../../utils/ai-options";


const dateFormat = 'YYYY-MM-DD';
const { Panel } = Collapse;
const { Option } = Select;

const FILE_TYPE_OPTIONS = [
  {
    id: 1,
    value: "url",
    text: "URL"
  },
  {
    id: 2,
    value: "file",
    text: "File"
  },
]

export const FILE_TYPE_OPTIONS_ICONS = [
  {
    id: 1,
    value: "url",
    name: "Add link",
    icon: <Link01Icon />
  },
  {
    id: 2,
    value: "file",
    name: "Upload",
    icon: <Upload04Icon />
  },
  {
    id: 3,
    value: "record",
    name : "Record",
    icon: <Mic02Icon/>
  }
]

const READ_OPTIONS = [
  {
    id: 1,
    value: "read",
    text: "Read"
  },
  {
    id: 2,
    value: "unread",
    text: "Unread"
  },
]

const PROMPT_OPTIONS = [
  {
    id: 1,
    value: "public",
    text: "Public"
  },
  {
    id: 2,
    value: "private",
    text: "Private"
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const OperationLayout = (props) => {
  let timer = null
  const {
    processing,
    onButtonClick,
    // buttonLabelText,
    onPanelClose,
    isHideBackButton,
    isHideHeader,
    // isHideFooter,
    isMenuItemEnabled,
    menuItems,
    MenuIcon,
    isDownloadable,
    onDownload,
    layoutTags=[],
    setCurrentDetailsFunc,
    // isAssetURLChangeable,
    requestURL,
    mediaType,
    currentGem,
    setTextExtract,
    socialObj,
    updateFileType,
    getUpdateInformation,
    getUploadInformation,
    childImageSrc,
    onImageEditClick,
    childPdfSrc,
    setDateRead,
    dateRead,
    setReadStatus,
    readStatus,
    rate,
    setRate,
    watchStatus,
    setWatchStatus,
    dateWatch,
    setDateWatch,
    setCodeLanguage,
    codeLanguage,
    setResetData,
    onTextCopy,
    highlightedColor,
    updateColor,
    onOpenDialog,
    getRefreshData,
    citationText='',
    isParserCall
  } = props
  // const imageRef = useRef()
  // const favImageRef = useRef()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  // const [messageApi, contextHolder]                   = message.useMessage()
  const collections = useSelector((state) => state.collection.collectionData)
  const sharedCollections = useSelector((state) => state.collection.sharedCollections)
  const savedSelectedCollection = useSelector((state) => state.collection.savedSelectedCollection)
  const tabDetails = useSelector((state) => state.app.tab)
  const existingShortLinks = useSelector((state) => state.app.shortLinks)
  const highlights = useSelector((state) => state.highlights.highlights)
  const userTags = useSelector((state) => state.user.userTags)
  const expanderArrIdx = currentGem && currentGem.expander ? currentGem.expander.findIndex((e) => { return e.type === "link" }) : -1
  const collectionObj = currentGem ? getCollectionById([...collections,...sharedCollections], currentGem.collection_id || currentGem.parent?.id) : null
  const [heading, setHeading] = useState(currentGem ? currentGem.title : "")
  const [description, setDescription] = useState(currentGem ? currentGem.description : "")
  const [shortendurl, setShortendurl] = useState(expanderArrIdx !== -1 ? currentGem.expander[expanderArrIdx].keyword : "")

  const [object, setObject] = useState()
  const [docImages, setDocImages] = useState(currentGem?.metaData?.docImages || [])
  const [selectedTags, setSelectedTags] = useState(currentGem ? (currentGem?.tags || []) : layoutTags ? (layoutTags || []) : [])
  const [assetUrl, setAssetUrl] = useState(currentGem ? currentGem.url : "")
  const [selectedType, setSelectedType] = useState(currentGem ? currentGem.media_type : mediaType ? mediaType : "");
  const [remarks, setRemarks] = useState(currentGem ? currentGem.remarks : "")
  const [favorite, setFavorite] = useState(currentGem ? currentGem.is_favourite : false);
  const [allThumbnails, setAllThumbnails] = useState(currentGem && currentGem.metaData?.covers ? currentGem.metaData?.covers : [])
  const [covers, setCovers] = useState(currentGem && currentGem.metaData?.covers ? currentGem.metaData?.covers : [])
  const [imageUrl, setImageUrl] = useState(currentGem && currentGem.metaData?.covers && currentGem.metaData?.covers?.length > 0 ? currentGem.metaData?.covers[0] : "")
  const [favIconImage, setFavIconImage] = useState((currentGem && currentGem.metaData?.icon) ? currentGem.metaData?.icon : "")
  const [showThumbnail, setShowThumbnail] = useState((currentGem && currentGem.showThumbnail !== undefined) ? currentGem.showThumbnail : true)
  const [imgSpinner, setImgSpinner] = useState(false)
  const [loader, setLoader] = useState(false)
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false);
  const [isURLChange, setIsURLChange] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const [loadingBookMovie, setLoadingBookMovie] = useState(false);
  const [enableSites, setEnableSites] = useState(currentGem?.is_enable_for_all_sites || true);
  const [promptCategory, setPromptCategory] = useState(currentGem?.prompt_category || null);
  const [prioritySites, setPrioritySites] = useState(currentGem?.prompt_priority_sites || []);
  const [fileType, setFileType] = useState(currentGem && currentGem?.fileType ? currentGem?.fileType : "url")
  const [isReaded, setIsReaded] = useState(currentGem && currentGem?.isRead ? "read" : "to Read")
  // const [currentObj, setCurrentObj]                   = useState();
  const [favImgSpinner, setFavImgSpinner] = useState(false)
  const [selectedCollection,
    setSelectedCollection] = useState(collectionObj
      ? { id: collectionObj.id, name: collectionObj.name }
      : savedSelectedCollection?.id === 0
        ? { id: Number(session.unfiltered_collection_id), name: "Unfiltered" }
        : savedSelectedCollection
    );
  const [showCollectionInput,
    setShowCollectionInput] = useState(false);
  const [searchBooks, setSearchBooks] = useState()
  const [searchMovies, setSearchMovies] = useState()
  const [gemHighlights, setGemHighlights] = useState();
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [openImageDialogTab, setCurrentImageTab] = useState(null)
  const [isOpenImageDialog, setIsOpenImageDialog] = useState(false)

  const symbolAndPrice = currentGem ? getCurrencyAndPrice(currentGem?.media?.price) : ""
  const [productPrice, setProductPrice] = useState(currentGem ? (symbolAndPrice?.price || '') : "")
  const [currencySymbol, setCurrencySymbol] = useState(currentGem ? (symbolAndPrice?.symbol || '') : '$')
  const [allCollections,setAllCollections] = useState([])
  const [openTutorialVideoModal, setOpenTutorialVideoModal] = useState(false);
  const [tagsAddedInEdit, setTagsAddedInEdit] = useState([]);

  //favicon
  // const [openIconModal, setOpenIconModal] = useState(false)
  // const [selectedEmoji, setSelectedEmoji] = useState(currentGem ? (currentGem?.metaData?.icon?.type === 'emoji' && currentGem?.metaData?.icon?.icon) : '');
  // const [selectedColor, setSelectedColor] = useState(currentGem ? (currentGem?.metaData?.icon?.type === 'color' && currentGem?.metaData?.icon?.icon) : '')
  // const [selectedImage, setSelectedImage] = useState(currentGem ? (currentGem?.metaData?.icon?.type === 'image' && currentGem?.metaData?.icon?.icon) : '')
  // const [loadingImg, setLoadingImg] = useState(false)
  const [currentThumbnail, setCurrentThumbnail] = useState(currentGem?.metaData?.covers?.length > 0 ? currentGem?.metaData?.covers[0] : "")
  const [currentIcon, setCurrentIcon] = useState(currentGem?.metaData?.icon ? currentGem?.metaData?.icon : "")
  const [defaultFavIconImage, setDefaultFavIconImage] = useState((currentGem && currentGem.metaData?.defaultIcon) ? currentGem.metaData?.defaultIcon : "")
  // const [isSetResetOpt, setIsResetOpt] = useState(false)
  const [defaultThumbnailImg, setDefaultThumbnailImg] = useState((currentGem && currentGem.metaData?.defaultThumbnail) ? currentGem.metaData?.defaultThumbnail : "")
  const [isPublic, setIsPublic] = useState(currentGem?.isPublicPrompt ? "public" : "private")

  //new
  const [collapseKeys, setCollapseKeys]     = useState([])
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [showShortEndInput, setShowShortEndInput]     = useState(false)
  const [showAssetUrlInput, setShowAssetUrlInput]     = useState(false)
  const [showBookSearchInput, setShowBookSearchInput]     = useState(false)
  const [platformType, setPlatformType]       = useState(currentGem && currentGem?.platform ? currentGem?.platform : "Twitter")
  const [showMovieSearchInput, setShowMovieSearchInput]     = useState(false)
  const [tweetType, setTweetType]       = useState(currentGem && currentGem?.post_type ? currentGem?.post_type : "SavedToCurateit")
  const [html,setHtml] = useState(currentGem && currentGem?.media?.html ? currentGem?.media?.html : null)
  const [fetching,setFetching] = useState(false)
  const [loadingBtn,setLoadingBtn] = useState(false)
  
    // const [testimonialAuthor, setTestimonialAuthor] = useState('');
    // const [testimonialTagLine, setTestimonialTagLine] = useState('');
    // const [testimonialProduct, setTestimonialProduct] = useState('');
    // const [testimonial, setTestimonial] = useState('');
    // const [testimonialAttachImage, setTestimonialAttachImage] = useState('')
    // const [testimonialUrl, setTestimonialUrl] = useState('');
    // const [testimonialDate, setTestimonialDate] = useState('');
    // const [testimonialRating, setTestimonialRating] = useState('');
    // const [testimonialPlatform, setTestimonialPlatform] = useState("Twitter");
    // const [testimonialType, setTestimonialType] = useState('');
    // const [testimonialAvatarImage, setTestimonialAvatarImage] = useState('');
    // const [testimonialAvatarImageSrc, setTestimonialAvatarImageSrc] = useState('');
  // for favicons 
    // const handleEmoji = (emojiData) => {
    //     setSelectedEmoji(emojiData)
    //     setSelectedColor('')
    //     setSelectedImage('')
    //     setSelectedIcon('')
    // }

    // const handleColor = (newColor) => {
    //     setSelectedColor(newColor.hex);
    //     setSelectedEmoji('')
    //     setSelectedImage('')
    //     setSelectedIcon('')
    // }

    // const handleIcon = (iconName) => {
    //     setSelectedIcon(iconName)
    //     setSelectedColor('');
    //     setSelectedEmoji('')
    //     setSelectedImage('')
    // }

    // const handleIconImageUploadChange = async (files) => {
    //     const fileSize = files.size / 1024 / 1024; // Convert to MB
    //     if (fileSize > 5) {
    //         message.error(TEXT_MESSAGE.FILE_SIZE_ERROR);
    //         return
    //     }
    //     setSelectedImage(files)
    //     setSelectedColor('');
    //     setSelectedEmoji('')
    //     setSelectedIcon('')
    // };

    // const handleIconCoverModalSubmit = async () => {
    //     if(selectedImage){
    //         setLoadingImg(true)
    //         const formData = new FormData();

    //         formData.append('file',selectedImage)

    //         const res = await dispatch(uploadIcons(formData))

    //         if(res.error === undefined){
    //             setLoadingImg(false)
    //             setSelectedImage('')
    //             setFavIconImage({
    //                 icon: res.payload?.data?.message || '',
    //                 type: 'image'
    //             })
    //             setOpenIconModal(false)
    //         }else{
    //             setLoadingImg(false)
    //             setSelectedImage('')
    //             setOpen(false)
    //             setFavIconImage('')
    //         }

    //         return;
    //         }

    //         if(selectedColor){
    //             setFavIconImage({
    //                     icon: selectedColor || '',
    //                     type: 'color'
    //                 })
    //             setOpenIconModal(false)
    //             return;
    //         }

    //         if(selectedEmoji){
    //             setFavIconImage({
    //                     icon: selectedEmoji.unified || '',
    //                     type: 'emoji'
    //                 })
    //             setOpenIconModal(false)
    //             return;
    //         }

    //         if(selectedIcon){
    //             setFavIconImage({
    //                     icon: selectedIcon,
    //                     type: 'icon'
    //                 })
    //             setOpenIconModal(false)
    //             return;
    //         }
    // }

    // const resetCancelValues = () => {
    //     setSelectedEmoji(favIconImage?.type === 'emoji' ? favIconImage?.icon : '')
    //     setSelectedColor(favIconImage?.type === 'color' ? favIconImage?.icon : '')
    //     setSelectedImage(favIconImage?.type === 'image' ? favIconImage?.icon : '')
    //     setSelectedIcon(favIconImage?.type === 'icon' ? favIconImage?.icon : '')
    //     setOpenIconModal(false)
    // }

    // const handleRemoveIconModalSubmit = () => {
    //     setSelectedColor('')
    //     setSelectedEmoji('')
    //     setSelectedIcon('')
    //     setSelectedImage('')
    //     setFavIconImage('')
    //     setOpenIconModal(false)
    // }
  

  function convertDateString(inputString) {
    // Create a new Date object using the input string
    const date = new Date(inputString);

    // Check if the date is valid
    if (isNaN(date)) {
      return "Invalid date";
    }

    // Extract the year, month, and day
    const year = date.getFullYear();
    let month = date.getMonth() + 1; // Months are zero-based, so we add 1
    let day = date.getDate();

    // Pad the month and day with leading zeros, if necessary
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;

    // Return the date in "YYYY-MM-DD" format
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (props.title) {
      setHeading(props.title)
    }
  }, [props.title])

  let gemObj = {
    heading,
    description,
    shortendurl,
    selectedTags,
    assetUrl,
    selectedType,
    remarks,
    favorite,
    covers,
    object,
    imageUrl,
    selectedCollection,
    favIconImage,
    showThumbnail,
    isYoutube: assetUrl?.includes("youtube.com"),
    fileType: (mediaType === "PDF" || mediaType === "Video" || mediaType === "Audio") ? fileType : undefined,
    defaultFavIconImage,
    isPublicPrompt: isPublic,
    html
  }

  useEffect(() => {
    if(currentGem && sharedCollections && sharedCollections.length>0){
      const filtered = sharedCollections?.filter(item => item?.accessType !== 'viewer')
      const currentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)
      if(currentCollectionShared){
        setAllCollections([...filtered])
        return;
      }else{
        setAllCollections([...collections,...filtered])
      }
    }
    if((currentGem && sharedCollections && sharedCollections?.length === 0)){
      setAllCollections([...collections])
      return;
    }
    if(!currentGem && sharedCollections && sharedCollections.length>0){
      const filtered = sharedCollections?.filter(item => item?.accessType !== 'viewer')
      setAllCollections([...collections,...filtered])
      return;
    }
  },[currentGem,sharedCollections])


  useEffect(() => {
    populateTweets()
  }, [socialObj])

  const populateTweets = async () => {
    if (socialObj?.type) {
      const tab = tabDetails ||  await fetchCurrentTab()
      setHeading(socialObj?.title)
      setDescription(socialObj?.description)
      setAssetUrl(socialObj?.url)
      setCovers(socialObj?.media?.covers)
      setAllThumbnails(socialObj?.media?.covers)
      if (Array.isArray(socialObj?.media?.covers) && socialObj?.media?.covers.length > 0) {
        setImageUrl(socialObj?.media?.covers[0])
        setCurrentThumbnail(socialObj?.metaData?.covers[0])
      }
      setDocImages(socialObj?.metaData?.docImages)
      setPlatformType(socialObj?.platform)
      // setDefaultThumbnailImg(socialObj?.metaData?.defaultThumbnail)
      setDefaultFavIconImage(socialObj?.metaData?.defaultIcon || tab.favIconUrl)
      setCurrentIcon(socialObj?.metaData?.icon || { "type": "image", "icon": tab.favIconUrl})
      setFavIconImage(socialObj?.metaData?.icon || { "type": "image", "icon": tab.favIconUrl})

      let socialTags = []
      if (socialObj?.socialfeed_obj?.tag && socialObj?.socialfeed_obj?.tag !== "") {
        socialTags = socialObj?.socialfeed_obj?.tag.split(",")
      }
      
      // if(selectedType?.name === 'Testimonial'){
      //   setTestimonialTagLine(tagLine || '')
      //   setTestimonialProduct(product || '')
      //   setTestimonial(testimonialValue || '')
      //   setTestimonialDate(date || '')
      //   setTestimonialRating(rating || '')
      //   setTestimonialPlatform(testimonialPlatformValue || '')
      // }


      window.chrome.storage.sync.get("CT_INITIAL_DATA", (data) => {
        if (data && data.CT_INITIAL_DATA?.CT_KEYWORDS) {
          const tempTagsArr = data.CT_INITIAL_DATA?.CT_KEYWORDS?.map(item => {
            return{
              id: item,
              tag: item
            }
          })

          const finalArr = socialTags?.length !== 0 ? [ ...tempTagsArr, ...socialTags?.map((s) => { return { id: s, tag: s }}) ] : [...tempTagsArr]

          setSelectedTags(finalArr)
          gemObj = {
              ...gemObj,
              selectedTags: finalArr
          }
        }
      })
      window.chrome.storage.sync.remove("twitterObj")
    }
  }

  // const populateTweets = async () => {
  //   if (socialObj?.type) {
  //     setHeading(socialObj?.title)
  //     setDescription(socialObj?.description)
  //           setAssetUrl(socialObj?.url)
  //     setCovers(socialObj?.media?.covers)
  //     setAllThumbnails(socialObj?.media?.covers)
  //     if (Array.isArray(socialObj?.media?.covers) && socialObj?.media?.covers.length > 0) {
  //       setImageUrl(socialObj?.media?.covers[0])
  //       setCurrentThumbnail(socialObj?.metaData?.covers[0])
  //     }
  //     setCurrentIcon(socialObj?.metaData?.icon)
  //     window.chrome.storage.sync.remove("twitterObj")
  //   }
  // }

  const getCurrentDetails = () => {
    return { ...gemObj }
  }

  useEffect(() => {
    if (setCurrentDetailsFunc && (assetUrl || imageUrl)) {
      setCurrentDetailsFunc(getCurrentDetails)
    }
  },[assetUrl,imageUrl])

  useEffect(() => {
    const isCurrentGemArr = Array.isArray(currentGem)
    if (!isURLChange && (!currentGem || (isCurrentGemArr && currentGem.length === 0))) {
      setIsURLChange(false)
      const queryParams = new URLSearchParams(location.search);
      if (mediaType === "SocialFeed" || mediaType === "Profile" || mediaType === "Testimonial" || (mediaType === "Article" && queryParams.get("refreshed") === "true")) {
        populateTweets()
      } else if (!tabDetails) {
        fetchCurrentTab().then((res) => {
          parsePageDetails(res, true)
        })
      }
      else {
        parsePageDetails(tabDetails, true)
      }
    }

    if (setCurrentDetailsFunc) {
      setCurrentDetailsFunc(getCurrentDetails)
    }
    if (onOpenDialog) {
      onOpenDialog(onOpenImageDialog)
    }

    return () => {
      // dispatch(setCurrentGem(null))
      // dispatch(setCurrentMedia(null))
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [dispatch])

  useEffect(() => {
    if(isParserCall){
      fetchCurrentTab().then((res) => {
          parsePageDetails(res, true)
          setPlatformType('Imdb')
        })
    }
  },[isParserCall])

  useEffect(() => {
    if (assetUrl) {
      const res = dispatch(getAllTypeHighlights(assetUrl))
      res.then((r) => {
        setGemHighlights(r.payload.data)
      })
    }
  }, [dispatch, assetUrl])

  const getImagesSrc = (images) => {
    return images.map((img) => {
      return img.src
    })
  }

  const parsePageDetails = async (tab, isUpdateLoader, url = null) => {
    let dImages = []
    let initialURL = ""
    if (isUpdateLoader) {
      setLoader(true)
    }

    window.chrome.storage.local.get("CT_IMAGE_DATA", (data) => {
      if (data && data.CT_IMAGE_DATA?.CT_IMAGE_SRC && data.CT_IMAGE_DATA?.CT_IMAGE_SRC.length > 0) {
        dImages = data.CT_IMAGE_DATA?.CT_IMAGE_SRC
      }
    })
    
    window.chrome.storage.sync.get("CT_INITIAL_DATA", (data) => {
            if (data && data.CT_INITIAL_DATA?.CT_KEYWORDS) {
        const tempTagsArr = data.CT_INITIAL_DATA?.CT_KEYWORDS?.map(item => {
            return{
              id: item,
              tag: item
            }
          })

          setSelectedTags([...tempTagsArr])
          gemObj = {
              ...gemObj,
              selectedTags: [...tempTagsArr],
              fileType: 'url'
          }
      }
      if (data && data.CT_INITIAL_DATA?.CT_URL) {
        initialURL = data.CT_INITIAL_DATA.CT_URL
      }

      const obj = checkGemExists([...collections,...sharedCollections], url || requestURL || initialURL)
      if (obj !== null) {
        setSelectedCollection({ id: obj.collection.id, name: obj.collection.name })
        gemObj = {
          ...gemObj,
          selectedCollection: { id: obj.collection.id, name: obj.collection.name }
        }
      }
      parser(url || requestURL || initialURL).then(async (res) => {
        setLoader(false)
        if (res) {
          let { meta, images, og } = res

          setAssetUrl(url || requestURL || initialURL)
          // setIsResetOpt(tab.url === (url || requestURL || initialURL))
          gemObj = {
            ...gemObj,
            assetUrl: url || requestURL || initialURL,
          }
          if (meta) {
            setHeading(meta?.title || "")
            setDescription(meta?.description || "")
                        setShortendurl(meta?.shortendurl || "")
            gemObj = {
              ...gemObj,
              heading: meta?.title || "",
              description: meta?.description || "",
              shortendurl: meta?.shortendurl
            }
          }
          const iURL = og?.image || tab?.favIconUrl || tab?.thumbnail || (images.length > 0 && images[0]?.src) || ""
          if (!currentGem) {
            setAllThumbnails(images ? iURL !== "" ? [iURL, ...images?.map((i) => { return i.src })] : images?.map((i) => { return i.src }) : [])
          }
          // setImageUrl(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
          if (mediaType === "Product" &&
            (tab.url.startsWith("https://www.amazon.in/") || tab?.url.startsWith("https://www.amazon.com/") || tab?.url.startsWith("https://www.amazon.co.uk/") || tab?.url.startsWith("https://www.amazon.co.in/"))
          ) {
            const itemUrl = await getAmazonItemUrl();
            if (itemUrl?.priceSymbol) {
              setCurrencySymbol(itemUrl?.priceSymbol)
            }
            if (itemUrl?.price) {
              setProductPrice(itemUrl?.price)
            }
            if (itemUrl?.imgUrl) {
              setImageUrl(itemUrl.imgUrl);
              setDefaultThumbnailImg(itemUrl.imgUrl)
              setCurrentThumbnail(itemUrl.imgUrl)
              setDocImages([ itemUrl.imgUrl, ...removeDuplicateThumbnail([ ...images.map((i) => { return i.src }), ...dImages ]) ])
            }else{
              setImageUrl(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
              setDefaultThumbnailImg(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
              setCurrentThumbnail(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
              setDocImages([ iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "", ...removeDuplicateThumbnail([ ...images.map((i) => { return i.src }), ...dImages ]) ])
            }
          }else{
            setImageUrl(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
            setCurrentThumbnail(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
            setDefaultThumbnailImg(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
            setDocImages([ iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "", ...removeDuplicateThumbnail([ ...images.map((i) => { return i.src }), ...dImages ]) ])
          }
          setCurrentIcon({
            type:'image',
            icon: tab?.favIconUrl || ''
          })
          // setCurrentThumbnail(imageUrl)
          setFavIconImage({
            type:'image',
            icon: tab?.favIconUrl || ''
          })
          setDefaultFavIconImage(tab?.favIconUrl || '')
          gemObj = {
            ...gemObj,
            imageUrl: iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "",
            favIconImage: {
                    type:'image',
                    icon: tab?.favIconUrl || ''
                  },
            defaultFavIconImage: tab?.favIconUrl || ''
          }
          // if (images) {
          //   const iURL = og?.image || tab?.favIconUrl || tab?.thumbnail || images[0]?.src || ""
          //   // const iURL = tab?.favIconUrl || tab?.thumbnail || images[0]?.src || ""
          //   if (!currentGem) {
          //     setAllThumbnails(images ? iURL !== "" ? [iURL, ...images.map((i) => { return i.src })] : images.map((i) => { return i.src }) : [])
          //   }
          //   setImageUrl(iURL !== "" ? iURL : images.length > 0 ? images[0].src : "")
          //   gemObj = {
          //     ...gemObj,
          //     imageUrl: iURL !== "" ? iURL : images.length > 0 ? images[0].src : ""
          //   }
          // }
          
        }
      })
      .catch((err) => {
        const images = data?.CT_INITIAL_DATA?.CT_IMAGES
        // const docSrcs = data?.CT_INITIAL_DATA?.CT_IMAGE_SRC
        const iURL   = (images.length > 0 && images[0]?.src) || ""
        setLoader(false)
        setAssetUrl(url || requestURL || initialURL)
        setHeading(data?.CT_INITIAL_DATA?.CT_TITLE || "")
        setDescription("")
        setShortendurl("")
        if (!currentGem) {
          setAllThumbnails(images ? iURL !== "" ? [iURL, ...images?.map((i) => { return i.src })] : images?.map((i) => { return i.src }) : [])
        }
        setImageUrl(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
        setDocImages([ iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "", ...dImages ])
        setDefaultThumbnailImg(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
        setDefaultFavIconImage(tab?.favIconUrl || '')
        setFavIconImage({
            type:'image',
            icon: tab?.favIconUrl || ''
          })
        setCurrentIcon({
          type:'image',
          icon: tab?.favIconUrl || ''
        })
        setCurrentThumbnail(iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "")
        gemObj = {
          ...gemObj,
          assetUrl: url || requestURL || initialURL,
          heading: data?.CT_INITIAL_DATA?.CT_TITLE || "",
          description: "",
          shortendurl: "",
          imageUrl: iURL !== "" ? iURL : (images && images.length > 0) ? images[0].src : "",
          favIconImage: {
                    type:'image',
                    icon: tab?.favIconUrl || ''
                  },
          defaultFavIconImage: tab?.favIconUrl || ''
        }
      })
    })
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

  const onTagAdd = async (tag) => {
    const existingIdx = userTags?.findIndex((t) => { return t.tag === tag.text })
    if (existingIdx !== -1) {
      setSelectedTags([...selectedTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }])
      gemObj = {
        ...gemObj,
        selectedTags: [...selectedTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }]
      }
    }
    else {
      if(currentGem){
        setTagsAddedInEdit([...tagsAddedInEdit,{ id: tag?.text, tag: tag?.text }])
      }
      setSelectedTags([ ...selectedTags, { id: tag?.text, tag: tag?.text } ])
    }

  }

  const onTagDelete = (i) => {
    selectedTags.splice(i, 1)
    setSelectedTags([...selectedTags])
    gemObj = {
      ...gemObj,
      selectedTags: [...selectedTags]
    }
  }

  const onSubmitClick = async () => {
    window.chrome.storage.sync.remove("aiNotes");
    const currentType = typeof selectedType === "object" ? selectedType?.name : selectedType
    let currentCollection = selectedCollection
    if (!currentCollection.bookmarks && currentCollection.id) {
      const allColl = [...collections,...sharedCollections]
      const currentCollectionIdx = allColl.findIndex((c) => { return c.id === currentCollection.id })
      if (currentCollectionIdx !== -1) {
        currentCollection = allColl[currentCollectionIdx]
      }
    }

    const shortIdx = existingShortLinks.findIndex((s) => { return s.keyword && shortendurl && s.keyword === shortendurl && s.keyword !== "" })

    if (!currentGem && shortIdx !== -1) {
      message.error("This short link already exist!")
      return
    }

    if (!currentGem && selectedType === "Link" && checkBookmarkExists([currentCollection], assetUrl)) {
      message.error("This bookmark already exist!")
      return
    }

    // if (!currentGem && currentType === "Link" && checkBookmarkExists([currentCollection], assetUrl)) {
    //   message.error("This bookmark already exist!")
    //   return
    // }

    const NOT_VALIDATING_URLS_TYPE = [
      "Audio",
      "Video",
      "PDF",
      "Quote",
      "Note",
      "Code",
      "Ai Prompt",
      "Text Expander",
      "Testimonial"
    ]
    if (fileType !== "file" && assetUrl?.length === 0 && NOT_VALIDATING_URLS_TYPE.indexOf(currentType) === -1) {
      message.error("Please enter url")
      return
    }
    setError(false)
    if (selectedCollection.id === undefined) {
      setError(true)
      return;
    }

    if(fileType !== "file" && assetUrl?.length === 0 && NOT_VALIDATING_URLS_TYPE.indexOf(currentType) === -1 && Validator.validate('url',assetUrl,true)){
      message.error(Validator.validate('url',assetUrl,true))
      handleClearFields()
      return;
    }

    let newTags = []
    const filtered = selectedTags.filter(item => typeof item.id === 'string');
    const filteredNumber = selectedTags.filter(item => typeof item.id === 'number');
    const tagNames = filtered?.map(item => item?.tag)
    if(tagNames && tagNames?.length>0){
      newTags = await updateTags(tagNames, userTags, tagNames?.length)
    }
    newTags=[...newTags,...filteredNumber]

    const shortUrlObj = (shortendurl !== "") ? [{ type: "link", keyword: shortendurl, url: assetUrl, text: '' }] : []
    const obj = {
      heading,
      description,
      shortUrlObj,
      selectedTags: newTags,
      assetUrl,
      selectedType,
      remarks,
      favorite,
      covers,
      object,
      imageUrl,
      selectedCollection,
      favIconImage,
      showThumbnail,
      isReaded: isReaded === "read",
      fileType: (mediaType === "PDF" || mediaType === "Video" || mediaType === "Audio" || mediaType === "Image") ? fileType : undefined,
      price: `${currencySymbol}${productPrice}` ,
      defaultFavIconImage,
      defaultThumbnailImg,
      docImages,
      isPublicPrompt: isPublic,
      enableSites,
      prioritySites,
      promptCategory,
      html
    }

    onButtonClick && onButtonClick(obj)
    onButtonClick && dispatch(setLoadedKeys([]))
    onButtonClick && dispatch(setExpandedKeys([]))
    onButtonClick && !currentGem && dispatch(addCollectionCount(currentCollection.id))
    const sLinks = [...existingShortLinks, ...shortUrlObj,]
    dispatch(setShortLinks(sLinks))
    const tObj = tabDetails || await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tObj.id, { id: "CT_SET_SHORT_LINKS", links: sLinks })
    onButtonClick && window.chrome.tabs.sendMessage(tObj.id, { type: "CHECK_GEM_URL" })
  }

  const onLayoutClick = () => {
    setShowCollectionInput(false)
    setShowTypeInput(false)
  }

  // const onThumbnailChangeClick = async (e) => {
  //   const { files } = e.target

  //   if (files.length !== 0 && checkValidFileTypes(files[0])) {
  //     let res = null
  //     const formData = new FormData()
  //     formData.append("files", files[0])
  //     setImgSpinner(true)
  //     if (currentGem) {
  //       res = await dispatch(uploadBookmarkCover(currentGem.id, formData))
  //     }
  //     else {
  //       res = await dispatch(uploadScreenshots(formData))
  //     }
  //     setShowThumbnail(true);
  //     setImgSpinner(false)
  //     if (res && res.error === undefined && res.payload.error === undefined) {
  //       const { data } = res.payload
  //       if (data) {
  //         const newCovers = currentGem ? [...data.metaData.covers] : [...data]
  //         setCovers((currentGem) ? [...newCovers] : [...covers, ...data])
  //         setImageUrl(newCovers.length > 0 ? newCovers[0] : "")
  //         gemObj = {
  //           ...gemObj,
  //           covers: (currentGem) ? [...newCovers] : [...covers, ...data],
  //           imageUrl: newCovers.length > 0 ? newCovers[0] : ""
  //         }
  //         if (currentGem) {
  //           setAllThumbnails((currentGem) ? [...newCovers] : [...data, ...allThumbnails])
  //           dispatch(updateBookmarkWithExistingCollection({ ...currentGem, ...data }, selectedCollection, false, "update", currentGem.parent))
  //         }
  //       }
  //       e.target.files = null
  //     }
  //   }
  //   else {
  //     message.error("Invalid file type!")
  //   }
  // }

  // const onFavImageChangeClick = async (e) => {
  //       const { files } = e.target

  //       if (files.length !== 0 && checkValidFileTypes(files[0])) {
  //           let   res      = null
  //           const formData = new FormData()
  //           formData.append("files", files[0])
  //           setFavImgSpinner(true)
  //           res = await dispatch(uploadScreenshots(formData))
  //           setFavImgSpinner(false)
  //           if (res && res.error === undefined && res.payload.error === undefined) {
  //               const { data } = res.payload
  //               if (data) {
  //                 setDefaultFavIconImage(data)
  //                 setFavIconImage({
  //                   type:'image',
  //                   icon: data
  //                 })
  //               }
  //                 gemObj = {
  //                 ...gemObj,
  //                 favIconImage: {
  //                   type:'image',
  //                   icon: data
  //                 },
  //                 defaultFavIconImage: data
  //               }
  //               e.target.files = null
  //           }
  //       }
  //       else {
  //           message.error("Invalid file type!")
  //       }
  //   }

  const onPanelCloseClick = () => {
    dispatch(setCurrentGem(null))
    dispatch(setCurrentMedia(null))
    dispatch(setLoadedKeys([]))
    dispatch(setExpandedKeys([]))
    navigate("/search-bookmark")
    onPanelClose && onPanelClose()
  }

  const onBackBtnClick = () => {
    setTextExtract && setTextExtract('')
    dispatch(setLoadedKeys([]))
    dispatch(setExpandedKeys([]))
    dispatch(setCurrentGem(null))
    dispatch(setCurrentMedia(null))
    dispatch(saveSelectedCollection({ id: Number(session.unfiltered_collection_id), name: "Unfiltered" }))
    window.chrome.storage.sync.remove('highlightedData')
  }

  const onCollectionChange = (obj) => {
    setSelectedCollection(obj)
    gemObj = {
      ...gemObj,
      selectedCollection: { ...obj }
    }
  }

  const onAssetURLChange = (e) => {
    const { value } = e.target
    setAssetUrl(value)
  }

  const onAssetURLBlur = async () => {
    if (!assetUrl) return;
    const url = normalizeUrl(assetUrl)
    setAssetUrl(url)

    if(Validator.validate('url',url,true)){
      message.error(Validator.validate('url',assetUrl,true))
      handleClearFields()
      return;
    }

    if(selectedType?.name === 'PDF' && fileType === 'url'){
      setFetching(true)
      const res = await dispatch(savePDFUrl(url))

      const link = res?.payload?.data && res?.payload?.data?.length>0 && res?.payload?.data[0]

      const obj = {
          pdfFile: link,
          pdfSrc: link,
          pdfName:link
        }
      getUploadInformation(obj)
      setFetching(false)
      return;
    }
    setIsRefreshing(true)
    setFetching(true)
    setShowThumbnail(true);

    const res = await readHtmlDocument(url)
    gemObj = {
      ...gemObj,
      assetUrl: url
    }

    if(selectedType?.name === 'Profile' || selectedType?.name === 'SocialFeed'){
      const data = getPlatformFromURL(url)
      setPlatformType(data)
      if(selectedType?.name === 'SocialFeed'){
        getUploadInformation({type:'platform',value: data})
      }else{
        getUploadInformation(data)
      }
    }

    if (res) {
      const tempTagsArr = res.keywords?.map(item => {
            return{
              id: item,
              tag: item
            }
      })
      setHeading(res.title)
      setDescription(res.description)
      setShortendurl("")
      setAllThumbnails(res.images)
      setImageUrl(res.images.length !== 0 ? res.images[0] : "")
      setSelectedTags([...tempTagsArr])
      gemObj = {
        ...gemObj,
        heading: res.title,
        description: res.description,
        shortendurl: "",
        imageUrl: res.images.length !== 0 ? res.images[0] : "",
        selectedTags: [...tempTagsArr]
      }
    }

    if((selectedType?.name === 'Audio' && fileType === 'url') || (selectedType?.name === 'Video' && fileType === 'url') || selectedType?.name === 'SocialFeed' || selectedType?.name === 'Profile'){
      const urlVal     = encodeURIComponent(url);
      const resIframely = await dispatch(getBookmarkDetailsMicrolink(urlVal))
      if(resIframely?.payload?.data?.data?.iframely || (resIframely?.payload?.data?.data?.microlink && resIframely?.payload?.data?.data?.microlink?.status === 'success')){
        
        setHtml(resIframely?.payload?.data?.data?.iframely?.html || null)

        const {meta,links} = resIframely?.payload?.data?.data?.iframely

        const imgData = (links?.thumbnail && links?.thumbnail?.length>0) ? links?.thumbnail[0]?.href :
                    (links?.icon && links?.icon?.length>0) ? links?.icon[0]?.href : ''
        const favIconData = (links?.icon && links?.icon?.length>0) ? links?.icon[0]?.href : ''

        const data  = resIframely?.payload?.data?.data?.microlink && resIframely?.payload?.data?.data?.microlink?.data;

        setImageUrl(imgData || data?.image?.url || '')
        setFavIconImage({
            type:'image',
            icon: favIconData || data?.logo?.url || ''
          })
        setDefaultFavIconImage(favIconData || data?.logo?.url || '')
        setDefaultThumbnailImg(imgData || data?.image?.url || "")
        if(!res?.title || !res?.description){
          setHeading(meta?.title || data?.title || '')
          setDescription(meta?.title || data?.title || '')
          setFavIconImage({
            type:'image',
            icon: favIconData || data?.logo?.url || ''
          })
          setDefaultFavIconImage(favIconData || data?.logo?.url || '')
          setDefaultThumbnailImg(imgData || data?.image?.url || "")
          setDocImages([imgData || data?.image?.url, ...docImages])

          gemObj = {
          ...gemObj,
          html: resIframely?.payload?.data?.data?.iframely?.html || null,
          imageUrl: data?.image?.url || imgData || '',
          heading: meta?.title || data?.title || '',
          description: meta?.title || data?.title || '',
          fileType:"url"
        }

         getUpdateInformation && getUpdateInformation(gemObj)

         setIsRefreshing(false)
         setShowAssetUrlInput(false)
         setFetching(false)
         return;
        }

        gemObj = {
          ...gemObj,
          html: res?.payload?.data?.data?.iframely?.html || null,
          imageUrl: data?.image?.url || imgData || '',
        }

         getUpdateInformation && getUpdateInformation(gemObj)
      }
      
    }

    setFetching(false)
    setIsRefreshing(false)
    setShowAssetUrlInput(false)
  }

  const fetchHighlights = (tab, obj) => {
    const highlightArr = [...highlights]
    if (highlightArr.length !== 0) {
      const idx = highlightArr.findIndex((o) => {
        return o.id === obj.id
      })
      if (idx !== -1) {
        highlightArr.splice(idx, 1)
        window.chrome.tabs.sendMessage(tab.id, {
          value: JSON.stringify(highlightArr),
          type: "CT_HIGHLIGHT_DATA",
        })
      }
    }
  }

  const handleClearFields = () => {
    setShowThumbnail(false);
    setDescription("");
    setHeading("");
    setAssetUrl("");
    setRemarks("");
    setSelectedTags([]);
    setCovers([])
    setImageUrl(null)
    setFavIconImage(null)
    setFileType('')
    setShowMovieSearchInput(false)
    setShowBookSearchInput(false)
    const obj = {
      heading:'',
      description:'',
      shortendurl:'',
      selectedTags:[],
      assetUrl:'',
      selectedType:'',
      remarks:'',
      favorite,
      covers:[],
      imageUrl:'',
      selectedCollection:'',
      favIconImage:"",
      showThumbnail:false,
      isYoutube: false,
      fileType: undefined,
      defaultFavIconImage:'',
      isPublicPrompt: false
    }
    getUpdateInformation && getUpdateInformation(obj)
    if(selectedType?.name === 'Video') {
      const obj = {
          videoFile: null,
          videoSrc:null
        }
        getUploadInformation(obj)
        updateFileType('')
    }
    if(selectedType?.name === 'Image') {
      const obj = {
          imageFile: null,
          imageSrc:null
        }
        getUploadInformation(obj)
    }
    if(selectedType?.name === 'Audio') {
      const obj = {
          audioFile: null,
          audioSrc:null,
        }
        getUploadInformation(obj)
        updateFileType('')
    }
    if(selectedType?.name === 'Code' || selectedType?.name === 'Quote' || selectedType?.name === 'Screenshot' || selectedType?.name === 'Highlight' || selectedType?.name === 'Ai Prompt' || selectedType?.name === 'Text Expander' || selectedType?.name === 'Testimonial' || selectedType?.name === 'Citation'){
      setResetData()
    }
  }

  const onDeleteClick = async () => {
    if (currentGem === null) return
    dispatch(setLoadedKeys([]))
    dispatch(setExpandedKeys([]))
    let isCurrentCollectionShared = null
    const media_type = currentGem.media_type
    const isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem?.id)
    isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)

    if(!isSingleBkShared){
      setLoadingBtn(true)
      const res = await dispatch(
      deleteGem(currentGem?.id, currentGem?.parent?.id)
    )
    if (res.error === undefined && res.payload?.error === undefined) {
      setLoadingBtn(false)
      if (currentGem.media_type === "Highlight" || currentGem.media_type === "Note") {
        if (tabDetails) {
          fetchHighlights(tabDetails, currentGem)
        } else {
          fetchCurrentTab().then((res) => {
            fetchHighlights(res, currentGem)
          })
        }
      }

      dispatch(updateHighlightsArr(currentGem, "delete"))
      dispatch(removeGemFromCollection(currentGem?.id, currentGem?.parent?.id,isCurrentCollectionShared))
      const tObj = tabDetails || await fetchCurrentTab()
      window.chrome.tabs.sendMessage(tObj.id, { type: "CHECK_GEM_URL" })
      message.success(`${media_type} deleted successfully!`)
      navigate("/search-bookmark")
      return
    }
    message.error("An error occurred while delete!")
    navigate("/search-bookmark")
    return;
    }

    if(isSingleBkShared && !isSingleBkShared?.gems?.canDelete){
      message.error('You dont have permission to delete the gem')
      return;
    }

    if(isSingleBkShared){
      setLoadingBtn(true);
      const res = await dispatch(
      deleteGem(currentGem?.id, currentGem?.parent?.id)
    )
    if (res.error === undefined && res.payload?.error === undefined) {
      setLoadingBtn(false);
      if (currentGem.media_type === "Highlight" || currentGem.media_type === "Note") {
        if (tabDetails) {
          fetchHighlights(tabDetails, currentGem)
        } else {
          fetchCurrentTab().then((res) => {
            fetchHighlights(res, currentGem)
          })
        }
      }

      dispatch(updateHighlightsArr(currentGem, "delete"))
      dispatch(removeGemFromCollection(currentGem?.id, currentGem?.parent?.id,isCurrentCollectionShared))
      const tObj = tabDetails || await fetchCurrentTab()
      window.chrome.tabs.sendMessage(tObj.id, { type: "CHECK_GEM_URL" })
      message.success(`${media_type} deleted successfully!`)
      navigate("/search-bookmark")
      return
    }
    message.error("An error occurred while delete!")
    navigate("/search-bookmark")
    return;
    }
  }

  const onSearchTerm = async (e) => {
    const { value } = e.target
    let res;

    if (value === '') {
      setSearchMovies([])
      setSearchBooks([])
      return
    } else {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(async () => {
        if (selectedType.name === "Book") {
          // res = await dispatch(getSearchBooks(value))
          // setSearchBooks(res.payload.data)
          setLoadingBookMovie(true)
          dispatch(getSearchBooks(value)).then(res => {
            if (value !== '') {
              setSearchBooks(res.payload.data)
            }
            setLoadingBookMovie(false)
          })
        }
        else if (selectedType.name === "Movie") {
          res = await dispatch(getSearchMovies(value))
          setSearchMovies(res.payload.data)
        }
      }, 300);
    }
  }

  const onClickBook = async (e, id) => {
    const res = await dispatch(getSelectedBook(id))
    const imageLink = res.payload.data?.volumeInfo?.imageLinks?.smallThumbnail?.replace("http", "https")
    setSearchBooks([])
    setShowThumbnail(true);
    setAssetUrl(res.payload?.data?.volumeInfo?.previewLink)
    setHeading(res.payload?.data?.volumeInfo?.title)
    setDescription(res.payload?.data?.volumeInfo?.description)
        setImageUrl(imageLink)
    setObject(res.payload?.data?.volumeInfo)
  }

  const onClickMovie = async (e, id) => {
    setShowThumbnail(true);
    const res = await dispatch(getSelectedMovie(id))
    setSearchMovies([])
    setAssetUrl(res.payload?.data?.data?.url)
    setHeading(res.payload?.data?.data?.title)
    setDescription(res.payload?.data?.data?.description)
        setObject(res.payload?.data?.data)
    setImageUrl(res.payload?.data?.data?.image)
  }

  const onResetIcon = async (mode) => {
    if (mode === "icons") {
      // const tab = tabDetails || await fetchCurrentTab()
      setFavIconImage({ type: "image", icon: defaultFavIconImage })
      // setDefaultFavIconImage(tab?.favIconUrl || '')
      setIsOpenImageDialog(false)
    }
    else if (mode === "thumbnail") {
      const docIdx = docImages.findIndex((c) => { return c === defaultThumbnailImg })
      if (docIdx !== -1) {
        docImages.splice(docIdx, 1)
      }
      setDocImages([ defaultThumbnailImg, ...docImages ])
      setShowThumbnail(true);

      const coverIdx = covers.findIndex((c) => { return c === defaultThumbnailImg })
      if (coverIdx !== -1) {
        covers.splice(coverIdx, 1)
      }
      setCovers([ defaultThumbnailImg, ...covers ])
      setImageUrl(defaultThumbnailImg)
      setCurrentThumbnail(defaultThumbnailImg)
      gemObj = {
        ...gemObj,
        covers: [ defaultThumbnailImg, ...covers ],
        imageUrl: defaultThumbnailImg
      }
      setIsOpenImageDialog(false)
    }
  }

  const onOpenTabs = async () => {
    if (window.chrome.tabs) {
      const currentTab = tabDetails || await fetchCurrentTab()
      window.chrome.tabs.sendMessage(currentTab.id, { id: "CT_OPEN_WINDOW", tabURLs: [currentGem].map((t) => { return t.url }) })
    }
    return false
  }

  const handlefileTypeChange = (type) => {
    setFileType(type)
    updateFileType(type)
    // if (type === "file") handleClearFields();
  };

  const onRefreshBtnClick = async () => {
    setIsRefreshing(true)
    await getRecentURLDetails()
    parsePageDetails(tabDetails, true)
    setIsRefreshing(false)

    if(selectedType?.name === 'Testimonial' || selectedType?.name === 'Citation'){
      getRefreshData && getRefreshData()
    }
  }

  const onOpenImageDialog = (tab) => {
    setCurrentImageTab(tab)
    setIsOpenImageDialog(true)
  }

  const onImageDialogClose = () => {
    setCurrentImageTab(null)
    setIsOpenImageDialog(false)
  }

  const onThumbnailSelect = (src) => {
    if (src === null) {
      setShowThumbnail(false);
      setCovers([])
      setImageUrl("")
      setCurrentThumbnail("")
      gemObj = {
        ...gemObj,
        covers: [],
        imageUrl: ""
      }
      getUpdateInformation && getUpdateInformation(gemObj)
      if (currentGem) {
        dispatch(updateBookmarkWithExistingCollection({ 
          ...currentGem,  
          metaData: {
            ...currentGem.metaData,
            covers: []
          },
          media: {
            ...currentGem.media,
            covers: []
          }
        }, selectedCollection, false, "update", currentGem.parent)) 
        dispatch(setCurrentGem({ 
          ...currentGem,  
          metaData: {
            ...currentGem.metaData,
            covers: []
          },
          media: {
            ...currentGem.media,
            covers: []
          }
        }))
      }
      setIsOpenImageDialog(false)
      return
    }
    const existingCovers = currentGem?.metaData?.covers || []
    const newDocImages   = [...docImages]
    const idx            = newDocImages.findIndex((c) => { return c === src })
    if (idx !== -1) {
      newDocImages.splice(idx, 1)
    }
    setDocImages([ src, ...newDocImages ])
    setCurrentThumbnail(src)
    setShowThumbnail(true);
    setCovers([ src, ...existingCovers ])
    setImageUrl(src)
    gemObj = {
      ...gemObj,
      covers: [ src, ...existingCovers ],
      imageUrl: src
    }
    getUpdateInformation && getUpdateInformation(gemObj)
    if (currentGem) {
      dispatch(updateBookmarkWithExistingCollection({ 
        ...currentGem,  
        metaData: {
          ...currentGem.metaData,
          covers: [ src, ...existingCovers ]
        },
        media: {
          ...currentGem.media,
          covers: [ src, ...existingCovers ]
        }
      }, selectedCollection, false, "update", currentGem.parent))
      dispatch(setCurrentGem({ 
        ...currentGem,  
        metaData: {
          ...currentGem.metaData,
          covers: [ src, ...existingCovers ]
        },
        media: {
          ...currentGem.media,
          covers: [ src, ...existingCovers ]
        }
      }))
    }
    setIsOpenImageDialog(false)
  }

  const onIconSelect = (iconObj) => {
    if (iconObj === null) {
      setFavIconImage(null)
      setCurrentIcon("")
      // setDefaultFavIconImage(null)
      setIsOpenImageDialog(false)
      gemObj = {
        ...gemObj,
        favIconImage: null,
        // defaultFavIconImage: null
      }
      getUpdateInformation && getUpdateInformation(gemObj)
      return
    }
    gemObj = {
      ...gemObj,
      favIconImage: iconObj,
      // defaultFavIconImage: iconObj.icon
    }
    setCurrentIcon(iconObj)
    setFavIconImage(iconObj)
    // setDefaultFavIconImage(iconObj.icon)
    getUpdateInformation && getUpdateInformation(gemObj)
    setIsOpenImageDialog(false)
  }

  const renderThumbnail = () => {
    return (
      <div className="flex flex-col justify-start items-center">
        <div className='bg-white w-[40px] h-[40px] rounded-lg pointer text-center overflow-hidden' onClick={() => onOpenImageDialog("thumbnail")}>
          {imgSpinner && <Spin className="mt-5" />}
          {imageUrl !== "" && showThumbnail 
            ? <img className='w-[40px] h-[40px] rounded-lg fit-image' src={imageUrl} alt={"Curateit"} />
            : <img className='w-[40px] h-[40px] rounded-lg fit-image' src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/default-img-paceholder.png`} alt={"Curateit"} />
          }
        </div>
        {/* <div onClick={() => imageRef.current.click()} className='w-[40px] py-[2px] bg-white flex justify-center align-middle border-2 border-gray-300 rounded-sm my-1 cursor-pointer'>
          <img src="/icons/image-up.svg" alt="up icon" className="h-[18px]" />
        </div>
        <input className='hidden' ref={imageRef} onChange={onThumbnailChangeClick} onError={(err) => message.error(err)} type="file" name="bookmark-image" id="bookmark-image" accept="image/png, image/jpeg" /> */}

        {favImgSpinner && <Spin className="mt-5" />}
        <div className="mt-5" onClick={() => onOpenImageDialog("favicon")}>
          <FavIconComponent data={favIconImage || { type: "image", icon: `${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/default-emoji-placeholder.png`}} />
        </div>
  
          {/* btn to open modal */}
            <>
            {/* <div onClick={() => setOpenIconModal(true)} className={`w-[40px] py-[2px] bg-white flex justify-center align-middle border-2 border-gray-300 rounded-sm my-2 cursor-pointer`}>
              <img src="/icons/image-up.svg" alt="up icon" className="h-[18px]" />
            </div> */}
            {/* <input className='hidden' ref={favImageRef} onChange={onFavImageChangeClick} onError={(err)=>message.error(err)} type="file" name="bookmark-image" id="bookmark-image" accept="image/png, image/jpeg" /> */}
            </>
        {currentGem?.url && <div onClick={onOpenTabs} className='w-[40px] py-[2px] bg-white flex justify-center align-middle border-2 border-gray-300 rounded-sm mt-1 cursor-pointer'>
          <MdOutlineOpenInNew className='text-gray-600 h-5 w-5 cursor-pointer' />
        </div>}
      </div>
    )
  }

  const renderLoader = () => {
    return (
      <div className="layout-loader-container">
        <Spin tip="Loading Site Information ..." />
      </div>
    )
  }

  const renderHighlight = (highlight, allHighlights) => {
    switch (highlight.media_type) {
      case "Highlight":
      case "Screenshot":
      case "Note":
        return <TextHighlight obj={highlight} allHighlights={allHighlights} />
      case "Image":
        return <ImageHighlight obj={highlight} />
      case "Code":
        return <CodeHighlight obj={highlight} editorClass="w-full" />
      default:
        return null
    }
  }

  const renderBookList = (item) => {
    const bookInfoArr = [];
    if (item?.volumeInfo?.publisher) {
      bookInfoArr.push(item?.volumeInfo?.publisher);
    }

    if (item?.volumeInfo?.publishedDate) {
      const year = item?.volumeInfo?.publishedDate.split('-')[0]
      bookInfoArr.push(year);
    }

    if (item?.volumeInfo?.pageCount && Number(item?.volumeInfo?.pageCount) > 0) {
      let pages = item?.volumeInfo?.pageCount + ' pages'
      bookInfoArr.push(pages);
    }

    let formatedBookInfo = "";
    if (bookInfoArr.length > 0) {
      formatedBookInfo = bookInfoArr.join(' . ');
    }



    return (
      // <div>
      //   <p style={{ background: 'white', border: '1px solid grey' }}
      //     value={item.id}
      //     onClick={(e) => onClickBook(e, item.id)}>{item.volumeInfo.title}</p>
      // </div>
      <div className="grid grid-cols-5 p-2 border-b-[1px] gap-1 cursor-pointer hover:bg-gray-100" key={item.id} onClick={(e) => onClickBook(e, item.id)}>
        <div className="p-[5px] flex justify-center items-center">
          {item?.volumeInfo?.imageLinks?.thumbnail &&
            <img className="object-contain" src={item?.volumeInfo?.imageLinks?.thumbnail} alt={item?.volumeInfo?.title || "no alt"} />
          }
        </div>
        <div className="col-span-4">
          {item.volumeInfo.title && <h5 className="font-semibold">{item.volumeInfo.title.length > 30 ? `${item.volumeInfo.title.substring(0, 30)}...` : item.volumeInfo.title}</h5>}
          {item.volumeInfo.authors && Array.isArray(item.volumeInfo.authors) && item.volumeInfo.authors.length > 0 && (
            <h6 className="text-gray-700 text-xs">{item.volumeInfo.authors.join(', ')}</h6>
          )}
          {formatedBookInfo && <div className="text-gray-700 text-xs">{formatedBookInfo}</div>}
          {item.volumeInfo.industryIdentifiers &&
            Array.isArray(item.volumeInfo.industryIdentifiers) &&
            item.volumeInfo.industryIdentifiers.length > 0 && (
              <h6 className="text-gray-700 text-xs">ISBN: {item?.volumeInfo?.industryIdentifiers[0]?.identifier}</h6>
            )}
        </div>
      </div>
    )
  }

  const currenyDropdown = () => {
    let currencySymbolObj = {}
    countriesCurreny.forEach((s) => {
      if (currencySymbolObj[s.symbol] === undefined) {
        currencySymbolObj[s.symbol] = `${s.iso} - ${s.symbol}`
      }
      else {
        currencySymbolObj[s.symbol] += `, ${s.iso} - ${s.symbol}`
      }
    })

      return(
        <Select
        value={currencySymbol}
        onChange={(value) => {
          const symbol = value.split('-')[1];
          setCurrencySymbol(symbol);
        }}
        className={`w-[80px]`}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) => {
          return (
            option.isoStr.toLowerCase().includes(input.toLowerCase())
          );
        }}
      >
        {Object.keys(currencySymbolObj).map((item, index) => {
          const value = currencySymbolObj[item];
          return (<Option value={item} key={`${index}-${item}`} isoStr={value}>
            {item.symbol}
          </Option>)
        })}
      </Select>
      )
  }

  // const handleSelectChange = (value) => {
  //   setReadStatus(value)
  //   
  // };

  //new
  const handleChangeAssetUrl = (e) => {
    const {value} = e.target;
    setAssetUrl(value)
  };

  const onKeyDownUrl = async(event) => {
    if (event.key === "Enter") {
      if (!assetUrl) return;
      const url = normalizeUrl(assetUrl)
      setAssetUrl(url)

      if(Validator.validate('url',url,true)){
      message.error(Validator.validate('url',url,true))
      handleClearFields()
      return;
    }

    if(selectedType?.name === 'PDF' && fileType === 'url'){
      setFetching(true)
      const res = await dispatch(savePDFUrl(url))

      const link = res?.payload?.data && res?.payload?.data?.length>0 && res?.payload?.data[0]

      const obj = {
          pdfFile: link,
          pdfSrc: link,
          pdfName:link?.split("/").pop()
        }
        getUploadInformation(obj)
        setFetching(false)
      return;
    }

    setIsRefreshing(true)
    setFetching(true)
    setShowThumbnail(true);
    const res = await readHtmlDocument(url)
    gemObj = {
      ...gemObj,
      assetUrl: url
    }

    if(selectedType?.name === 'Profile' || selectedType?.name === 'SocialFeed'){
      const data = getPlatformFromURL(url)
      setPlatformType(data)
      if(selectedType?.name === 'SocialFeed'){
        getUploadInformation({type:'platform',value: data})
      }else{
        getUploadInformation(data)
      }
    }

    if (res) {
      const tempTagsArr = res.keywords?.map(item => {
            return{
              id: item,
              tag: item
            }
          })
      setHeading(res.title)
      setDescription(res.description)
      // setShortendurl(res.shortendurl)
      setAllThumbnails(res.images)
      setImageUrl(res.images.length !== 0 ? res.images[0] : "")
      setSelectedTags([...tempTagsArr])
      gemObj = {
        ...gemObj,
        heading: res.title,
        description: res.description,
        imageUrl: res.images.length !== 0 ? res.images[0] : "",
        selectedTags: [...tempTagsArr],
        fileType:"url"
      }
      getUpdateInformation && getUpdateInformation(gemObj)
       
    }

    if(!res?.title || !res?.description || !res?.images){
      const urlVal     = encodeURIComponent(url);
      const resIframely = await dispatch(getBookmarkDetailsMicrolink(urlVal))
      if(resIframely?.payload?.data?.data?.iframely || (resIframely?.payload?.data?.data?.microlink && resIframely?.payload?.data?.data?.microlink?.status === 'success')){
        
        setHtml(resIframely?.payload?.data?.data?.iframely?.html || null)

        const {meta,links} = resIframely?.payload?.data?.data?.iframely

        const imgData = (links?.thumbnail && links?.thumbnail?.length>0) ? links?.thumbnail[0]?.href :
                    (links?.icon && links?.icon?.length>0) ? links?.icon[0]?.href : ''
        const favIconData = (links?.icon && links?.icon?.length>0) ? links?.icon[0]?.href : ''

        const data  = resIframely?.payload?.data?.data?.microlink && resIframely?.payload?.data?.data?.microlink?.data;

        setImageUrl(imgData || data?.image?.url || '')
        setFavIconImage({
            type:'image',
            icon: favIconData || data?.logo?.url || ''
          })
        setDefaultFavIconImage(favIconData || data?.logo?.url || '')
        setDefaultThumbnailImg(imgData || data?.image?.url || "")
        
        setHeading(meta?.title || data?.title || '')
          setDescription(meta?.title || data?.title || '')
          setFavIconImage({
            type:'image',
            icon: favIconData || data?.logo?.url || ''
          })
          setDefaultFavIconImage(favIconData || data?.logo?.url || '')
          setDefaultThumbnailImg(imgData || data?.image?.url || "")
          setDocImages([imgData || data?.image?.url, ...docImages])

          gemObj = {
          ...gemObj,
          html: resIframely?.payload?.data?.data?.iframely?.html || null,
          imageUrl: data?.image?.url || imgData || '',
          heading: meta?.title || data?.title || '',
          description: meta?.title || data?.title || '',
          fileType:"url"
        }

        getUpdateInformation && getUpdateInformation(gemObj)
      }
    }

   

    setIsRefreshing(false)
    setShowAssetUrlInput(false)
    setFetching(false)

    if(selectedType?.name === 'Profile' || selectedType?.name === 'SocialFeed'){
      const data = getPlatformFromURL(url)
      setPlatformType(data)
      if(selectedType?.name === 'SocialFeed'){
        getUploadInformation({type:'platform',value: data})
      }else{
        getUploadInformation(data)
      }
    }
    }

  };

  const onKeyDownShortUrl = async(event) => {
    if (event.key === "Enter") {
      setShowShortEndInput(false)
    }
  };

  const handleChangeCollapse = (key) => {
    setCollapseKeys(key)
  }

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

  const onFileChange = async (e) => {
        const { files } = e.target
        const file = files[0]
        const filePath = file.name;
        const fileSize = file.size / 1024 / 1024; // Convert to MB
        if (fileSize > 25) {
            message.error('File size must be less than 25MB');
            // setPdfFile(null)
            return
        }
        // setShowReset(true)
        if(selectedType?.name === 'PDF'){
        const obj = {
          pdfFile: file,
          pdfSrc:URL.createObjectURL(file),
          pdfName:file.name
        }
        getUploadInformation(obj)
        setFileType('file')
        updateFileType('file')
        const nameArr = filePath.split('.');
        nameArr.splice(-1);
        setHeading(nameArr.join('.'));
        return;
        }
        if(selectedType?.name === 'Audio'){
        const obj = {
          audioFile: file,
          audioSrc:URL.createObjectURL(file)
        }
        getUploadInformation(obj)
        setFileType('file')
        updateFileType('file')
        const nameArr = filePath.split('.');
        nameArr.splice(-1);
        setHeading(nameArr.join('.'));
        return;
        }
        if(selectedType?.name === 'Video'){
        const obj = {
          videoFile: file,
          videoSrc:URL.createObjectURL(file)
        }
        getUploadInformation(obj)
        setFileType('file')
        updateFileType('file')
        const nameArr = filePath.split('.');
        nameArr.splice(-1);
        setHeading(nameArr.join('.'));
        return;
        }
        if(selectedType?.name === 'Image'){
        // const url = URL.createObjectURL(file)
        // setImageFile(file)
        // setImageSrc(url)
        // URL.revokeObjectURL(file)
        const obj = {
          imageFile: file,
          imageSrc:URL.createObjectURL(file)
        }
        getUploadInformation(obj)
        setFileType('file')
        updateFileType('file')
        return;
        }
  }

  const handlePromptType = (e) => {
    setIsPublic(e.target.value)
  }

  const onScreenshotClick = async (e) => {
    const tabObj = tabDetails || (await fetchCurrentTab());
    if (tabObj) {
      dispatch(setActiveHomeTab("search-bookmark"));
      window.chrome.tabs.sendMessage(tabObj.id, {
        type: "SCREENSHOT_VIEW",
        value: true,
        tabId: tabObj.id,
      });
    }
    return false;
  };

  const renderLayout = () => {
    return (
      // <div className='h-full flex flex-col' onClick={onLayoutClick}>
      <div className="flex flex-col relative" onClick={onLayoutClick}>
        {!isHideHeader && (
          <Header
            label={props.pageTitle}
            isHideBackButton={isHideBackButton}
            isMenuItemEnabled={isMenuItemEnabled}
            onBackBtnClick={onBackBtnClick}
            menuItems={menuItems}
            MenuIcon={MenuIcon}
            isDownloadable={isDownloadable}
            onClose={onPanelCloseClick}
            onDownload={onDownload}
          />
        )}

        {fetching && (
          <div className="spin-overlay">
            <Spin tip={"Fetching..."} />
          </div>
        )}

        <div
          onClick={onLayoutClick}
          className="bg-[#F8FBFF] p-4 rounded-t-[16px] flex-1"
        >
          {(!currentGem ||
            (currentGem &&
              HIGHLIGHT_MEDIA_TYPES.indexOf(currentGem.media_type) === -1)) && (
            <div className="mb-2 flex justify-between space-x-2">
              <div className={classNames("flex-1", showTypeInput && "hidden")}>
                <h6 className="block text-xs font-medium text-gray-500 mb-1">
                  Collections
                </h6>
                <div
                  className="ct-relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => setShowCollectionInput(true)}
                    className="w-full"
                  >
                    <ComboBox
                      inputShown={showCollectionInput}
                      setShowCollectionInput={setShowCollectionInput}
                      collectionData={allCollections || []}
                      // collectionData={[...collections,...sharedCollections] || []}
                      userId={session.userId}
                      setSelectedCollection={onCollectionChange}
                      selectedCollection={selectedCollection}
                      error={error}
                    />
                  </div>
                </div>
              </div>
              <div
                className={classNames(
                  "flex-1",
                  showCollectionInput && "hidden"
                )}
              >
                <h6 className="block text-xs font-medium text-gray-500 mb-1">
                  Type
                </h6>
                <div
                  className="ct-relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => setShowTypeInput(true)}
                    className="w-full"
                  >
                    <TypeComboBox
                      inputShown={showTypeInput}
                      setShowTypeInput={setShowTypeInput}
                      updateInputShow={setShowTypeInput}
                      setSelectedType={setSelectedType}
                      type={selectedType}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* new changes */}
          <div className="mt-6 max-md:max-w-full flex items-center justify-between">
            <div className="text-md text-zinc-600">Editable Preview</div>

            <div className="flex items-center mr-2">
              <InformationCircleIcon
                className="text-[#347AE2] h-5 w-5 cursor-pointer"
                title="Tutorial video"
                onClick={() => setOpenTutorialVideoModal(true)}
              />

              {currentGem && (
                <div
                  className="cursor-pointer ml-2"
                  onClick={() => setShowModal(true)}
                  // disabled={loadingDelete}
                >
                  <TrashIcon className="text-red-400 h-4 w-4 mr-1" />
                </div>
              )}

              {!currentGem && (
                <div className="flex justify-end items-center ml-2">
                  <div className="flex justify-center items-start">
                    <button
                      className="cursor-pointer mr-1"
                      onClick={onRefreshBtnClick}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? (
                        <Spin size="small" />
                      ) : (
                        <IoMdRefresh className="w-5 h-5 text-gray-700 hover:text-[#347AE2]" />
                      )}
                    </button>
                    <button
                      onClick={handleClearFields}
                      className="bg-none outline-none text-gray-700 hover:text-gray-900 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {(selectedType?.name === "Ai Prompt" ||
            selectedType?.name === "Text Expander") && (
            <div className="mt-1">
              <div className="aiInput mb-2">
                <AntInput
                  type="text"
                  name="shortendurl"
                  addonBefore={"c:"}
                  placeholder={
                    selectedType?.name === "Text Expander"
                      ? "Enter expander name"
                      : selectedType?.name === "Ai Prompt"
                      ? "Enter prompt name"
                      : "Enter Shortend URL"
                  }
                  value={shortendurl}
                  error
                  onChange={(e) => setShortendurl(e.target.value)}
                  className="rounded-md"
                />
              </div>

              {selectedType?.name === "Ai Prompt" && (
                <div className="w-full flex items-center justify-end">
                  <Radio.Group
                    value={isPublic}
                    onChange={handlePromptType}
                    optionType="button"
                    buttonStyle="solid"
                    className="rounded-md"
                    disabled={
                      parseInt(selectedCollection?.id) ===
                      parseInt(process.env.NEXT_PUBLIC_AI_PROMPT_COLLECTION_ID)
                    }
                  >
                    <Radio.Button value={`public`}>
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-4 w-4 mr-1" />{" "}
                        <div>Public</div>
                      </div>
                    </Radio.Button>
                    <Radio.Button value={`private`}>
                      <div className="flex items-center">
                        <LockClosedIcon className="h-4 w-4 mr-1" />{" "}
                        <div>Private</div>
                      </div>
                    </Radio.Button>
                  </Radio.Group>
                </div>
              )}
            </div>
          )}

          <div
            className={`flex flex-col mt-2 bg-white rounded-lg max-md:max-w-full ${
              selectedType?.name !== "Note"
                ? "border border-solid border-[color:var(--greyscale-200,#ABB7C9)] p-3"
                : ""
            }`}
          >
            {/* mediatype ui here */}
            {selectedType?.name !== "Testimonial" &&
            selectedType?.name !== "Citation" &&
            selectedType?.name !== "Ai Prompt" &&
            selectedType?.name !== "Text Expander" ? (
              <MediaTypeUI
                setFavorite={setFavorite}
                favorite={favorite}
                assetUrl={assetUrl}
                showAssetUrlInput={showAssetUrlInput}
                setShowAssetUrlInput={setShowAssetUrlInput}
                setShowShortEndInput={setShowShortEndInput}
                onOpenImageDialog={onOpenImageDialog}
                showShortEndInput={showShortEndInput}
                setIsReaded={setIsReaded}
                isReaded={isReaded}
                selectedType={selectedType}
                shortendurl={shortendurl}
                setShortendurl={setShortendurl}
                onKeyDownUrl={onKeyDownUrl}
                onAssetURLBlur={onAssetURLBlur}
                handleChangeAssetUrl={handleChangeAssetUrl}
                onKeyDownShortUrl={onKeyDownShortUrl}
                currentGem={currentGem}
                imageUrl={imageUrl}
                // onAssetURLChange={onAssetURLChange}
                handlefileTypeChange={handlefileTypeChange}
                onFileChange={onFileChange}
                fileType={fileType}
                imageSrc={childImageSrc}
                pdfSrc={childPdfSrc}
                showBookSearchInput={showBookSearchInput}
                setShowBookSearchInput={setShowBookSearchInput}
                onSearchTerm={onSearchTerm}
                setSearchBooks={setSearchBooks}
                searchBooks={searchBooks}
                onClickBook={onClickBook}
                loadingBookMovie={loadingBookMovie}
                setReadStatus={setReadStatus}
                readStatus={readStatus}
                showMovieSearchInput={showMovieSearchInput}
                setShowMovieSearchInput={setShowMovieSearchInput}
                searchMovies={searchMovies}
                onClickMovie={onClickMovie}
                watchStatus={watchStatus}
                setWatchStatus={setWatchStatus}
                html={html}
                title={heading}
                onScreenshotClick={onScreenshotClick}
                handleClearFields={handleClearFields}
              >
                {props.children}
              </MediaTypeUI>
            ) : (
              <>{props.children}</>
            )}

            {selectedType?.name === "Note" ||
            selectedType?.name === "Testimonial" ||
            selectedType?.name === "Ai Prompt" ||
            selectedType?.name === "Text Expander" ||
            (selectedType?.name === "Citation" && !citationText) ? (
              <></>
            ) : (
              <div className="flex items-center justify-between">
                <div
                  onClick={() => onOpenImageDialog("favicon")}
                  className="w-fit"
                >
                  <FavIcon data={favIconImage || null} />
                </div>

                <div>
                  <BookmarkOptionComponent
                    selectedType={selectedType}
                    currencySymbol={currencySymbol}
                    setCurrencySymbol={setCurrencySymbol}
                    setProductPrice={setProductPrice}
                    productPrice={productPrice}
                    fileType={fileType}
                    setFavorite={setFavorite}
                    favorite={favorite}
                    tweetType={tweetType}
                    setTweetType={setTweetType}
                    imageSrc={childImageSrc}
                    onImageEditClick={onImageEditClick}
                    pdfSrc={childPdfSrc}
                    setPlatformType={setPlatformType}
                    platformType={platformType}
                    rate={rate}
                    setRate={setRate}
                    getUploadInformation={getUploadInformation}
                    assetUrl={assetUrl}
                    handleChangeAssetUrl={handleChangeAssetUrl}
                    onTextCopy={onTextCopy}
                    updateColor={updateColor}
                    highlightedColor={highlightedColor}
                  />
                </div>
              </div>
            )}

            {selectedType?.name === "Note" ||
            selectedType?.name === "Testimonial" ||
            selectedType?.name === "Ai Prompt" ||
            selectedType?.name === "Text Expander" ||
            (selectedType?.name === "Audio" && fileType === "record") ||
            (selectedType?.name === "Citation" && !citationText) ? (
              <></>
            ) : (
              <>
                {isTitleEditing ? (
                  <TextareaAutosize
                    onBlur={disableTitleInput}
                    onKeyDown={onKeyDownTitle}
                    value={heading || ""}
                    onChange={(e) => setHeading(e.target.value)}
                    className="text-xl font-medium text-gray-500 resize-none mt-2 !outline-none !focus:outline-none textarea-border"
                    autoFocus={true}
                  />
                ) : (
                  <div
                    className="mt-2 text-xl font-medium text-gray-500 break-words"
                    onClick={enableTitleInput}
                  >
                    {heading?.length > 50
                      ? heading?.slice(0, 50)?.concat("...")
                      : heading || "Enter a title"}
                  </div>
                )}

                {isDescriptionEditing ? (
                  <TextareaAutosize
                    onBlur={disableDescriptionInput}
                    onKeyDown={onKeyDownDescription}
                    value={description || ""}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 text-base text-gray-500 resize-none !outline-none !focus:outline-none textarea-border"
                    autoFocus={true}
                  />
                ) : (
                  <div
                    className="mt-2 text-base text-gray-500 break-words"
                    onClick={enableDescriptionInput}
                  >
                    {description?.length > 150
                      ? description?.slice(0, 150)?.concat("...")
                      : description ||
                        (selectedType?.name === "Blog"
                          ? "Enter short description"
                          : "Enter description")}
                  </div>
                )}
              </>
            )}

            {selectedType?.name === "Code" && (
              <div className="mt-4">
                <Input
                  size="medium w-full mb-2"
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  placeholder="Enter Language"
                />
              </div>
            )}

            {(selectedType?.name === "Book" ||
              selectedType?.name === "Movie") && (
              <div className="w-full flex mt-2 bookStatus flex-col">
                <h6 className="block text-xs font-medium text-gray-500 mb-1">
                  {selectedType?.name === "Book" ? "Read date" : "Watch date"}
                </h6>
                {selectedType?.name === "Book" ? (
                  <DatePicker
                    value={!dateRead ? dateRead : moment(dateRead)}
                    onChange={(date, dateStirng) => setDateRead(dateStirng)}
                    format={"YYYY-MM-DD"}
                    // allowClear={false}
                    showToday={false}
                    className="rounded-full border border-solid border-[#97A0B5] w-fit"
                    placeholder={"Read date"}
                  />
                ) : (
                  <DatePicker
                    value={!dateWatch ? dateWatch : moment(dateWatch)}
                    onChange={(date, dateStirng) => setDateWatch(dateStirng)}
                    format={"YYYY-MM-DD"}
                    // allowClear={false}
                    showToday={false}
                    className="rounded-full border border-solid border-[#97A0B5] w-fit"
                    placeholder={"Watch date"}
                  />
                )}
              </div>
            )}

            {selectedType?.name !== "Note" &&
              selectedType?.name !== "Ai Prompt" &&
              selectedType?.name !== "Text Expander" && (
                <div className="my-2 addBk-tag-wrapper bg-white p-2">
                  <ReactTags
                    tags={selectedTags?.map((t) => {
                      return {
                        id: t?.attributes?.tag || t?.tag,
                        text: t?.attributes?.tag || t?.tag,
                      };
                    })}
                    suggestions={prepareTags()}
                    delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                    handleDelete={onTagDelete}
                    handleAddition={onTagAdd}
                    inputFieldPosition="inline"
                    placeholder="Type to enter tags"
                    onClearAll={() => setSelectedTags([])}
                    clearAll
                    autocomplete
                    inline={true}
                  />
                </div>
              )}
          </div>

          <div className="addbk-collapse mt-4">
            <Collapse
              ghost
              expandIcon={(status) => {
                return (
                  <div>
                    {status.isActive ? (
                      <MdOutlineArrowDropDown className="h-6 w-6 text-[#141B34]" />
                    ) : (
                      <MdOutlineArrowRight className="h-6 w-6 text-[#141B34]" />
                    )}
                  </div>
                );
              }}
              activeKey={collapseKeys}
              onChange={handleChangeCollapse}
            >
              <Panel
                header={
                  <div className="text-[#4B4F5D] text-base">
                    Advanced Options
                  </div>
                }
                key="1"
              >
                {(selectedType?.name === "Ai Prompt" ||
                  selectedType?.name === "Text Expander") && (
                  <>
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => onOpenImageDialog("favicon")}
                        className="w-fit"
                      >
                        <FavIcon data={favIconImage || null} />
                      </div>

                      <div>
                        <BookmarkOptionComponent
                          selectedType={selectedType}
                          currencySymbol={currencySymbol}
                          setCurrencySymbol={setCurrencySymbol}
                          setProductPrice={setProductPrice}
                          productPrice={productPrice}
                          fileType={fileType}
                          setFavorite={setFavorite}
                          favorite={favorite}
                          tweetType={tweetType}
                          setTweetType={setTweetType}
                          imageSrc={childImageSrc}
                          onImageEditClick={onImageEditClick}
                          pdfSrc={childPdfSrc}
                          setPlatformType={setPlatformType}
                          platformType={platformType}
                          rate={rate}
                          setRate={setRate}
                          getUploadInformation={getUploadInformation}
                          assetUrl={assetUrl}
                          handleChangeAssetUrl={handleChangeAssetUrl}
                          onTextCopy={onTextCopy}
                          updateColor={updateColor}
                          highlightedColor={highlightedColor}
                        />
                      </div>
                    </div>

                    <>
                      {isTitleEditing ? (
                        <TextareaAutosize
                          onBlur={disableTitleInput}
                          onKeyDown={onKeyDownTitle}
                          value={heading || ""}
                          onChange={(e) => setHeading(e.target.value)}
                          className="text-xl font-medium text-gray-500 resize-none mt-2 !outline-none !focus:outline-none textarea-border w-full"
                          autoFocus={true}
                        />
                      ) : (
                        <div
                          className="mt-2 text-xl font-medium text-gray-500 break-words"
                          onClick={enableTitleInput}
                        >
                          {heading?.length > 50
                            ? heading?.slice(0, 50)?.concat("...")
                            : heading || "Enter a title"}
                        </div>
                      )}

                      {isDescriptionEditing ? (
                        <TextareaAutosize
                          onBlur={disableDescriptionInput}
                          onKeyDown={onKeyDownDescription}
                          value={description || ""}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-2 text-base text-gray-500 resize-none !outline-none !focus:outline-none textarea-border w-full"
                          autoFocus={true}
                        />
                      ) : (
                        <div
                          className="mt-2 text-base text-gray-500 break-words"
                          onClick={enableDescriptionInput}
                        >
                          {description?.length > 150
                            ? description?.slice(0, 150)?.concat("...")
                            : description || "Enter description"}
                        </div>
                      )}
                    </>
                  </>
                )}

                {(selectedType?.name === "Note" ||
                  selectedType?.name === "Ai Prompt" ||
                  selectedType?.name === "Text Expander") && (
                  <div className="my-2 addBk-tag-wrapper bg-white p-2">
                    <ReactTags
                      tags={selectedTags?.map((t) => {
                        return { id: t.tag, text: t.tag };
                      })}
                      suggestions={prepareTags()}
                      delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                      handleDelete={onTagDelete}
                      handleAddition={onTagAdd}
                      inputFieldPosition="bottom"
                      placeholder="Enter Tag"
                      onClearAll={() => setSelectedTags([])}
                      clearAll
                      // autocomplete
                    />
                  </div>
                )}

                <div className="pt-4">
                  <h6 className="block text-xs font-medium text-gray-500 mb-1">
                    Remarks
                  </h6>
                  <TextareaAutosize
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add your remarks"
                    minRows={4}
                    className="w-full rounded-md resize-none !outline-none !focus:outline-none textarea-border"
                  />
                </div>
              </Panel>
            </Collapse>
          </div>

          <div className="mt-4">
            {(selectedType?.name === "Link" ||
              selectedType?.name === "Book" ||
              selectedType?.name === "Article" ||
              selectedType?.name === "Video") &&
            gemHighlights?.length > 0
              ? gemHighlights?.map((highlight) => {
                  return (
                    <div className="mb-1">
                      {renderHighlight(highlight, gemHighlights)}
                    </div>
                  );
                })
              : null}
          </div>
        </div>

        {(selectedType?.name === "Ai Prompt" || selectedType?.name === "Text Expander") && (
          <div className="mt-4 px-[16px]">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <label className="text-xs font-medium text-gray-500 mr-2">
                  Enabled all sites
                </label>
                <Tooltip title="It will enable on all sites">
                  <BsInfoCircle className="text-[#347AE2] h-4 w-4 cursor-pointer" />
                </Tooltip>
              </div>
              <Switch checked={enableSites} 
                      onChange={(checked) => setEnableSites(checked)}
                      style={{ background: enableSites ? "#1890ff" : "#00000040" }} />
              </div>
              <div className="flex justify-between flex-col w-full mt-4">
                <label className="text-xs font-medium text-gray-500 mb-2">Priority Sites</label>
                    <div className="w-full">
                      <Select value={prioritySites}
                              onChange={(items) => {
                                setPrioritySites(items);
                              }}
                              mode="tags"
                              placeholder="Select sites"
                              className="w-full"
                              maxTagCount={3}
                              options={AI_SITES.map((site) => {
                                return {
                                  label: <div className="flex items-center">
                                            <img src={site.icon} alt={site.site} className="h-5 w-5 mr-2" />
                                            <div>{site.label}</div>
                                          </div>,
                                  value: site.site
                                }
                              })} />
                    </div>
                  </div>
              {selectedType?.name === "Ai Prompt" && (
                <div className="flex justify-between flex-col w-full mt-4">
                  <label className="text-xs font-medium text-gray-500 mb-2">
                    Prompt Category
                  </label>
                  <div className="w-full">
                    <Select
                      value={promptCategory}
                      onChange={(val) => {
                        setPromptCategory(val);
                      }}
                      placeholder="Select prompt category"
                      className="w-full"
                      options={PROMPT_CATEGORY?.map((item) => { return { label: item, value: item } })}
                    />
                  </div>
                </div>
              )}
          </div>
        )}

        <div className="mb-4 mt-4 px-[16px] flex justify-end items-center sticky bottom-5 right-0 z-5">
          {/* <div>
                {currentGem && (
                  <Button
                    variant="secondary small text-xs"
                    // onClick={onDeleteClick}
                    onClick={() => setShowModal(true)}
                  >
                    {processing ? "Loading" : `Delete`}
                  </Button>
                )}
              </div> */}
          <Button variant="primary small text-xs" onClick={onSubmitClick}>
            {processing ? "Loading" : `Save to collection`}
          </Button>
        </div>

        <div className={showModal ? "pop-box2" : ""}>
          {showModal && (
            <div className="border-t-[1px]">
              <div className="px-[10px] py-[13px]">
                <h1 className="mr-10">
                  Confirm delete{" "}
                  {currentGem.title && currentGem.title.length > 35
                    ? currentGem.title.slice(0, 35).concat("...")
                    : currentGem.title}
                  {gemHighlights &&
                    Array.isArray(gemHighlights) &&
                    gemHighlights.length > 0 && (
                      <>
                        <br></br>
                        <span>
                          This will delete highlights related to it, do you want
                          to delete all
                        </span>
                      </>
                    )}
                  ?
                </h1>
                <div className="flex justify-start items-center gap-3 mt-4">
                  <button
                    className="yes-btn"
                    onClick={() => onDeleteClick()}
                    disabled={loadingBtn}
                  >
                    {loadingBtn ? "Deleting..." : "Yes"}
                  </button>
                  <button
                    className="no-btn"
                    onClick={() => setShowModal(false)}
                    disabled={loadingBtn}
                  >
                    No
                  </button>
                </div>
              </div>
              {/* <Modal
                      showOpen={showModal}
                      deleteCollections={
                        currentObj &&
                        currentObj.obj &&
                        currentObj.obj.media !== undefined
                          ? onDeleteGem
                          : onDeleteCollection
                      }
                      edit={showEdit}
                      cancel={onCloseModal}
                      collectionName={
                        currentObj && currentObj.name
                          ? currentObj.name
                          : currentObj?.obj && currentObj?.obj?.title
                          ? currentObj.obj.title
                          : ""
                      }
                    /> */}
            </div>
          )}
          {/* </div> */}
        </div>

        {/* {
              openIconModal && <DialogModal
                  open={openIconModal}
                  setOpen={setOpenIconModal}
                  handleEmoji={handleEmoji}
                  handleColor={handleColor}
                  handleImageUploadChange={handleIconImageUploadChange}
                  selectedEmoji={selectedEmoji}
                  selectedColor={selectedColor}
                  setSelectedEmoji={setSelectedEmoji}
                  setSelectedColor={setSelectedColor}
                  handleCoverModalSubmit={handleIconCoverModalSubmit}
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                  resetCancelValues={resetCancelValues}
                  loadingImg={loadingImg}
                  handleIcon={handleIcon}
                  selectedIcon={selectedIcon}
                  handleRemoveIconModalSubmit={handleRemoveIconModalSubmit}
                  defaultFavIconImage={defaultFavIconImage}
                  currentGem={currentGem}
                  setOpenIconModal={setOpenIconModal}
                  setFavIconImage={setFavIconImage}
                  setDefaultFavIconImage={setDefaultFavIconImage}
                  setLoadingImg={setLoadingImg}
                  setSelectedIcon={setSelectedIcon}
                  />
            } */}

        {/* {!isHideFooter && <div className='bg-white px-4 py-2 border-t-2 fixed bottom-0 w-full footer-container'>
                    <Footer processing={processing} onButtonClick={onSubmitClick} buttonLabelText={buttonLabelText} />
                </div>} */}

        {openTutorialVideoModal && (
          <TutorialVideoModal
            selectedType={selectedType?.name || selectedType}
            openTutorialVideoModal={openTutorialVideoModal}
            setOpenTutorialVideoModal={setOpenTutorialVideoModal}
          />
        )}
      </div>
    );
  }

  return loader 
          ? <LayoutCommon 
              showThumbnailBox={isOpenImageDialog} 
              currentImageBoxTab={openImageDialogTab} 
              siteImages={docImages}
              currentIcon={currentIcon}
              currentThumbnail={currentThumbnail}
              currentURL={assetUrl}
              isSetResetOpt={true}
              onResetIcon={onResetIcon}
              onThumbnailSelect={onThumbnailSelect}
              onIconSelect={onIconSelect}
              onImageBoxClose={onImageDialogClose}
              defaultIcon={defaultFavIconImage}
              defaultThumbnail={defaultThumbnailImg}
              platform="gem">
                {renderLoader()}
            </LayoutCommon> 
          : <LayoutCommon 
              showThumbnailBox={isOpenImageDialog} 
              currentImageBoxTab={openImageDialogTab}
              onImageBoxClose={onImageDialogClose}
              siteImages={docImages}
              currentURL={assetUrl}
              isSetResetOpt={true}
              onResetIcon={onResetIcon}
              currentIcon={currentIcon}
              currentThumbnail={currentThumbnail}
              onThumbnailSelect={onThumbnailSelect}
              defaultIcon={defaultFavIconImage}
              defaultThumbnail={defaultThumbnailImg}
              onIconSelect={onIconSelect}
              setTextExtract={setTextExtract}
              platform="gem">
                {renderLayout()}
            </LayoutCommon>
}

export default OperationLayout
