import "./ActiveTabList.css";
import { Button, Collapse, Divider, Dropdown, Input, Menu, Tooltip, message }                from "antd";
import { useEffect, useState } from "react";
import { BiBookmark } from "react-icons/bi";
import { BsGlobe2, BsFloppy, BsFolder } from "react-icons/bs";
import { FaRegObjectGroup, FaRegObjectUngroup } from "react-icons/fa";
import { IoCloseCircleOutline, IoSearchOutline }      from "react-icons/io5";
import { MdMoreVert, MdSearchOff } from "react-icons/md";
import { AiOutlineAppstore } from "react-icons/ai";
import { TbCopyOff, TbSortDescending } from "react-icons/tb";
import { IoMdClose, IoMdLink } from "react-icons/io";
import { FiExternalLink } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { groupTabs, importTabs } from "../../actions/tabs-management";
import { addCollections } from "../../actions/collection";
import session from "../../utils/session";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useNavigate }                          from "react-router-dom";
import moment from "moment";
// import { PiLinkBreak } from "react-icons/pi";

const { Panel } = Collapse

const ActiveTabList = ({ tabs, windowName, isActiveWindow, windowId, onUpdateTab }) => {
    const dispatch                    = useDispatch()
    const navigate                    = useNavigate()
    const [showSearch, setShowSearch] = useState(false)
    const [open, setOpen]             = useState(false)
    const [allTabs, setAllTabs]       = useState(tabs || [])
    const [showGroup, setShowGroup]   = useState(tabs.findIndex((t) => t.groupId !== -1) !== -1)
    const [isGrouping, setIsGrouping] = useState(false)

    useEffect(() => {
        window.addEventListener("message", listenForChromeTabs)
        return () => {
            window.removeEventListener("message", listenForChromeTabs)
        }
    }, [])

    const listenForChromeTabs = (event) => {
        const { data } = event
        if (!data) return
        const obj = typeof data === "string" ? JSON.parse(data) : data
        if (obj?.type === "CT_REMOVE_TAB_LISTEN" && obj?.tabId) {
            event.preventDefault()
            event.stopPropagation()
            const newArr = [...allTabs]
            const idx    = newArr.findIndex(tab => tab.id === obj.tabId)
            newArr.splice(idx, 1)
            setAllTabs([ ...newArr])
            return false
        }
    }

    const addTabs = async (tabsArr) => {
        if (tabsArr.length <= 20) {
            await dispatch(importTabs({ data: tabsArr }))
        }
        else {
            const chunkSize = 10
            const chunks    = []
            for (let i = 0; i < tabsArr.length; i += chunkSize) {
                chunks.push(tabsArr.slice(i, i + chunkSize))
            }
            for (const index in chunks) {
                await dispatch(importTabs({ data: chunks[index] }))
            }
        }
    }

    const onGenerateGroups = async (forced) => {
        if (!showGroup || forced) {
            setIsGrouping(true)
            const res = await dispatch(groupTabs(allTabs.map(tab => tab.url)))
            setIsGrouping(false)
            if (res?.payload?.data?.data) {
                message.success("Tabs grouped successfully")
                const groups = Object.keys(res.payload.data.data)
                for (const group of groups) {
                    const tabs      = res.payload.data.data[group]
                    const tabIds    = allTabs.filter(tab => tabs.includes(tab.url)).map(tab => tab.id)
                    const groupId   = await window.chrome.tabs.group({ tabIds: tabIds })
                    window.chrome.tabGroups.update(groupId, { title: group })
                    setAllTabs([ ...allTabs.map(tab => {
                        if (tabs.includes(tab.url)) {
                            tab.groupId = groupId
                        }
                        return tab
                    })])
                }
                setShowGroup(true)
            }
        }
        else {
            // Remove all groups
            const groups = await window.chrome.tabGroups.query({})
            for (const group of groups) {
                window.chrome.tabs.ungroup(allTabs.filter(tab => tab.groupId === group.id).map(tab => tab.id))
            }
            setShowGroup(false)
        }
    }

    const onToggleDropdown = (flag) => {
        setOpen(flag);
    }

    const onSaveSession = async () => {
        const mainCollectionRes = await dispatch(addCollections({
            data: {
                name: `${windowName} - ${moment().format("DD-MM-YYYY-HH-mm")}`,
                author: session.userId
        }}))
        if (mainCollectionRes?.payload?.data?.data) {
            const collectionId  = mainCollectionRes.payload.data.data.id
            const groups        = await window.chrome.tabGroups.query({})
            if (groups.length > 0) {
                for (const group of groups) {
                    const groupRes  = await dispatch(addCollections({
                        data: {
                            name: group.title,
                            collection: collectionId,
                            is_sub_collection: true,
                            author: session.userId                        
                        }
                    }))
                    if (groupRes?.payload?.data?.data) {
                        const tabsArr = allTabs.filter(tab => tab.groupId === group.id).map((tab) => {
                            return {
                                title: tab.title,
                                link: tab.url,
                                icon: tab.favIconUrl,
                                tags: [],
                                remarks: "",
                                thumbnail: "",
                                collection_gems: groupRes?.payload?.data?.data?.id,
                            }
                        })
                        await addTabs(tabsArr)
                    }
                    // window.chrome.tabs.ungroup(allTabs.filter(tab => tab.groupId === group.id).map(tab => tab.id))
                }
            }
            else {
                const tabsArr = allTabs.map((tab) => {
                    return {
                        title: tab.title,
                        link: tab.url,
                        icon: tab.favIconUrl,
                        tags: [],
                        remarks: "",
                        thumbnail: "",
                        collection_gems: collectionId,
                    }
                })
                await addTabs(tabsArr) 
            }
            navigate("/search-bookmark?refetch=refetch-gem")
        }
    }

    const onCloseTab = async (e, tabId) => {
        e.preventDefault()
        e.stopPropagation()
        // e.stopImmediatePropagation()
        window.chrome.tabs.remove(tabId)
        setAllTabs([ ...allTabs.filter(tab => tab.id !== tabId) ])
        return false
    }

    const onAddNewTab = async () => {
        window.chrome.tabs.create({ windowId: windowId })
        onUpdateTab && await onUpdateTab()
    }

    const onSearchTabs = async (e) => {
        const { value }     = e.target
        if (value === "") {
            onUpdateTab && await onUpdateTab()
            setAllTabs([ ...tabs ])
        }
        const filteredTabs  = allTabs.filter(tab => tab.title.toLowerCase().includes(value.toLowerCase()) || tab.url.toLowerCase().includes(value.toLowerCase()))
        setAllTabs(filteredTabs)
    }

    const onSaveAllTabs = async () => {
        const mainCollectionRes = await dispatch(addCollections({
            data: {
                name: `${windowName} - ${moment().format("DD-MM-YYYY-HH-mm")}`,
                author: session.userId
            }
        }))
        if (mainCollectionRes?.payload?.data?.data) {
            const collectionId  = mainCollectionRes.payload.data.data.id
            const tabsArr       = allTabs.map((tab) => {
                return {
                    title: tab.title,
                    link: tab.url,
                    icon: tab.favIconUrl,
                    tags: [],
                    remarks: "",
                    thumbnail: "",
                    collection_gems: collectionId,
                }
            })
            await addTabs(tabsArr) 
        }
        navigate("/search-bookmark?refetch=refetch-gem")
    }

    const onSaveAndCloseAllTabs = async () => {
        await onSaveAllTabs()
        const tabs = await window.chrome.tabs.query({});
        for (var i = 0; i < tabs.length; i++) {
            window.chrome.tabs.remove(tabs[i].id);
        }
    }

    const onAutoGroupTabs = async () => {
        // setShowGroup(false)
        if (showGroup) {
            message.success("Tabs already grouped")
            return
        }
        await onGenerateGroups()
    }

    const onAutoGroupTabsAndSave = async () => {
        // setShowGroup(false)
        if (!showGroup) {
            await onGenerateGroups()
        }
        await onSaveSession()
    }

    const onAutoGroupTabsAndSaveAndClose = async () => {
        // setShowGroup(false)
        if (!showGroup) {
            await onGenerateGroups()
        }
        await onSaveSession()
        const tabs = await window.chrome.tabs.query({});
        for (var i = 0; i < tabs.length; i++) {
            window.chrome.tabs.remove(tabs[i].id);
        }
    }

    const onSortTabByTitle = async () => {
        const sortedTabs = allTabs.sort((a, b) => a.title.localeCompare(b.title))
        for (const index in sortedTabs) {
            await window.chrome.tabs.move(sortedTabs[index].id, { index: parseInt(index) })
        }
        setAllTabs(sortedTabs)
    }

    const onSortTabByURLDomain = async () => {
        const sortedTabs = allTabs.sort((a, b) => {
            const domainA = new URL(a.url).hostname
            const domainB = new URL(b.url).hostname
            return domainA.localeCompare(domainB)
        })
        for (const index in sortedTabs) {
            await window.chrome.tabs.move(sortedTabs[index].id, { index: parseInt(index) })
        }
        setAllTabs(sortedTabs)
    }

    const onCopyAllLinksAsText = async () => {
        const links = allTabs.map(tab => tab.url).join("\n")
        const currentTab = await window.chrome.tabs.query({ active: true, currentWindow: true })
        await window.chrome.tabs.sendMessage(currentTab[0].id, { type: "COPY_TAB_LINKS_TEXT", copyLinkText: links })
        message.success("All links copied to clipboard")
        onToggleDropdown(false)
    }

    const onOpenAllLinksInNewWindow = async () => {
        // create chrome window
        await window.chrome.windows.create({ url: allTabs.map(tab => tab.url) })
    }

    const onCloseAllTabs = async () => {
        const tabs = await window.chrome.tabs.query({});
        for (var i = 0; i < tabs.length; i++) {
            window.chrome.tabs.remove(tabs[i].id);
        }
    }

    const onCloseAllDuplicateURLS = async () => {
        for (const tab of allTabs) {
            const duplicateArr = allTabs.filter(t => t.url === tab.url)
            if (duplicateArr.length > 1) {
                for (const index in duplicateArr) {
                    if (parseInt(index) !== 0) {
                        const tId    = duplicateArr[index].id
                        const newArr = [...allTabs]
                        const idx    = newArr.findIndex(t => t.id === tId)
                        newArr.splice(idx, 1)
                        setAllTabs([ ...newArr])
                        window.chrome.tabs.remove(tId)
                    }
                }
            }
        }
    }

    const onTabIndexChange = async (result) => {
        const { 
            source, 
            destination 
        }                   = result
        if (!source || !destination) return
        const oldIndex      = source.index
        const newIndex      = destination.index
        const tab = allTabs[oldIndex]
        await window.chrome.tabs.move(tab.id, { index: newIndex })
        const newTabs = [...allTabs]
        newTabs.splice(oldIndex, 1)
        newTabs.splice(newIndex, 0, tab)
        setAllTabs(newTabs)
    }

    const renderDropdownItems = () => {
        return (
            <Menu>
                {/* <Menu.Item key="1" icon={<FaEdit />}>Edit</Menu.Item> */}
                {/* <Menu.Item key="2" icon={<BiLink />}>Add Quick Link</Menu.Item> */}
                <Menu.Item key="3" icon={<BiBookmark />} onClick={onSaveAllTabs}>Save Tabs</Menu.Item>
                <Menu.Item key="4" icon={<IoCloseCircleOutline />} onClick={onSaveAndCloseAllTabs}>Save and Close All Tabs</Menu.Item>
                <Divider className="m-0" />
                <Menu.Item key="5" icon={<FaRegObjectGroup />} onClick={onAutoGroupTabs}>Auto Group tabs</Menu.Item>
                <Menu.Item key="6" icon={<BsFloppy />} onClick={onAutoGroupTabsAndSave}>Auto Group and Save Tabs</Menu.Item>
                <Menu.Item key="7" icon={<AiOutlineAppstore />} onClick={onAutoGroupTabsAndSaveAndClose}>Auto Group, Save & Close All Tabs</Menu.Item>
                <Divider className="m-0" />
                <Menu.Item key="8" icon={<TbSortDescending />} onClick={onSortTabByTitle}>Sort by Title</Menu.Item>
                <Menu.Item key="9" icon={<BsGlobe2 />} onClick={onSortTabByURLDomain}>Sort by domain</Menu.Item>
                <Divider className="m-0" />
                <Menu.Item key="10" icon={<IoMdLink />} onClick={onCopyAllLinksAsText}>Copy all links as text</Menu.Item>
                <Menu.Item key="11" icon={<FiExternalLink />} onClick={onOpenAllLinksInNewWindow}>Open all Links in new window</Menu.Item>
                {/* <Menu.Item key="12" icon={<PiLinkBreak />}>Close existing and Open all Links</Menu.Item> */}
                <Divider className="m-0" />
                <Menu.Item key="13" icon={<TbCopyOff />} onClick={onCloseAllDuplicateURLS}>Close duplicate tabs</Menu.Item>
                <Menu.Item key="14" icon={<IoMdClose />} onClick={onCloseAllTabs} danger>Close all tabs</Menu.Item>
            </Menu>
        )
    }

    const renderListItem = (tab, index) => {
        return (
            <Tooltip title={tab.title} key={index}>
                <a href={tab.url} target="_blank" rel="noreferrer" className="flex items-center justify-between">
                    <div key={index} className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                            <img src={tab.favIconUrl} alt="favicon" className="w-4 h-4 mr-2" />
                            <span>{tab.title?.length > 35 ? tab.title.slice(0,35).concat("...") : tab.title}</span>
                        </div>
                        <Button type="text" size="small" className="text-gray-400" onClick={(e) => onCloseTab(e, tab.id)}>
                            x
                        </Button>
                    </div>
                </a>
            </Tooltip>
        )
    }

    const renderPanelHeader = () => {
        return (
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <BsFolder className="h-4 w-4 mr-2 dark:text-white" />
                    <span className="text-sm font-medium">{isActiveWindow ? `${windowName} - Active tabs` : windowName}</span>
                    <div className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 text-xs font-medium">
                        {allTabs.length}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <Tooltip title="Toggle search">
                        <Button 
                            icon={showSearch ? <MdSearchOff className="text-[#347AE2] w-3 h-3" /> : <IoSearchOutline className="text-[#347AE2] w-3 h-3" />} 
                            size="small"
                            type="text"
                            className="flex items-center justify-center"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowSearch(!showSearch)
                                return false
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Auto group tabs">
                        <Button 
                            icon={showGroup ? <FaRegObjectUngroup className="text-[#347AE2] w-3 h-3" /> : <FaRegObjectGroup className="text-[#347AE2] w-3 h-3" />} 
                            size="small"
                            type="text"
                            className="flex items-center justify-center"
                            loading={isGrouping}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onGenerateGroups()
                                return false
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Save session">
                        <Button 
                            icon={<BsFloppy className="text-[#347AE2] w-3 h-3" />} 
                            size="small"
                            type="text"
                            className="flex items-center justify-center"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onSaveSession()
                                return false
                            }}
                        />
                    </Tooltip>
                    <Dropdown trigger={["click"]}
                              overlay={renderDropdownItems()}
                              onOpenChange={onToggleDropdown}
                              open={open}>
                        <Button type="text" size="small" 
                            className="flex items-center justify-center"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                return false
                            }}
                            icon={<MdMoreVert className="text-[#347AE2] w-3 h-3" />} />
                    </Dropdown>
                </div>
            </div>
        )
    }

    const renderDragabbleItems = () => {
        return (
            <DragDropContext onDragEnd={onTabIndexChange}>
                <Droppable droppableId="link-list">
                    {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            {allTabs.map((tab, index) => {
                                return (
                                    <Draggable key={tab.id} draggableId={tab.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                {renderListItem(tab, index)}
                                            </div>
                                        )}
                                    </Draggable>
                                )
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        )
    }

    return (
        <Collapse defaultActiveKey={[windowName]} ghost className="mt-2 p-0">
            <Panel header={renderPanelHeader()} key={windowName} className="ct-tab-panel-header">
                <div className="space-y-2">
                    {showSearch && <Input
                        prefix={<IoSearchOutline className="text-gray-400" />}
                        placeholder="Search tabs here"
                        className="mb-2 ct-search-tab-input"
                        onChange={onSearchTabs}
                    />}
                    {allTabs.length > 1
                        ? renderDragabbleItems()
                        : allTabs.map((tab, index) => renderListItem(tab, index))
                    }
                    {/* {allTabs.map((tab, index) => (
                        
                    ))} */}
                    <Button type="text" className="w-full text-left mt-2 text-[#347AE2]" onClick={onAddNewTab}>
                        + Add new tab
                    </Button>
                </div>
            </Panel>
        </Collapse>
    )
}

export default ActiveTabList