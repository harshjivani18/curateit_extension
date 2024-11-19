import React, { useState }          from 'react'
import * as ReactIcons              from 'react-icons/ri';
import { useSelector }              from 'react-redux';
import { BsFolderFill, BsFolder }   from "react-icons/bs";
import { MdOutlineOpenInNew }       from "react-icons/md";
import { PencilSquareIcon, 
         GlobeAltIcon }             from '@heroicons/react/24/outline'
import { Emoji, EmojiStyle }        from 'emoji-picker-react';

import { fetchCurrentTab }          from '../../utils/fetch-current-tab';
import session from '../../utils/session';
import slugify from 'slugify';
import { getAllLevelCollectionPermissions } from '../../utils/find-collection-id';
import { RiTeamLine } from 'react-icons/ri';
import { message } from 'antd';
import { TEXT_MESSAGE } from '../../utils/constants';
import { useDispatch } from 'react-redux';
import { getBookmarkInCollections } from '../../actions/collection';

const Folder = (props) => {
    const [open, setOpen] = useState(false);
    const tabDetails      = useSelector((state) => state.app.tab)
    const dispatch = useDispatch()

    const onOpenTabs = async (obj, e) => {
        e.preventDefault()
        e.stopPropagation()
        if(obj?.gems_count > 25){
            message.error(TEXT_MESSAGE.TOO_MANY_TAB)
            return;
        }
        const res = await dispatch(getBookmarkInCollections(obj.id,1))
        if (res?.payload?.data?.collection?.gems.length === 0) return false
        const urls = res?.payload?.data?.collection?.gems?.map((t) => { return t.url})

        if (window.chrome.tabs) {
            const currentTab = tabDetails || await fetchCurrentTab()
            window.chrome.tabs.sendMessage(currentTab.id, { id: "CT_OPEN_WINDOW", tabURLs: urls })   
        }

        // if (tabs.length === 0) return false
        // if(tabs.length > 30){
        //     message.error(TEXT_MESSAGE.TOO_MANY_TAB)
        //     return;
        // }
        // if (window.chrome.tabs) {
        //     const currentTab = tabDetails || await fetchCurrentTab()
        //     const urls = tabs.map((t) => { return t.url})
        //     window.chrome.tabs.sendMessage(currentTab.id, { id: "CT_OPEN_WINDOW", tabURLs: urls })   
        // }
        return false
    }

    const onOpenCollectionPage = (collection) => {
        window.open(`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/c/${collection.id}/${collection?.slug || slugify(collection?.name || "", { lower: true, remove: /[&,+()$~%.'":*?<>{}]/g })}?userId=${session.userId}`, "_blank")   
    }
    const permissions = getAllLevelCollectionPermissions(props?.sharedCollections,props?.obj?.id)
    const Icon = props?.obj?.avatar?.type === "icon" ? ReactIcons[props?.obj?.avatar?.icon] : null
    return (
        <div>
            <div className="mx-auto w-full">
                <div className="mx-auto">
                    <dl className="space-y-2">
                        <div className='pt-1'>
                            <dt className="text-lg">
                                <div className='group ct-relative flex'>
                                    <button className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">
                                        {/* <span className="flex h-4 items-center">
                                            <ChevronDownIcon
                                                className={classNames(open ? '-rotate-180  dark:text-white' : '-rotate-90  dark:text-white', 'h-4 w-4 transform')}
                                                aria-hidden="true"
                                            />
                                        </span> */}
                                        <div className='flex justify-start items-center gap-1'>
                                            {props?.obj?.avatar?.icon 
                                                ? props?.obj?.avatar?.type === "image" 
                                                    ? <img src={props.obj.avatar?.icon} className="h-4 w-4 rounded-full"  alt="Curateit" /> 
                                                    : props?.obj?.avatar?.type === "icon"
                                                        ? <Icon className="h-4 w-4 rounded-full" />
                                                        : props?.obj?.avatar?.type === "color"
                                                            ? <div className="h-4 w-4 rounded-full" style={{backgroundColor: props?.obj?.avatar?.icon}}></div>
                                                            : props?.obj?.avatar?.type === "emoji"
                                                                ? <Emoji unified={props?.obj?.avatar?.icon}
                                                                         emojiStyle={EmojiStyle.APPLE}
                                                                         size={22} />
                                                                : <BsFolder className="h-4 w-4  dark:text-white" />
                                                : open 
                                                    ? <BsFolderFill className="h-4 w-4  dark:text-white" /> 
                                                    : <BsFolder className="h-4 w-4  dark:text-white" />}
                                            {/* {open ? <BsFolderFill className="h-4 w-4  dark:text-white" /> : <BsFolder className="h-4 w-4  dark:text-white" />} */}
                                            <span className="font-medium text-sm text-gray-600  dark:text-white" >{props.obj?.name}</span>
                                            {permissions && <RiTeamLine className="font-medium text-sm text-gray-600 h-4 w-4"/>}
                                        </div>
                                    </button>
                                    <span className="font-medium text-sm bg-[#F2F4F7] text-[#344054] py-[2px] px-[10px] rounded-[16px] group-hover:opacity-0" >{props.obj?.gems_count || props?.obj?.bookmarks?.length || props.obj?.gemCount || 0}</span>
                                    <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100'>
                                        <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 mx-3 cursor-pointer' onClick={() => onOpenCollectionPage(props.obj)} />
                                        {props.obj?.id?.toString() !== session?.unfiltered_collection_id?.toString() &&
                                        <>
                                            {/* {
                                            props.obj?.name === 'Unfiltered' ? '' : <button className='edit-btn' onClick={() => props.modalEdit(props.obj)}>
                                                <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                                            </button>
                                            }  */}
                                            {
                                            ((!permissions && props.obj?.name === 'Unfiltered') || (permissions && permissions?.accessType === 'viewer')) ? '' : <button className='edit-btn' onClick={() => props.modalEdit(props.obj)}>
                                                <PencilSquareIcon className='w-5 h-5 text-gray-400'  />
                                            </button>
                                            }
                                            <button className='edit-btn' onClick={(e) => onOpenTabs(props.obj, e)}>
                                                <GlobeAltIcon className='w-5 h-5 text-gray-400'  />
                                            </button>
                                            {/* <button onClick={() => props.modalDelete(props.obj)}>
                                                <TrashIcon className='w-5 h-5 text-gray-400' />
                                            </button> */}
                                        </>}
                                    </div> 
                                </div>
                            </dt>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    )
}

export default Folder