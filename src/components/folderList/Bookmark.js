import "./Bookmark.css"
import React                            from 'react'
import { useDispatch }                  from 'react-redux';
import { MdOutlineOpenInNew }           from "react-icons/md";
import { HeartIcon }                    from '@heroicons/react/24/outline'
import { HeartIcon as SolidHeartIcon }  from '@heroicons/react/20/solid'
import { PencilSquareIcon, TrashIcon }  from '@heroicons/react/24/outline'
import { Tooltip }                      from 'antd';

import GlobeLogo                        from '../../images/globe.png'

import { setCurrentGem, 
         setCurrentMedia, 
         updateGem}              from '../../actions/gem';
import { getBookmarkAccessType } from '../../utils/find-collection-id';
import FavIconComponent from '../layouts/FavIconComponent';
import { updateUsageCount } from '../../actions/gems';
import { setExpandedKeys, setLoadedKeys, updateBookmarkWithExistingCollection } from '../../actions/collection';

const Bookmark = (props) => {
    // 
    const dispatch  = useDispatch()
    const covers    = props.obj?.metaData?.covers
    const onPageOpen = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const { obj,parent ,resetKeys} = props;
        
        dispatch(setLoadedKeys([]))
        dispatch(setExpandedKeys([]))
        resetKeys && resetKeys()

        const count = !obj.usageCount ? 1 : parseInt(obj.usageCount) + 1
        if(obj?.media_type === 'Article' && !obj?.isRead){
            const payload = {
                author: obj?.author?.id,
                collection_gems : obj?.collection_gems?.id,
                description: obj?.description,
                expander: obj?.expander,
                is_favourite: obj?.is_favourite,
                media: obj?.media,
                media_type: obj?.media_type,
                metaData: obj?.metaData,
                remarks: obj?.remarks,
                showThumbnail: obj?.showThumbnail,
                url: obj?.url,
                title: obj?.title,
                tags: obj?.tags,
                isRead: true,
                usageCount: count
            }
            dispatch(updateGem(obj.id, { data: payload }))
            dispatch(updateUsageCount(obj.id))
            dispatch(updateBookmarkWithExistingCollection({ ...obj,isRead: true, usageCount: count }, {id: parent.id}, false, "update"))
            props?.isFromArticlePage && props?.updateReadStatus(obj)
        } else {
            dispatch(updateUsageCount(obj.id))
            dispatch(updateBookmarkWithExistingCollection({ ...obj, usageCount: count}, {id: parent.id}, false, "update"))
        }

        if (obj && obj.url) {
            window.open(obj.url, "_blank")
        }
        return false
    }

    const onEditClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(setCurrentGem({ ...props.obj, parent: props.parent }))
        dispatch(setCurrentMedia(props.obj.media))
        props.editGem({ ...props.obj, parent: props.parent })
        return false
    }

    const onDeleteClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        props.modalDelete(props)
        return false
    }

    const onToggleFav = (e) => {
        e.preventDefault()
        e.stopPropagation()
        return false
    }

    const permissions = getBookmarkAccessType(props?.sharedCollections || [],props?.obj?.id)

    return (
        <dd className="mt-1" onClick={onPageOpen}>
            <div className='flex justify-between items-center group'>
                <div className='flex justify-start items-center gap-1 cursor-pointer'>
                    {/* <img className='h-4 w-4' src={`${props.obj?.metaData?.icon}`} /> */}
                    {/* {props.obj.mediaType === "Highlight" ?
                     <button className='bg-[#F8FBFF] p-[2px] rounded-sm'>
                        <img className='h-5 w-5' src="/icons/pencil-icon.svg" alt="pencil icon" />
                     </button> 
                     :
                        (((covers && covers.length > 0 && covers[0]) || props.obj?.metaData?.icon) && props.obj?.showThumbnail)
                      ? <img className='h-4 w-4' src={ props.obj?.metaData?.icon ? `${props.obj?.metaData?.icon}` : `${covers[0]}`} alt={props.obj?.title} 
                        onError={(e) => { e.target.src = null; e.target.src = GlobeLogo }} />
                      : 
                      <button className='bg-[#F8FBFF] rounded-sm'>
                        <img style={{height:"14px", width:"14px"}} src="/icons/bookmark-svgrepo-com.svg" alt="pdf icon" />
                     </button> 
                    } */}

                    <FavIconComponent data={props?.obj?.metaData?.icon} showThumbnail={true} renderingPlace='list' 
                    defaultImgSrc={props.obj.mediaType === "Highlight" ? "/icons/pencil-icon.svg" : "/icons/bookmark-svgrepo-com.svg"}/>

                    <span className='text-sm text-gray-600 ml-1 ct-bookmark-title-span'>
                        {/* <span onClick={(e)=> window.open(`${props.obj?.url}`,"_blank")}> */}
                        <Tooltip title={props.obj?.title}>
                        {props.obj?.title?.length > 35 ? props.obj?.title.slice(0,35).concat("...") : props.obj?.title}
                        </Tooltip>
                        {/* </span> */}
                    </span>                                                                
                </div>
                <div className='flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100'>
                    {/* {props.obj.is_favourite ? <SolidHeartIcon className="w-5 h-5 text-[#FB5959]" onClick={onToggleFav} /> : <HeartIcon className="w-5 h-5" onClick={onToggleFav} />} */}
                    <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 cursor-pointer' onClick={onPageOpen}/>
                    {(!permissions || (permissions && (permissions?.accessType === 'editor' || permissions?.accessType === 'owner'))) ?<button onClick={onEditClick}>
                        <PencilSquareIcon className='w-5 h-5 text-gray-400' />
                    </button> : ''}
                    {/* <button onClick={() => props.deleteGems(props.obj, props.parentId)}> */}
                    {/* <button onClick={onDeleteClick}>
                        <TrashIcon className='w-5 h-5 text-gray-400' />
                    </button> */}
                </div>
            </div>
        </dd>
    )
}

export default Bookmark