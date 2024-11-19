import React, { useEffect, useState }                          from "react";
import { useSelector,
         useDispatch }                              from "react-redux";
import { useNavigate }                              from "react-router-dom";

import OperationLayout                              from '../../components/layouts/OperationLayout'
import session                                      from "../../utils/session";
import { panelClose }                               from "../../utils/message-operations";

import { addGemToSharedCollection, fetchTechDomainDetails, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection }     from '../../actions/collection'
import { addGem, updateGem }                        from "../../actions/gems";
import { removeDuplicates }                         from "../../utils/equalChecks";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { message } from "antd";
import { TEXT_MESSAGE } from "../../utils/constants";

let currentParentDetails            = null;

const AppGemPage = (props) => {
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [processing, setProcessing]   = useState(false)

    const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])

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
                covers: finalCovers
            },
            metaData: {
                type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
                title: obj.heading,
                icon: obj.favIconImage || null,
                url: obj.assetUrl,
                covers: finalCovers,
                docImages: obj.docImages,
                defaultIcon: obj?.defaultFavIconImage || null,
                defaultThumbnail: obj?.defaultThumbnailImg || null,
            },
            collection_gems: obj.selectedCollection.id,
            remarks: obj.remarks,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            is_favourite: obj.favorite,
            showThumbnail: obj?.showThumbnail
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
            const isCollectionChanged = currentGem?.parent.id !== obj.selectedCollection.id;
            const o = {
                ...finalObj,
                tags: obj.selectedTags
            }
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
        const res = await dispatch(fetchTechDomainDetails(finalObj?.url))
        const techStack = res?.payload?.data?.technologystack || [];

        finalObj= {
            ...finalObj,
            media: {
                ...finalObj.media,
                techStack: techStack
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
                    showThumbnail: d?.showThumbnail
                }
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
            pageTitle={currentGem ? "Update app" : "Add new app"}
            isHideBackButton={false}
            isHideHeader={props.isHideHeader || false}
            mediaType={"App"}
            onPanelClose={panelClose}
            setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
            getUpdateInformation = {handleUpdateInformation}
        >
            {(!currentGem && details?.imageUrl) && <div className="gradient-add-bookmark-div">
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
                  <img src={(currentGem?.metaData?.covers && currentGem?.metaData?.covers?.length>0) ? currentGem?.metaData?.covers[0] : ''}
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

export default AppGemPage