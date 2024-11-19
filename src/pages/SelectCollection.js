import { FolderIcon, MagnifyingGlassIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react'
import Header from '../components/header/Header';

const CollectionData = [
    {
        id: 1,
        name: 'Design',
        count: 8
    },
    {
        id: 2,
        name: 'Creative',
        count: 12
    },
    {
        id: 3,
        name: 'Airbnb PPT',
        count: 2
    },
    {
        id: 4,
        name: 'Business law',
        count: 5
    }
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


const SelectCollection = () => {
    const [searchText, setSearchText] = useState("");
    const [collection, setCollection] = useState(CollectionData);
    const [searchCollection, setSearchCollection] = useState(CollectionData);
    const [showAddNew, setShowAddNew] = useState(false);
    const [inputIsFocused, setInputIsFocused] = useState(false);

    useEffect(() => {
        const filteredCollection =
            searchText === ''
                ? collection
                : collection.filter((data) => {
                    return data.name.toLowerCase().includes(searchText.toLowerCase())
                })

        setSearchCollection(filteredCollection);

        if (searchText.length > 0) {
            const exactCollection = collection.filter((data) => {
                return data.name.toLowerCase() === searchText.toLowerCase();
            })

            if (exactCollection.length === 0) {
                setShowAddNew(true);
            } else {
                setShowAddNew(false);

            }
        } else {
            setShowAddNew(false);
        }
    }, [searchText])

    //If input is blured
    const onBlur = () => {
        if(searchText.length === 0){
            setInputIsFocused(false);
        }
    }

    return (
        <div className='bookmark-bg ct-relative overflow-y-auto scroll-smooth'>
            <Header label="Select Collection" showBackArrow={true} />
            <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] h-[550px]'>
                <div className="ct-relative rounded-md shadow-sm">
                    <div className={classNames(inputIsFocused ? "left-0" : "left-16", "pointer-events-none absolute inset-y-0 flex items-center pl-3")}>
                        <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                    </div>
                    <input
                        onFocus={() => setInputIsFocused(true)}
                        type="text"
                        name="select-collection"
                        value={searchText}
                        className={classNames(inputIsFocused ? "text-left pl-12": "text-center","block w-full outline-none rounded-md border-[1px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm h-[40px] text-gray-500")}
                        placeholder="Find or create new collection..."
                        onChange={(e) => setSearchText(e.target.value)}
                        onBlur={onBlur}
                    />
                    {searchText.length > 0 &&
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={() => { setSearchText(""); setInputIsFocused(false) }}>
                            <XMarkIcon className="h-6 w-6 text-gary-500" aria-hidden="true" />
                        </div>
                    }
                </div>
                <div className='mt-2'>
                    {
                        searchText.length === 0 ? (
                            <>
                                <div>
                                    <div className='flex justify-between items-center my-2 text-sm text-gray-400 cursor-pointer'>
                                        <div className='flex-1 flex justify-start items-center space-x-2'>
                                            <img className='h-4 w-4' src="/icons/unsorted-icon.svg" alt="unsorted icon" />
                                            <span>Unsorted</span>
                                        </div>
                                        <span>8</span>
                                    </div>
                                    <div className='flex justify-between items-center my-2 text-sm text-gray-400 cursor-pointer'>
                                        <div className='flex-1 flex justify-start items-center space-x-2'>
                                            <TrashIcon className='h-4 w-4 text-gray-600' />
                                            <span>Trash</span>
                                        </div>
                                        <span>1</span>
                                    </div>
                                </div>
                                <div className='mt-4'>
                                    <h6 className='text-xs text-gray-400'>Collection</h6>
                                    {searchCollection.map(collection => (
                                        <div key={collection.id} className='flex justify-between items-center my-2 text-sm text-gray-500 cursor-pointer'>
                                            <div className='flex-1 flex justify-start items-center space-x-2'>
                                                <FolderIcon className='h-4 w-4 text-gray-600' />
                                                <span className='text-black'>{collection.name}</span>
                                            </div>
                                            <span>{collection.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                {searchCollection.map(collection => (
                                    <div key={collection.id} className='flex justify-between items-center my-2 text-sm text-gray-500 cursor-pointer'>
                                        <div className='flex-1 flex justify-start items-center space-x-2'>
                                            <FolderIcon className='h-4 w-4 text-gray-500' />
                                            <span className='text-black'>{collection.name}</span>
                                        </div>
                                        <span>{collection.count}</span>
                                    </div>
                                ))}
                                {showAddNew && (
                                    <div className='flex justify-between items-center my-2 text-sm text-gray-500 cursor-pointer'>
                                        <div className='flex-1 flex justify-start items-center space-x-2'>
                                            <PlusIcon className='h-4 w-4 text-gray-500' />
                                            <span className='text-gray-400'>{searchText}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default SelectCollection