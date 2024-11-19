import React, { useState, useEffect }               from "react";
import { useSelector,
         useDispatch }                              from "react-redux";
import { useNavigate, useLocation }                 from "react-router-dom";

import OperationLayout                              from '../../components/layouts/OperationLayout'
import session                                      from "../../utils/session";
import { panelClose }                               from "../../utils/message-operations";

import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection }     from '../../actions/collection'
import { addGem, setArticleText, updateGem }                        from "../../actions/gems";
import { removeDuplicates }                         from "../../utils/equalChecks";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { message } from "antd";
import { MEDIUM_REGEX, MEDIUM_REPLACEMENT_STR, TEXT_MESSAGE } from "../../utils/constants";

let currentParentDetails            = null;

const ArticlePage = (props) => {
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const location                      = useLocation()
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [processing, setProcessing]   = useState(false)
    const [socialObj, setSocialObj]     = useState(null)
    const [articleObj, setArticleObj]   = useState(null)
    const [articleText, 
           setArticleDocText]           = useState("")

    const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])

    useEffect(() => {
        const fetchStorageData = () => {
            window.chrome.storage.local.get(["socialObject", "articleDetails", "articleText"], (data) => {
                if (data?.socialObject?.post) {
                    setSocialObj(data?.socialObject?.post);
                    window.chrome.storage.local.remove("socialObject");
                }
                if (data?.articleDetails) {
                    setArticleObj(data?.articleDetails)
                    window.chrome.storage.local.remove("articleDetails")
                }
                if (data?.articleText) {
                    setArticleDocText(`${data?.articleText}`)
                    window.chrome.storage.local.remove("articleText")
                }
            });
          };
          const queryParams = new URLSearchParams(location.search);
          if (queryParams.get("refreshed") === "true") {
            fetchStorageData();
          }
          fetchStorageData();
    }, [location]);

    const onSubmitBookmark = async (obj) => {
        const mediaCovers  = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers  = removeDuplicates(mediaCovers)
        let finalObj = {
            title: obj.heading,
            description: obj.description,
            expander: obj.shortUrlObj,
            media_type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            author: session.userId ? parseInt(session.userId) : null,
            url: obj.assetUrl,
            media: {
                covers: finalCovers,
                articleObj: articleObj
            },
            metaData: {
                type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
                title: obj.heading,
                icon: obj?.favIconImage || '',
                url: obj.assetUrl,
                covers: finalCovers,
                docImages: obj.docImages,
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            collection_gems: obj.selectedCollection.id,
            remarks: obj.remarks,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            is_favourite: obj.favorite,
            creatorName: obj?.creatorName,
            releaseDate: obj?.releaseDate,
            entityId: obj?.entityId,
            isRead: obj.isReaded,
            entityObj: obj?.object,
            showThumbnail: obj?.showThumbnail,
        }
        setProcessing(true)
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
            const o = {
                ...finalObj,
                tags: obj.selectedTags
            }
            const isCollectionChanged = currentGem?.parent.id !== obj.selectedCollection.id;
            if (isCollectionChanged) {
                o["collection_id"] = obj.selectedCollection.id
                o["collection_gems"] = obj.selectedCollection
            }

            if(isSelectedCollectionShared){
                finalObj ={
                    ...finalObj,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
                await dispatch(updateGem(currentGem?.id, { data: finalObj }))
                dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '',isCurrentCollectionShared))
                dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : o))
                // dispatch(getSharedCollections())
                setProcessing(false)
                return navigate("/search-bookmark")
            }
            await dispatch(updateGem(currentGem?.id, { data: finalObj }))
            dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : finalObj, obj.selectedCollection, isCollectionChanged, "update", currentGem?.parent))
            setProcessing(false)
            return navigate("/search-bookmark")
        }

        isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
            finalObj ={
                ...finalObj,
                 author: isSelectedCollectionShared?.data?.author?.id
            }
        }
        const gemRes      = await dispatch(addGem({ data: finalObj }))
        if (gemRes.error === undefined && gemRes.payload.error === undefined) {
            const { data } = gemRes.payload
            if (data.data) {
                const d      = data.data;
                // const gTags  = d.tags.map((t) => { return { id: t.id, tag: t.tag }})
                const g      = {
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
                    creatorName: d?.creatorName,
                    releaseDate: d?.releaseDate,
                    entityId: d?.entityId,
                    entityObj: d?.entityObj,
                    isRead: d?.isRead,
                    showThumbnail: d?.showThumbnail
                }
                dispatch(setArticleText(articleText, obj.assetUrl))
                if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }
                dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
            }
        }
        setProcessing(false)
        return navigate("/search-bookmark")
    }

    const handleUpdateInformation = (gemObj) => {
        setDetails({...details,...gemObj})
    }

    return (
        <OperationLayout 
            currentGem={currentGem}
            processing={processing}
            onButtonClick={onSubmitBookmark}
            pageTitle={currentGem ? "Update article" : "Add new article"}
            isHideBackButton={false}
            isHideHeader={props.isHideHeader || false}
            mediaType={"Article"}
            onPanelClose={panelClose}
            socialObj={socialObj}
            setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
            getUpdateInformation = {handleUpdateInformation}
        >
            {(!currentGem && details?.imageUrl) && 
            <div className="gradient-add-bookmark-div">
                  <img src={details?.imageUrl}
                    alt={details?.title || details?.description || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
            </div>
            }

            {
            (!currentGem && !details?.imageUrl) && <div className={`gradient-add-bookmark-div flex justify-center items-center py-16 w-full bg-sky-100 rounded-lg max-md:px-5 px-16`}></div>  
            }
            
            {
            currentGem &&
            <div className="gradient-add-bookmark-div">
                  <img src={(currentGem?.metaData?.covers && currentGem?.metaData?.covers?.length>0) ? currentGem?.metaData?.covers?.[0]?.replace("resize:fill:112:112", "resize:fit:2400")?.replace("resize:fill:40:40", "resize:fit:2400")?.replace("_SY160", "_SY800")?.replace(MEDIUM_REGEX, MEDIUM_REPLACEMENT_STR) : ''}
                    alt={currentGem?.title || currentGem?.description || ""} 
                    className='w-full object-cover block h-[200px] rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
            </div>
            }
        </OperationLayout>
    )
}

export default ArticlePage