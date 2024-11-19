/*global chrome*/
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useNavigate } from 'react-router-dom'
import { sendThemeToChrome } from '../../utils/send-theme-to-chrome'
import { fetchCurrentTab } from '../../utils/fetch-current-tab'
import { useDispatch, useSelector } from 'react-redux'
import { resetCollectionData } from '../../actions/collection'
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}
export default function MenuList({ children, menus, position="origin-top-right", indexClass="" }) {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const tabDetails = useSelector((state) => state.app.tab)
    const logout = async () => {
        const tab = tabDetails || await fetchCurrentTab()
        localStorage.removeItem("CT_HIGHLIGHT_DATA");
        localStorage.removeItem("bookmarkFetchingStatus");
        localStorage.removeItem("show_spinner");
        localStorage.removeItem("collectionData");
        localStorage.removeItem("userId");
        localStorage.removeItem("DATA");
        localStorage.removeItem("CT_THEME");
        localStorage.removeItem("token");
        localStorage.removeItem("socialTrue");
        localStorage.removeItem("sidebarOrder");
        localStorage.removeItem("unfiltered_collection_id");
        localStorage.removeItem("mode");
        localStorage.removeItem("username");
        localStorage.removeItem("color-theme");
        dispatch(resetCollectionData())
        sendThemeToChrome(false, "Logout", tab)
        chrome.storage.sync.remove("userData")
        chrome.storage.sync.remove(["CT_SHORT_LINKS"])
        window.chrome.tabs.sendMessage(tab.id, { value: JSON.stringify([]), type: "CT_HIGHLIGHT_DATA" })
        //Remove COOKIES FOR WEB APP
        chrome.cookies.remove({
            url: process.env.REACT_APP_WEBAPP_URL,
            name: 'curateittoken',
        })
        navigate("/login")
    }
    return (
        <Menu as="div" className="ct-relative inline-block text-left">
            <div>
                {children}
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className={classNames(position, `absolute z-10 px-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${indexClass}`)}>
                    {menus.map((menu, i) => (
                        <Menu.Item key={i}>
                            {({ active }) => (
                                <button
                                    key={menu.id}
                                    // href={menu.link}
                                    className={classNames(
                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                        'group flex items-center px-4 py-2 text-sm space-x-3'
                                    )}
                                    onClick={() => {
                                        if(menu.name === "Save tabs"){
                                            navigate("/save-tabs")
                                        }else if(menu.name === "Upload file"){
                                          navigate("/")
                                        }else if(menu.name === "Add highlights"){
                                            navigate('/highlights')
                                        }
                                        else if(menu.name === "Logout"){
                                            logout()

                                        }
                                        else if(menu.name === "Report Bug"){
                                            navigate('/report-bug')
                                        }
                                    }}
                                >
                                    {menu?.icon && <img src={`/icons/${menu.icon}`} alt={menu.alt} className="h-5 w-5" aria-hidden="true" />
                                    }
                                    <span className='whitespace-nowrap'>
                                        {menu.name}
                                    </span>
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    )
}