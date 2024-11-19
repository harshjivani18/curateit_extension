import * as ReactIcons from 'react-icons/ri';
import { Emoji, EmojiStyle } from 'emoji-picker-react';
import { useNavigate, useParams } from "react-router-dom";
import LayoutCommon from "../../components/commonLayout/LayoutCommon"
import ImageModal from '../../components/modal/ImageModal';
import { KEY_CODES } from "../../utils/constants";
import { WithContext as ReactTags } from 'react-tag-input';
import { useSelector } from "react-redux";
import { addTag } from "../../actions/tags";
import { updateUserTags } from "../../actions/user";
import { getAllCollectionWithSub, getAllLevelCollectionPermissions, getCollectionById } from "../../utils/find-collection-id";
import session from "../../utils/session";
import ParentComboBox from "../../components/combobox/ParentComboBox";
import { useDispatch } from "react-redux";
import Input from "../../components/input/Input";
import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Button from "../../components/Button/Button";
// import DialogModal from '../../components/modal/Dialog';
import { deleteCollection, getSingleCollection, moveCollection, moveCollectionShared, moveToRoot, removeAccessEmail, removeSharedCollection, setExpandedKeys, setLoadedKeys, updateCollection, updateSharedCollection, uploadIcons } from '../../actions/collection';
import { Spin, message } from 'antd';
import {TEXT_MESSAGE} from '../../utils/constants'
import ShareCollectionDrawer from '../../components/common/Drawer/ShareCollectionDrawer';
import MultiSelectTypeComboBox from '../../components/combobox/MultiSelectTypeComboBox';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const EditCollection = () => {
    const dispatch = useDispatch()
    const { id } = useParams()
    const navigate = useNavigate()
    
    const userTags = useSelector((state) => state.user.userTags)
    const collectionData = useSelector((state) => state.collection.collectionData)
    const {sharedCollections,singleCollection} = useSelector(state => state.collection)
    const [currentTab, setCurrentTab] = useState('covers')
    const [currentCollectionAccessType,setCurrentCollectionAccessType] = useState(null)

    const data = getCollectionById([...collectionData,...sharedCollections],Number(id))

    

    const [loading,setLoading] = useState(false)
    const [loadingImg,setLoadingImg] = useState(false)
    const [buttonLoading,setButtonLoading] = useState(false)
    const [open, setOpen]                   = useState(false);
    const [collectionName,setCollectionName] = useState(data ? data.name : '')
    const [selectedTags,setSelectedTags] = useState(data && data?.tags ? data?.tags : [])
    // const [selectedType, setSelectedType]   = useState(data && data?.media_type ? data?.media_type : 'All');
    const [selectedType, setSelectedType] = useState([]);
    const [defaultSelectedType, setDefaultSelectedType] = useState(data?.media_type);
    const [otherSelectedType, setOtherSelectedType] = useState([]);
    
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [showCollectionInput, 
           setShowCollectionInput]          = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(
      data?.is_sub_collection
        ? { id: data?.collection?.id || "", name: data?.collection?.name || "" }
        : "Parent folder"
    );
    
    // const [selectedEmoji, setSelectedEmoji] = useState(data?.avatar?.type === 'emoji' ? data?.avatar?.icon: '');
    // const [selectedColor, setSelectedColor] = useState(data?.avatar?.type === 'color' ? data?.avatar?.icon: '')
    // const [selectedImage, setSelectedImage] = useState(data?.avatar?.type === 'image' ? data?.avatar?.icon: '')
    // const [selectedIcon, setSelectedIcon] = useState(data?.avatar?.type === 'icon' ? data?.avatar?.icon: '')
    const [avatarCoverDataEdit,setAvatarCoverDataEdit]= useState(data?.avatar ? data?.avatar : '')
     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const [allCollectionsData,setAllCollectionsData]= useState([])
    const [isCurrentCollectionShared, setIsCurrentCollectionShared] = useState(false)
    const [openShareCollection, setOpenShareCollection] = useState(false)

    const [currentIcon, setCurrentIcon]             = useState(data?.avatar?.type === 'icon' ? data?.avatar : '')
    const [currentThumbnail, setCurrentThumbnail]   = useState(data?.background?.icon ? data?.background?.icon : '')
    const [backgroundDataEdit, setBackgroundDataEdit] = useState(data?.background ? data?.background : '')

    useEffect(() => {
        const getCall = async () => {
            setLoading(true)
            const res = await dispatch(getSingleCollection(id, true));
            if (res?.payload?.data?.data?.attributes) {
              setSelectedCollection(
                res?.payload?.data?.data?.attributes?.is_sub_collection
                  ? {
                      id:
                        res?.payload?.data?.data?.attributes?.collection?.data
                          ?.id || "",
                      name:
                        res?.payload?.data?.data?.attributes?.collection?.data
                          ?.attributes?.name || "",
                    }
                  : "Parent folder"
              );
                setBackgroundDataEdit(res?.payload?.data?.data?.attributes?.background || '')
                setCurrentThumbnail(res?.payload?.data?.data?.attributes?.background?.icon || '')
                // setSelectedType(res?.payload?.data?.data?.attributes?.media_type || 'All')
                setSelectedTags(res?.payload?.data?.data?.attributes?.tags?.data || [])
                const otherMediatypes = Array.isArray(
                  res?.payload?.data?.data?.attributes?.otherSupportedMediaTypes
                )
                  ? [
                      ...res?.payload?.data?.data?.attributes
                        ?.otherSupportedMediaTypes,
                    ]
                  : [];
      const mt = res?.payload?.data?.data?.attributes?.media_type
        ? [res?.payload?.data?.data?.attributes?.media_type]
        : [];
      setSelectedType([...mt,...otherMediatypes]);
      setDefaultSelectedType(res?.payload?.data?.data?.attributes?.media_type);
            }
            const data = getAllLevelCollectionPermissions(sharedCollections,Number(id))
            setCurrentCollectionAccessType(data)
            setLoading(false)
        }
        getCall()
    },[id])
    

     useEffect(() => {
        if(sharedCollections && sharedCollections.length>0){
            const filtered = sharedCollections?.filter(item => item?.accessType !== 'viewer')
            const currentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,data?.id)
            if(currentCollectionShared){
                setAllCollectionsData([...filtered])
                setIsCurrentCollectionShared(true)
                return;
            }
            setAllCollectionsData([...collectionData,...filtered])
            setIsCurrentCollectionShared(false)
        }else{
            setAllCollectionsData([...collectionData])
            setIsCurrentCollectionShared(false)
        }
    },[sharedCollections,data,collectionData])

    const onTagAdd = async (tag) => {
        const existingIdx = userTags?.findIndex((t) => { return t.tag === tag.text })
        if (existingIdx !== -1) {
            setSelectedTags([ ...selectedTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }])
        }
        else {
            const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
            if (res.error === undefined && res.payload.error === undefined) {
                setSelectedTags([ ...selectedTags, { id: res.payload?.data?.data?.id, tag: tag.text } ])
                dispatch(updateUserTags(res.payload?.data?.data))
            }
            return res;
        }
    }
    
    const onTagDelete = (i) => {
        selectedTags.splice(i, 1)
        setSelectedTags([ ...selectedTags ])
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

    const onLayoutClick = () => {
        setShowCollectionInput(false)
        setShowTypeInput(false)
    }

    const renderThumbnailEdit = () => {
        
        const Icon = avatarCoverDataEdit  && avatarCoverDataEdit?.type === 'icon' && ReactIcons[avatarCoverDataEdit?.icon];
        return (
            <div>
                <div className="relative">
                <div onClick={()=> { setOpen(true); setCurrentTab("covers")}}>
                        {!backgroundDataEdit && (
                            <div className="flex justify-center align-middle border-2 p-1 mt-1 border-gray-300 rounded-sm cursor-pointer">
                                <img className='w-[40px] h-[40px] rounded-lg fit-image' src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/default-img-paceholder.png`} alt={"Curateit"} />
                            </div>
                        )}

                        {backgroundDataEdit?.type === "unsplash" && (
                            <>
                                <img
                                    className="w-[48px] h-[48px] rounded-lg"
                                    src={backgroundDataEdit.icon}
                                    alt={collectionName || "Curateit"}
                                />
                            </>
                        )}

                        {backgroundDataEdit?.type === "gallery" && (
                            <div className="flex items-center justify-center">
                                <div
                                    style={{
                                    height: "20px",
                                    width: "40px",
                                    // borderRadius: "50%",
                                    background: backgroundDataEdit.icon,
                                    }}
                                ></div>
                            </div>
                        )}
                        {backgroundDataEdit?.type === "upload" && (
                            <>
                            <img
                                className="w-[48px] h-[48px] rounded-lg"
                                src={backgroundDataEdit.icon}
                                alt={collectionName || "Curateit"}
                            />
                            </>
                        )}
                    </div>
                    <div className='bg-white  rounded-lg pointer text-center' 
                            style={{height: avatarCoverDataEdit && avatarCoverDataEdit?.type === 'image' ? '48px' : ' inherit',
                            width: avatarCoverDataEdit && avatarCoverDataEdit?.type === 'image' ? '48px' : ' inherit'}}
                            onClick={()=> { setOpen(true); setCurrentTab("favicon")}}>
                        {!avatarCoverDataEdit &&
                            <img className='w-[40px] h-[40px] rounded-lg fit-image' src={`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/default-emoji-placeholder.png`} alt={"Curateit"} />
                        }
                        {/* img */}
                        {avatarCoverDataEdit  && avatarCoverDataEdit?.type === 'image' &&
                                <>
                                <img className='w-[48px] h-[48px] rounded-lg' src={avatarCoverDataEdit?.icon} alt={"Curateit"} />
                                </>
                        }
                        {/* emoji */}
                        {
                            avatarCoverDataEdit  && avatarCoverDataEdit?.type === 'emoji' && <div className="flex items-center justify-center">
                                <Emoji
                                    unified={avatarCoverDataEdit?.icon}
                                    emojiStyle={EmojiStyle.APPLE}
                                    size={22}
                                />
                            </div>
                        }
                        {
                            avatarCoverDataEdit  && avatarCoverDataEdit?.type === 'color' && <div className="flex items-center justify-center">
                                <div style={{height:'20px',width:'20px',borderRadius:'50%',background: avatarCoverDataEdit?.icon}}>
                                </div>
                            </div>
                        }
                        {
                            avatarCoverDataEdit  && avatarCoverDataEdit?.type === 'icon' && <div className="flex items-center justify-center">
                            <Icon style={{fontSize:'20px'}}/>
                            </div>
                        }
                    </div>
                    
                </div>

                {/* <div 
               onClick={()=>setOpen(prev=>!prev)}
              className='w-48px py-[2px] bg-white flex justify-center align-middle border-2 border-gray-300 rounded-sm cursor-pointer mt-1'>
                <img src="/icons/image-up.svg" alt="up icon" className="h-[18px]" />
              </div> */}

            </div>
        )
    }

    const resetValues = () => {
        // setSelectedEmoji('')
        // setSelectedColor('')
        // setSelectedImage('')
        setAvatarCoverDataEdit('')
        setCollectionName()
        setSelectedTags([])
        setSelectedType([])
        setCurrentTab('covers')
        setCurrentThumbnail(null)
        setBackgroundDataEdit(null)
        setAvatarCoverDataEdit(null)
        setCurrentIcon(null)
        setOpen(false)
        // setSelectedIcon('')
        setSelectedCollection('')
        setOpenShareCollection(false)
    }

    // const handleEmoji = (emojiData) => {
    //     setSelectedEmoji(emojiData)
    //     setSelectedColor('')
    //     setSelectedImage('')
    //     setSelectedIcon('')
    // }

//     const handleColor = (newColor) =>{
//     setSelectedColor(newColor.hex);
//     setSelectedEmoji('')
//     setSelectedImage('')
//     setSelectedIcon('')
//   }

//     const handleIcon = (iconName) =>{
//     setSelectedIcon(iconName)
//     setSelectedColor('');
//     setSelectedEmoji('')
//     setSelectedImage('')
//   }

    // const handleImageUploadChange = async(files) => {
    //     setSelectedImage(files)
    //     setSelectedColor('');
    //     setSelectedEmoji('')
    //     setSelectedIcon('')
    // };

    // const handleCoverModalSubmit = async() => {
    //         if(selectedImage){
    //             setLoadingImg(true)
    //             const formData = new FormData();

    //             formData.append('file',selectedImage)

    //             const res = await dispatch(uploadIcons(formData))

    //             if(res.error === undefined){
    //                 setLoadingImg(false)
    //                 setSelectedImage(res.payload?.data?.message || '')
    //                 setAvatarCoverDataEdit({
    //                     icon: res.payload?.data?.message || '',
    //                     type: 'image'
    //                 })
    //                 setOpen(false)
    //             }else{
    //                 setLoadingImg(false)
    //                 setSelectedImage('')
    //                 setOpen(false)
    //                 setAvatarCoverDataEdit('')
    //             }

    //             return;
    //         }

    //         if(selectedColor){
    //             setAvatarCoverDataEdit({
    //                     icon: selectedColor || '',
    //                     type: 'color'
    //                 })
    //             setOpen(false)
    //             return;
    //         }

    //         if(selectedEmoji){
    //             setAvatarCoverDataEdit({
    //                     icon: selectedEmoji.unified || '',
    //                     type: 'emoji'
    //                 })
    //             setOpen(false)
    //             return;
    //         }

    //         if(selectedIcon){
    //             setAvatarCoverDataEdit({
    //                     icon: selectedIcon,
    //                     type: 'icon'
    //                 })
    //             setOpen(false)
    //             return;
    //         }
    // }

    // const resetCancelValues = () => {
    //         setSelectedEmoji(data?.avatar?.type === 'emoji' ? data?.avatar?.icon: '')
    //         setSelectedColor(data?.avatar?.type === 'color' ? data?.avatar?.icon: '')
    //         setSelectedImage(data?.avatar?.type === 'image' ? data?.avatar?.icon: '')
    //         setSelectedIcon(data?.avatar?.type === 'icon' ? data?.avatar?.icon: '')
    //         setOpen(false)
    // }

    const handleDefaultType = (item) => {
      setDefaultSelectedType(item.name);

      const isExists = selectedType.filter((p) => {
        if (typeof p === "object" && p !== null) {
          return p.name === item.name;
        } else if (typeof p === "string") {
          return p === item.name;
        }
        return true;
      });

      if (isExists && isExists?.length === 0) {
        setSelectedType((prev) => [...prev, item]);
      }
    };

    const handleSubmit = async () => {
        let isDuplicateName = false;
        let allCollections = getAllCollectionWithSub(allCollectionsData)
        allCollections.forEach(col => {
        if (
            col?.name &&
            col.name.toLowerCase() === collectionName.toLowerCase() &&
            Number(id) !== col?.id
        ) {
            isDuplicateName = true
            return false
        }
        })

        if(isDuplicateName){
        message.error(`${collectionName} already exist. Collection name must be unique.`)
        return;
        }

        if(!collectionName) {
            message.error('Please enter collection name')
            return
        }

        if (!defaultSelectedType) {
          message.error("Please select default media type");
          return;
        }

        dispatch(setLoadedKeys([]))
        dispatch(setExpandedKeys([]))

        const filteredType = selectedType.filter((p) => {
          if (typeof p === "object" && p !== null) {
            return p.name !== defaultSelectedType;
          } else if (typeof p === "string") {
            return p !== defaultSelectedType;
          }
          return true; // handle any other types if necessary
        });

        const mapped = filteredType.map((item) => {
          if (typeof item === "object" && item !== null) {
            return item.name;
          } else if (typeof item === "string") {
            return item;
          }
          return null; // Handle other types if necessary
        });

            if(typeof selectedCollection === 'string'  && selectedCollection.toLowerCase() === 'parent folder'){  
                const isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,id)
                setButtonLoading(true)
                let payload = {
                  name: collectionName,
                  tags: selectedTags?.map((t) => {
                    return t.id;
                  }),
                  author: session.userId,
                  avatar:
                    typeof avatarCoverDataEdit === "object"
                      ? avatarCoverDataEdit
                      : null,
                  background:
                    typeof backgroundDataEdit === "object"
                      ? backgroundDataEdit
                      : null,
                  media_type:
                    typeof defaultSelectedType === "object"
                      ? defaultSelectedType?.name
                      : defaultSelectedType,
                  otherSupportedMediaTypes: mapped,
                };

                if(isSelectedCollectionShared){
                payload = {
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
                const res = await dispatch(updateCollection(id,payload,selectedTags))

                if(res.error === undefined){
                    const g = {
                    ...data,
                    ...res.payload.data.data.attributes,
                    tags: selectedTags
                    }
                    dispatch(updateSharedCollection(id,g))
                    setButtonLoading(false)
                    message.success(TEXT_MESSAGE.COLLECTION_UPDATE_TEXT)
                    resetValues()
                    return navigate(`/search-bookmark`)
                }else{
                    setButtonLoading(false)
                    message.error(TEXT_MESSAGE.ERROR_TEXT)
                    resetValues()
                }
                return;
                }

                if(!isSelectedCollectionShared){
                const res = await dispatch(updateCollection(id,payload,selectedTags))

                if(res.error === undefined){
                    setButtonLoading(false)
                    message.success(TEXT_MESSAGE.COLLECTION_UPDATE_TEXT)
                    resetValues()
                    return navigate(`/search-bookmark`)
                }else{
                    setButtonLoading(false)
                    message.error(TEXT_MESSAGE.ERROR_TEXT)
                    resetValues()
                }

                }
            }

            if((typeof selectedCollection === 'string' &&  selectedCollection.toLowerCase() === 'make it parent folder') || (typeof selectedCollection === 'object' && selectedCollection.id === null && selectedCollection.name.toLowerCase() === 'make it parent folder')){
            const isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,id)
            if(isSelectedCollectionShared){
                message.error(`You cant move shared collection to parent folder`)
                return;
            }
            setButtonLoading(true)
            let payload = {
              name: collectionName,
              tags: selectedTags?.map((t) => {
                return t.id;
              }),
              author: session.userId,
              avatar:
                typeof avatarCoverDataEdit === "object"
                  ? avatarCoverDataEdit
                  : null,
              background:
                typeof backgroundDataEdit === "object"
                  ? backgroundDataEdit
                  : null,
              media_type:
                typeof defaultSelectedType === "object"
                  ? defaultSelectedType?.name
                  : defaultSelectedType,
              otherSupportedMediaTypes: mapped,
            };

            const res = await dispatch(updateCollection(id,payload,selectedTags))

            if(res.error === undefined){
                if(!isSelectedCollectionShared){
                    const dragObj = {
                    ...data,
                    ...res.payload.data.data.attributes,
                    tags:selectedTags
                }
                const res1 = await dispatch(moveToRoot(id,dragObj))
                if(res1.error === undefined){
                setButtonLoading(false)
                message.success(TEXT_MESSAGE.COLLECTION_UPDATE_TEXT)
                resetValues()
                return navigate(`/search-bookmark`)
                }else{
                setButtonLoading(false)
                message.error(TEXT_MESSAGE.ERROR_TEXT)
                resetValues()
                }
                }
            } else{
                setButtonLoading(false)
                message.error(TEXT_MESSAGE.ERROR_TEXT)
                resetValues()
            }
            return;
            }

            if(typeof selectedCollection === 'object' && selectedCollection.id === data?.collection?.id){
            const isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,id)
            setButtonLoading(true)
            let payload = {
              name: collectionName,
              tags: selectedTags?.map((t) => {
                return t.id;
              }),
              author: session.userId,
              avatar:
                typeof avatarCoverDataEdit === "object"
                  ? avatarCoverDataEdit
                  : null,
              background:
                typeof backgroundDataEdit === "object"
                  ? backgroundDataEdit
                  : null,
              media_type:
                typeof defaultSelectedType === "object"
                  ? defaultSelectedType?.name
                  : defaultSelectedType,
              otherSupportedMediaTypes: mapped,
            };

            if(isSelectedCollectionShared){
                payload = {
                    ...payload,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
                const res = await dispatch(updateCollection(id,payload,selectedTags))

                if(res.error === undefined){
                    const g = {
                    ...data,
                    ...res.payload.data.data.attributes,
                    tags: selectedTags
                    }
                    dispatch(updateSharedCollection(id,g))
                    setButtonLoading(false)
                    message.success(TEXT_MESSAGE.COLLECTION_UPDATE_TEXT)
                    resetValues()
                    return navigate(`/search-bookmark`)
                }else{
                    setButtonLoading(false)
                    message.error(TEXT_MESSAGE.ERROR_TEXT)
                    resetValues()
                }
                return;
                }

                if(!isSelectedCollectionShared){
                const res = await dispatch(updateCollection(id,payload,selectedTags))

                if(res.error === undefined){
                    setButtonLoading(false)
                    message.success(TEXT_MESSAGE.COLLECTION_UPDATE_TEXT)
                    resetValues()
                    return navigate(`/search-bookmark`)
                }else{
                    setButtonLoading(false)
                    message.error(TEXT_MESSAGE.ERROR_TEXT)
                    resetValues()
                }

                }

            return;
            }

            if(typeof selectedCollection == 'object' && selectedCollection?.id !== data?.collection?.id){
            const isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,selectedCollection.id)
            if(isSelectedCollectionShared && isCurrentCollectionShared){
                message.error(`You cant move shared collection to other shared collection`)
                return;
            }
            setButtonLoading(true)
            let payload = {
              name: collectionName,
              tags: selectedTags?.map((t) => {
                return t.id;
              }),
              author: session.userId,
              avatar:
                typeof avatarCoverDataEdit === "object"
                  ? avatarCoverDataEdit
                  : null,
              background:
                typeof backgroundDataEdit === "object"
                  ? backgroundDataEdit
                  : null,
              media_type:
                typeof defaultSelectedType === "object"
                  ? defaultSelectedType?.name
                  : defaultSelectedType,
              otherSupportedMediaTypes: mapped,
            };

            if(isSelectedCollectionShared && !isCurrentCollectionShared){
                let dragObj = {
                    ...data,
                    tags:selectedTags,
                }
                const dropObj = getCollectionById(allCollectionsData,selectedCollection?.id)
                dragObj = {
                    ...dragObj,
                    collection: {...dropObj},
                    is_sub_collection: true
                }

                const res = dispatch(moveCollectionShared(Number(id),selectedCollection?.id,dragObj,'moveOwnToShare'))

                if(res.error === undefined){
                    payload = {
                            ...payload,
                            author: isSelectedCollectionShared?.data?.author?.id,
                            collection: selectedCollection?.id
                        }
                        const res1 = await dispatch(updateCollection(id,payload,selectedTags))
                        if(res1.error === undefined){
                        setButtonLoading(false)
                        message.success(TEXT_MESSAGE.COLLECTION_UPDATE_TEXT)
                        resetValues()
                        return navigate(`/search-bookmark`)
                        }else{
                        setButtonLoading(false)
                        message.error(TEXT_MESSAGE.ERROR_TEXT)
                        resetValues()
                        }
                } else{
                    setButtonLoading(false)
                    message.error(TEXT_MESSAGE.ERROR_TEXT)
                    resetValues()
                }
                return;
            }

            const res = await dispatch(updateCollection(id,payload,selectedTags))

            if(res.error === undefined){
                let dragObj = {
                    ...data,
                    ...res.payload.data.data.attributes,
                    tags:selectedTags
                }

                if(!isSelectedCollectionShared){
                const dropObj = getCollectionById(collectionData,selectedCollection?.id)
                const res1 = await dispatch(moveCollection(Number(id),selectedCollection?.id,dragObj,dropObj))
                if(res1.error === undefined){
                setButtonLoading(false)
                message.success(TEXT_MESSAGE.COLLECTION_UPDATE_TEXT)
                resetValues()
                return navigate(`/search-bookmark`)
                }else{
                setButtonLoading(false)
                message.error(TEXT_MESSAGE.ERROR_TEXT)
                resetValues()
                }
                }
            } else{
                setButtonLoading(false)
                message.error(TEXT_MESSAGE.ERROR_TEXT)
                resetValues()
            }
            return;
            }
    }
    
    const handleRemoveCollection = async(id) => {
        const isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,id)
        if(!isSelectedCollectionShared){
            setButtonLoading(true)
            const res = await dispatch(deleteCollection(id))

            if(res.error === undefined){
                message.success(TEXT_MESSAGE.COLLECTION_DELETE_TEXT)
                setButtonLoading(false)
                return navigate(`/search-bookmark`)
            }else{
            setButtonLoading(false)
            message.success(TEXT_MESSAGE.ERROR_TEXT)
        }
        }

        if((isSelectedCollectionShared?.accessType === 'viewer')){
            message.error('You dont have permission to delete this shared collection')
            return;
        }

        if(isSelectedCollectionShared?.accessType === 'editor'){
            setButtonLoading(true)
            const parsed = currentCollectionAccessType ? JSON.parse(currentCollectionAccessType?.data?.usersViaMail) : []
            const userToken = parsed?.filter(item => item?.id === Number(session?.userId))
            const res = await dispatch(removeAccessEmail(userToken[0].token, id));

            if(res.error === undefined){
                dispatch(removeSharedCollection(id))
                setButtonLoading(false);
                message.success("Access removed successfully");
                return navigate(`/search-bookmark`)
            }else{
                setButtonLoading(false)
                message.success(TEXT_MESSAGE.ERROR_TEXT)
            }
            return;
        }

        if(isSelectedCollectionShared?.accessType === 'owner'){
        setButtonLoading(true)
        const res = await dispatch(deleteCollection(id,isSelectedCollectionShared))

        if(res.error === undefined){
            message.success(TEXT_MESSAGE.COLLECTION_DELETE_TEXT)
            setButtonLoading(false)
            return navigate(`/search-bookmark`)
        }else{
            setButtonLoading(false)
            message.success(TEXT_MESSAGE.ERROR_TEXT)
        }
        }
    }

    const onImageBoxClose = () => {
        setOpen(false)
        setCurrentTab('covers')
    }

    const onThumbnailSelect = (icon) => {
        setCurrentThumbnail(icon.icon)
        setBackgroundDataEdit(icon)
        setCurrentTab('covers')
        setOpen(false)
    }

    const onIconSelect = (icon) => {
        setCurrentIcon(icon)
        setAvatarCoverDataEdit(icon)
        setCurrentTab('covers') 
        setOpen(false)
    }

    return (
      <LayoutCommon>
        {loading ? (
          <div className="layout-loader-container">
            <Spin tip="Loading ..." />
          </div>
        ) : (
          <>
            <div className="flex flex-col h-screen" onClick={onLayoutClick}>
              <Header
                label={"Edit Collection"}
                isHideBackButton={false}
                isMenuItemEnabled={false}
                onBackBtnClick={false}
                menuItems={[]}
                MenuIcon={null}
                isDownloadable={false}
                // onClose={onPanelCloseClick}
                onDownload={false}
              />
              <div className="grid grid-cols-8 gap-2 p-2">
                {renderThumbnailEdit()}
                <div className="col-span-7">
                  <Input
                    size="medium w-full mb-2"
                    type="text"
                    name="title"
                    placeholder="Enter collection name"
                    value={collectionName || ""}
                    onChange={(e) => setCollectionName(e.target.value)}
                  />

                  <div className="pt-4 flex justify-between space-x-2">
                    <div
                      className={classNames(
                        "flex-1",
                        showTypeInput && "hidden"
                      )}
                    >
                      <h6 className="block text-xs font-medium text-gray-500 mb-1">
                        Parent collection
                      </h6>
                      <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          onClick={() => setShowCollectionInput(true)}
                          className="w-full"
                        >
                          <ParentComboBox
                            inputShown={showCollectionInput}
                            setShowCollectionInput={setShowCollectionInput}
                            collectionData={allCollectionsData || []}
                            userId={session.userId}
                            setSelectedCollection={setSelectedCollection}
                            selectedCollection={selectedCollection}
                            action="edit"
                            isSubCollection={
                              data ? data.is_sub_collection : false
                            }
                            id={id}
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
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          onClick={() => setShowTypeInput(true)}
                          className="w-full"
                        >
                          {/* <ParentTypeComboBox 
                                    inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} updateInputShow={setShowTypeInput} setSelectedType = {setSelectedType} type={selectedType} 
                                    /> */}
                          <MultiSelectTypeComboBox
                            inputShown={showTypeInput}
                            setShowTypeInput={setShowTypeInput}
                            updateInputShow={setShowTypeInput}
                            setSelectedType={setSelectedType}
                            // type={selectedType}
                            selectedType={selectedType}
                            action={"edit"}
                            defaultSelectedType={defaultSelectedType}
                            setDefaultSelectedType={setDefaultSelectedType}
                            otherSelectedType={otherSelectedType}
                            setOtherSelectedType={setOtherSelectedType}
                            handleDefaultType={handleDefaultType}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h6 className="block text-xs font-medium text-gray-500 mb-1">
                      Tags
                    </h6>
                    <div className="bg-white border-2 border-gary-400 p-2 rounded-lg">
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
                        inputFieldPosition="bottom"
                        placeholder="Enter Tag"
                        onClearAll={() => setSelectedTags([])}
                        clearAll
                        autocomplete
                      />
                    </div>
                  </div>

                  {currentCollectionAccessType &&
                  (currentCollectionAccessType?.accessType === "editor" ||
                    currentCollectionAccessType?.accessType === "viewer") ? (
                    <></>
                  ) : (
                    <div className="my-4 px-[16px] flex justify-end items-center">
                      <Button
                        variant="primary small text-xs"
                        onClick={handleSubmit}
                        disabled={buttonLoading}
                      >
                        {buttonLoading ? "Loading" : `Save`}
                      </Button>
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-between w-full">
                    <div
                      className="text-[#1890ff] font-medium cursor-pointer"
                      onClick={() => {
                        navigate(`/share-collection/${id}`);
                        setShowDeleteConfirm(false);
                      }}
                    >
                      Share collection
                    </div>
                    {currentCollectionAccessType &&
                    currentCollectionAccessType?.accessType === "viewer" ? (
                      <></>
                    ) : (
                      <div
                        onClick={() => {
                          setOpenShareCollection(false);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-[#EB5757] font-medium cursor-pointer mr-4"
                      >
                        Remove collection
                      </div>
                    )}
                  </div>

                  {open && (
                    <ImageModal
                      currentTab={currentTab}
                      onClose={onImageBoxClose}
                      currentIcon={currentIcon}
                      currentThumbnail={currentThumbnail}
                      onThumbnailSelect={onThumbnailSelect}
                      onIconSelect={onIconSelect}
                      platform={"collection"}
                    />
                  )}

                  {/* {
                        open && <DialogModal
                        open={open}
                        setOpen={setOpen}
                        handleEmoji={handleEmoji}
                        handleColor={handleColor}
                        handleImageUploadChange={handleImageUploadChange}
                        selectedEmoji={selectedEmoji}
                        selectedColor={selectedColor}
                        setSelectedEmoji={setSelectedEmoji}
                        setSelectedColor={setSelectedColor}
                        handleCoverModalSubmit={handleCoverModalSubmit}
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                        resetCancelValues={resetCancelValues}
                        loadingImg={loadingImg}
                        handleIcon={handleIcon}
                        selectedIcon={selectedIcon}
                        />
                    } */}
                </div>
              </div>

              <div
                className={showDeleteConfirm ? "pop-box2" : ""}
                style={{ marginLeft: 0 }}
              >
                <div
                  className={
                    showDeleteConfirm === true ? "popup-delete-model" : ""
                  }
                >
                  {showDeleteConfirm && (
                    <div className="border-t-[1px]">
                      <div className="popup-delete bg-white">
                        <h1 className="content-h">
                          Confirm delete{" "}
                          {data?.name && data?.name?.length > 35
                            ? data?.name?.slice(0, 35).concat("...")
                            : data?.name}
                          ?
                        </h1>
                        <div className="btnn-pop">
                          <button
                            className="yes-btn"
                            onClick={() => handleRemoveCollection(Number(id))}
                          >
                            Yes
                          </button>
                          <button
                            className="no-btn"
                            onClick={() => setShowDeleteConfirm(false)}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {openShareCollection && (
                <div className="relative mt-4">
                  <div className="pointer-ui"></div>
                  <div className="border border-solid border-[#DADEE8] rounded-[6px] relative p-2">
                    <ShareCollectionDrawer
                      singleCollectionDetails={
                        singleCollection?.attributes || data
                      }
                      collectionId={Number(id)}
                      openShareCollection={openShareCollection}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </LayoutCommon>
    );
}

export default EditCollection;