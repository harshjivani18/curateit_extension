import React                            from 'react'
import { MdOutlineOpenInNew }           from "react-icons/md";
import { useNavigate }                  from 'react-router-dom';
import { useDispatch }                  from 'react-redux';
import { HeartIcon,
         PencilSquareIcon, 
         TrashIcon }                    from '@heroicons/react/24/outline'
import { HeartIcon as SolidHeartIcon }  from '@heroicons/react/20/solid'
import { Tooltip }                      from 'antd';
import GlobeLogo                        from '../../images/globe.png'

import { setCurrentGem,
         setCurrentMedia }              from '../../actions/gem';
import { getBookmarkAccessType } from '../../utils/find-collection-id';
import FavIconComponent from '../layouts/FavIconComponent';
import { updateGem, updateUsageCount } from '../../actions/gems';
import { setExpandedKeys, setLoadedKeys, updateBookmarkWithExistingCollection } from '../../actions/collection';

const Common = (props) => {
    // const covers        = props.obj?.metaData?.covers
    const navigate      = useNavigate()
    const dispatch      = useDispatch()
    const onPageOpen = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const { obj, parent,resetKeys } = props
        dispatch(setLoadedKeys([]))
        dispatch(setExpandedKeys([]))
        resetKeys && resetKeys()

        const count = !obj.usageCount ? 1 : parseInt(obj.usageCount) + 1
        if(obj?.media_type === 'Article' && !obj?.isRead){
            const payload = {
                ...obj,
                isRead: true,
                usageCount: count
            }
            delete payload.id
            dispatch(updateGem(obj.id, { data: payload }))
            dispatch(updateUsageCount(obj.id))
            dispatch(updateBookmarkWithExistingCollection({ ...obj,isRead: true, usageCount: count }, {id: parent.id}, false, "update"))
        } else {
            const payload = {
                ...obj,
                usageCount: count
            }
            delete payload.id
            dispatch(updateUsageCount(obj.id))
            dispatch(updateBookmarkWithExistingCollection({ ...obj, usageCount: count}, {id: parent.id}, false, "update"))

        }
        if (obj && obj.url) {
            window.open(obj.url, "_blank")
        }
        return false
    }
    const permissions = getBookmarkAccessType(props?.sharedCollections,props?.obj?.id)
    const onEditClick = (e) => {
        dispatch(setCurrentGem({ ...props.obj, parent: props.parent }))
        dispatch(setCurrentMedia(props.obj?.media || null))
        if (props.parent.id && props.obj.id && props.obj.media_type === "Note") {
            navigate(`/note`)
        }
        if(props.parent.id && props.obj.id && props.obj.media_type === "Highlight") {
            navigate(`/highlight-panel`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Code") {
            navigate(`/codesnippet-panel`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Image") {
            navigate(`/image-panel`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Audio") {
            navigate(`/audio-panel`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Video") {
            navigate(`/video-panel`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "PDF") {
            navigate(`/upload-pdf`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Article") {
            navigate(`/article`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "App") {
            navigate(`/app-gem`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Product") {
            navigate(`/product`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Book") {
            navigate(`/book`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Movie") {
            navigate(`/movie`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Twitter") {
            navigate(`/twitter`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Profile") {
            navigate(`/profile-gem`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Ai Prompt") {
            navigate(`/ai-prompt`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Text Expander") {
            navigate(`/text`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Quote") {
            navigate(`/quote`)
        }
        else if(props.parent.id && props.obj.id && props.obj.media_type === "Screenshot") {
            navigate(`/screenshot`)
        }
        else if (props.parent.id && props.obj.id && props.obj.media_type === "SocialFeed") {
            navigate(`/social-feed`)
        }
        else if (props.parent.id && props.obj.id && props.obj.media_type === "Citation") {
            navigate(`/citations`)
        }
        else if (props.parent.id && props.obj.id && props.obj.media_type === "Testimonial") {
            navigate(`/testimonial`)
        }
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
    
    return (
        <dd className="mt-1" onClick={onPageOpen}>
            <div className='flex justify-between items-center group'>
                <div className='flex justify-start items-center gap-1 cursor-pointer'>
                     <button className='bg-[#F8FBFF] rounded-sm'>
                        {/* {covers && covers.length !== 0 
                            ? <img style={{height:"14px", width:"14px"}} src={covers[0]} alt="pdf icon" />
                            : <img style={{height:"14px", width:"14px"}} src={props.icon} alt="pdf icon" />
                        } */}
                        {/* <img style={{height:"14px", width:"14px"}} src={props.icon} alt="pdf icon" onError={(e) => { e.target.src = null; e.target.src = GlobeLogo; }} /> */}
                        <FavIconComponent data={props?.obj?.metaData?.icon} showThumbnail={true} renderingPlace='list' 
                        defaultImgSrc={props.icon}/>
                        
                     </button> 
                    <span className='text-sm text-gray-600 ml-1'>
                        <Tooltip title={props.obj?.title}>
                            {(props.obj.title === null)? props.obj?.media[0]?.text?.length > 30 ? props.obj?.media[0]?.text.slice(0,30).concat("...") : props.obj?.media[0]?.text : props.obj?.title?.length > 30 ? props.obj?.title.slice(0,30).concat("...") : props.obj?.title}
                        </Tooltip>
                    </span>                                                                
                </div>
                {(!permissions || (permissions && (permissions?.accessType === 'editor' || permissions?.accessType === 'owner'))) ? <div className='flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100'>
                    {/* {props.obj.is_favourite ? <SolidHeartIcon className="w-5 h-5 text-[#FB5959]" onClick={onToggleFav} /> : <HeartIcon className="w-5 h-5" onClick={onToggleFav} />} */}
                    <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 cursor-pointer' onClick={onPageOpen}/>
                    <button onClick={(e)=>{
                        e.stopPropagation()
                        onEditClick(props)
                    }}>
                        <PencilSquareIcon className='w-5 h-5 text-gray-400' />
                    </button>
                    {/* <button onClick={onDeleteClick}>
                        <TrashIcon className='w-5 h-5 text-gray-400' />
                    </button> */}
                </div> :<div></div>}
            </div>
        </dd>
    )
}

export default Common