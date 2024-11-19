import { Input, Dropdown, Divider, Button }   from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { BiCheckCircle } from 'react-icons/bi';
import { HiPencil } from 'react-icons/hi2';
import { MdSearch } from 'react-icons/md';
import { TbTrash } from 'react-icons/tb';

// const { useToken } = theme;

const AIDropDown = ({ groups, items, onSelect, children, dropdownType=null, selectedItem=null, onCreate=null, createLabel=false, onEdit=null, onDelete=null, isSingleSelect=true }) => {
    // const { token } = useToken();

    // const contentStyle = {
    //     backgroundColor: token.colorBgElevated,
    //     borderRadius: token.borderRadiusLG,
    //     boxShadow: token.boxShadowSecondary,
    // }
    const searchRef = useRef(null)
    const [filteredItems, setFilteredItems] = useState(items)
    const [searchTerm, setSearchTerm]       = useState("")
    const [openFlag, setOpenFlag]           = useState(false)

    useEffect(() => {
        setFilteredItems(items)
    }, [items])

    useEffect(() => {
        if (searchRef?.current) {
            searchRef.current.focus()
        }
    }, [])

    const renderItem = (item, isForce=false) => {
        const isDefault = ((item.idIntial && `${item.idIntial}-${selectedItem}` === item?.id) || (`${selectedItem}` === `${item?.id}`))
        // console.log("item", item, selectedItem, `${item.idIntial}-${selectedItem}`, item.idIntial && `${item.idIntial}-${selectedItem?.id}` === item?.id)
        if (isDefault && !isForce) return null
        return (
            <div className={`flex w-full items-center justify-between ${isDefault ? "ct-item-selected" : ""}`}>
                <Button type="text" className={`flex items-center cursor-pointer `} onClick={() => { 
                    setOpenFlag(false)
                    if (dropdownType === "AI Model") {
                        onSelect(item.model, item.name)
                        return;
                    }
                    onSelect(item.id)
                }}>
                    <div className='flex'>
                        {item.icon && <img src={item.icon} alt={item.name} className="w-5 h-5 mr-2" />}
                        <div className='text-sm text-gray-500'>{item.name}</div>
                    </div>
                </Button>
                <div className="flex items-center justify-between">
                    {onEdit && item.isEnableEdit && <Button type="text" onClick={() => {
                        onEdit(item)
                        setOpenFlag(false)
                    }} className="text-xs text-blue-500 p-0">
                        <HiPencil className='h-4 w-4 mr-2'/>    
                    </Button>}
                    {!isDefault && item.isEnableEdit && onDelete && <Button type="text" onClick={() => { 
                        onDelete(item) 
                        setOpenFlag(false)
                    }} className="text-xs text-red-500 p-0">
                        <TbTrash className='h-4 w-4 mr-2'/>
                    </Button>}
                    {isDefault && <BiCheckCircle className="text-green-500 ml-2" />}
                </div>
            </div>
        )
    }

    const renderMenu = () => {
        return filteredItems?.map((item) => {
            return (
                <div key={item.id} className="flex items-center justify-between">
                    {renderItem(item)}
                </div>
            )
        })
    }

    const renderSeparateMenu = () => {
        const defaultIdx = filteredItems.findIndex((item) => {
            return (item.idIntial && `${item.idIntial}-${selectedItem}` === item?.id) || (`${selectedItem}` === `${item?.id}`)
        })
        return (
            <>
                {defaultIdx !== -1 && renderItem(filteredItems[defaultIdx], true)}
                {renderMenu()}
            </>
        )
    }

    const renderGroupedMenu = () => {
        return groups.map((group, index) => {
            const defaultIdx = filteredItems.findIndex((item) => {
                return ((item.idIntial && `${item.idIntial}-${selectedItem}` === item?.id) || (`${selectedItem}` === `${item?.id}`)) && item.group === group
            })
            return (
                <div key={index}>
                    <div className="text-xs text-gray-500 font-bold mt-2 mb-2">{group}</div>
                    {defaultIdx !== -1 && renderItem(filteredItems[defaultIdx], true)}
                    {filteredItems?.filter((item) => item.group === group).map((item) => {
                        return (
                            <div key={item.id} className="flex items-center justify-between">
                                {renderItem(item)}
                            </div>
                        )
                    })}
                </div>
            )
        })
    }

    // let optionsArr = []
    // if (groups && groups.length > 0) {
    //     groups.forEach((group, index) => {
    //         optionsArr.push({
    //             key: index,
    //             label: group.name,
    //             type: "group",
    //             children: filteredItems?.filter((item) => item.group === group).map((item) => {
    //                 return {
    //                     key: item.id,
    //                     label: renderItem(item)
    //                 }
    //             }) || []
    //         })
    //     })
    // }
    // else {
    //     optionsArr = filteredItems?.map((item) => {
    //         return {
    //             key: item.id,
    //             label: renderItem(item),
    //             value: item.id,
    //         }
    //     }) || []
    // }

    return (
        <Dropdown open={openFlag}
                  trigger={['click']}
                  onOpenChange={(flag) => setOpenFlag(flag)}
                  dropdownRender={() => {
                    return (
                        <div className='relative w-full ct-ai-dropdown-changes'>
                            <Input placeholder="Search" 
                            prefix={<MdSearch style={{ color: "rgba(0,0,0,.25)" }} />}
                            value={searchTerm}
                            ref={searchRef}
                            onChange={(e) => {
                                    const { value } = e.target;
                                    setSearchTerm(value)
                                    if (value === "") {
                                        setFilteredItems(items)
                                        return;
                                    }
                                    setFilteredItems(items.filter((item) => item.name.toLowerCase().includes(value.toLowerCase())))
                            }}
                            style={{
                                    width: "98%",
                            }}
                            className='ct-ant-ai-input-search'
                            />
                            {onCreate && createLabel && <div className="mt-2 mb-2">
                                <Button type="text" onClick={onCreate} className="text-sm text-blue-500">{createLabel}</Button>  
                            </div>}
                            <Divider
                                className="mt-2 mb-2"
                            />
                            {groups && groups.length > 0 ? renderGroupedMenu() : renderSeparateMenu()}
                        </div>
                    )
                  }}
        >
            {children}
        </Dropdown>
    )
}

export default AIDropDown;