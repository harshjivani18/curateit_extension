import React, { useEffect, useState }                          from "react";
import { useSelector,
         useDispatch }                              from "react-redux";
import { useLocation, useNavigate }                              from "react-router-dom";

import OperationLayout                              from '../../components/layouts/OperationLayout'
import session                                      from "../../utils/session";
import { panelClose }                               from "../../utils/message-operations";

import {  addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection }     from '../../actions/collection'
import { addGem, updateGem }                        from "../../actions/gems";
import { removeDuplicates }                         from "../../utils/equalChecks";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { DatePicker, Rate, Select, Space, message } from "antd";
import { MEDIUM_REGEX, MEDIUM_REPLACEMENT_STR, TEXT_MESSAGE } from "../../utils/constants";

import moment from "moment";

let currentParentDetails            = null

const BookPage = (props) => {
  const location    = useLocation();
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)
    const [processing, setProcessing]   = useState(false)
    const [rate, setRate]=useState(currentGem ? parseFloat(currentGem?.media?.myRating || 0) : 0)
    const [readStatus, setReadStatus]=useState(currentGem ? currentGem?.media?.status : 'to-read')
    const [dateRead, setDateRead]=useState(currentGem ? currentGem?.media?.readStart : moment().format('YYYY-MM-DD'))

    const [details,setDetails] = useState(null)
    useEffect(() => {
        if(currentParentDetails){
            const data = currentParentDetails()
            setDetails(data)
        }
    },[currentParentDetails])
   

    useEffect(() => {
        const fetchStorageData = () => {
          window.chrome.storage.local.get("gdReadsRating", (data) => {
            if (data && data.gdReadsRating) {
                setRate(data.gdReadsRating || 0)
            }
          });
        };
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get("refreshed") === "true") {
          fetchStorageData();
        }
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
                myRating: rate,
                myStatus: readStatus,
                dateRead: dateRead,
                readStart: dateRead,
                status: readStatus,
            },
            metaData: {
                type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
                title: obj.heading,
                icon: obj?.favIconImage || '',
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || null,
                docImages: [ obj?.imageUrl, ...obj.docImages ],
                url: obj.assetUrl,
                covers: finalCovers
            },
            collection_gems: obj.selectedCollection.id,
            remarks: obj.remarks,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            is_favourite: obj.favorite,
            creatorName: obj?.creatorName,
            releaseDate: obj?.releaseDate,
            entityId: obj?.entityId,
            entityObj: obj?.object,
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
                dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : finalObj))
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
            pageTitle={currentGem ? "Update book" : "Add new book"}
            isHideBackButton={false}
            isHideHeader={props.isHideHeader || false}
            mediaType={"Book"}
            onPanelClose={panelClose}
            setCurrentDetailsFunc={(parentFunc) => { currentParentDetails = parentFunc }}
            getUpdateInformation = {handleUpdateInformation}
            dateRead={dateRead}
            setDateRead={setDateRead}
            setReadStatus={setReadStatus}
            readStatus={readStatus}
            rate={rate}
            setRate={setRate}
        >
        {/* <div className="pt-4 star-rating">
                          <h6 className="block text-xs font-medium text-gray-500 mb-1">Rating</h6>
                          <Rate value={rate} allowHalf onChange={(value)=>setRate(value)}/>
                      </div>

                      <div className='pt-1 flex justify-between space-x-2'>
                          <div className="pt-4 star-rating">
                              <h6 className="block text-xs font-medium text-gray-500 mb-1">Date Read</h6>
                              <Space direction="vertical" size={12}>
                                  <DatePicker 
                                value={!dateRead ? dateRead : moment(dateRead)}
                                onChange={(date, dateStirng) => setDateRead(dateStirng)}
                                format={"YYYY-MM-DD"}
                                allowClear={false}
                                showToday={false}
                                />
                              </Space>
                          </div>

                          <div className="pt-4 star-rating">
                              <h6 className="block text-xs font-medium text-gray-500 mb-1">Status</h6>
                              <Space wrap>
                                  <Select
                                  placeholder='Select status'
                                  value={readStatus}
                                  style={{ width: 170 }}
                                  onChange={(value) => setReadStatus(value)}
                                  allowClear
                                  options={[
                                      { value: 'read', label: 'Read' },
                                      { value: 'currently-reading', label: 'Currently Reading' },
                                      { value: 'to-read', label: 'To Read' },
                                  ]}
                                  />
                              </Space>
                          </div>
                      </div> */}

        <div className="gradient-add-bookmark-div">
                  <img src={details?.imageUrl?.replace("resize:fill:112:112", "resize:fit:2400")?.replace("resize:fill:40:40", "resize:fit:2400")?.replace("_SY160", "_SY800")?.replace(MEDIUM_REGEX, MEDIUM_REPLACEMENT_STR)}
                    alt={details?.title || details?.description || ""} 
                    className='w-full object-cover block rounded-lg'
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}
                  />
                </div>
        </OperationLayout>
    )
}

export default BookPage