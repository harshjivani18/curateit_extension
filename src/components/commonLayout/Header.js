/*global chrome*/
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { fetchCurrentTab } from "../../utils/fetch-current-tab"
import { saveSelectedCollection } from "../../actions/collection"
import { useDispatch } from "react-redux"
import session from "../../utils/session"

const Header = ({ collapsed, setCollapsed, setTextExtract }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const tabDetails = useSelector((state) => state.app.tab)
    const sidebarPosition = useSelector((state) => state.user.sidebarPosition) || "right";

    const onCloseClick = async () => {
        setTextExtract && setTextExtract('')
        dispatch(saveSelectedCollection({ id: Number(session.unfiltered_collection_id), name: "Unfiltered" }))
        const tab = await fetchCurrentTab()
        navigate("/search-bookmark")
        window.chrome.tabs.sendMessage(tab.id, { type: "CT_CLOSE_PANEL" })
        window.chrome.storage.sync.remove('highlightedData')
    }

    const handleExpand = async () => {
        const tab = tabDetails || await fetchCurrentTab()
        window.chrome.tabs.sendMessage(tab.id, { type: "CT_PANEL_EXPAND" })
        setCollapsed(false)
    }
    const handleCollapse = async () => {
        const tab = tabDetails || await fetchCurrentTab()
        window.chrome.tabs.sendMessage(tab.id, { type: "CT_PANEL_COLLAPSE" })
        setCollapsed(true)
    }

    const handleImageClick = async () => {
        if(session.userId){
            window.open(`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/all-bookmarks?userId=${session.userId}`, "_blank")
        }else{
            return false;
        }
    }
    
    return (
        <>
        <div className={`bg-white border-b-2 border-solid border-[#E6F0FF] flex items-center justify-between ${collapsed ? 'p-[0px]': 'py-[8px] px-[16px]'}`}>
            <div className="flex items-center">
                {
                    (sidebarPosition === 'right' && collapsed) ? <>
                    <ChevronDoubleLeftIcon className="h-5 w-5 cursor-pointer mr-1" 
                                onClick={handleExpand}/> 
                    <img className='h-[20px] cursor-pointer' src="/icons/logo-head.svg" alt="curateit.com" 
                                onClick={handleImageClick}
                    />
                    </>
                    : 
                    (sidebarPosition === 'right' && !collapsed) ?
                    <>
                    <ChevronDoubleRightIcon onClick={handleCollapse} className="h-5 w-5 cursor-pointer mr-1"/> 
                    <img className='h-[24px] cursor-pointer' src="/icons/logo.png" alt="curateit.com" 
                    onClick={handleImageClick}/>
                    </>
                    : ''
                }

                    {
                        (sidebarPosition === 'left' && collapsed) ?
                            <>
                                <img className='h-[20px] cursor-pointer' src="/icons/logo-head.svg" alt="curateit.com"
                                    onClick={handleImageClick} />
                                <ChevronDoubleRightIcon className="h-5 w-5 cursor-pointer ml-1"
                                    onClick={handleExpand} />
                            </> :
                            (sidebarPosition === 'left' && !collapsed) ?
                                <>
                                    <ChevronDoubleLeftIcon onClick={handleCollapse} className="h-5 w-5 cursor-pointer mr-1" />
                                    <img className='h-[24px] cursor-pointer' src="/icons/logo.png" alt="curateit.com"
                                        onClick={handleImageClick} />
                                </>
                                : ''
                    }
                </div>

                <button className="close-btn" onClick={onCloseClick}>
                    <XMarkIcon color="red" />
                </button>
            </div>
        </>
    )
}

export default Header;