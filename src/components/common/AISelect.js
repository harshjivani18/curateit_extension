import { Input, Select }   from 'antd';
import { useEffect, useState } from 'react';
import { MdSearch } from 'react-icons/md';

const AISelect = (groups, items, onSelect, isSingleSelect=true) => {

    const [filteredItems, setFilteredItems] = useState(items)
    const [searchTerm, setSearchTerm]       = useState("")
    const [selectedItem, setSelectedItem]   = useState(null)

    useEffect(() => {
        setFilteredItems(items)
    }, [items])

    const renderItem = (item) => {
        return (
            <div className="flex items-center">
                {item.icon && <img src={item.icon} alt={item.name} className="w-5 h-5 mr-2" />}
                <div className='text-sm text-gray-500'>{item.name}</div>
            </div>
        )
    }

    let optionsArr = []
    if (groups && groups.length > 0) {
        groups.forEach((group) => {
            optionsArr.push({
                label: group.name,
                options: filteredItems.filter((item) => item.group === group).map((item) => {
                    return {
                        label: renderItem(item),
                        value: item.id,
                    }
                })
            })
        })
    }
    else {
        optionsArr = filteredItems.map((item) => {
            return {
                label: renderItem(item),
                value: item.id,
            }
        })
    }

    return (
        <Select 
            style={{
                width: "100%",
            }}
            className='mb-6'
            value={selectedItem}
            onChange={(value) => {
                setSelectedItem(value)
                onSelect(value)
            }}
            dropdownRender={(menu) => (
                <>
                    <Input placeholder="Search" 
                           prefix={<MdSearch style={{ color: "rgba(0,0,0,.25)" }} />}
                           value={searchTerm}
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
                    {menu}
                </>
            )}
            options={optionsArr}
        />
    )
}

export default AISelect;