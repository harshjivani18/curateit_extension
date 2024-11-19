import { Disclosure } from '@headlessui/react'
import { useNavigate } from 'react-router';
import { ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react';
import { BsFolderFill, BsFolder } from "react-icons/bs";
import { MdOutlineOpenInNew } from "react-icons/md";



function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function FolderList({ searchText, list, deleteGems, editGem, modalDelete, modalEdit }) {
    const [sublist, setSublist] = useState()

    const [collectionList, setCollectionList] = useState(list)

    const navigate = useNavigate()

    useEffect(() => {
        setCollectionList(list)
    }, [list])

    const openTab = (data) =>{
        const array1 =  data?.data?.gems;
        let userFullnames = array1.map(function(element){
            return window.open(element.metaData.url,"_blank");
        })

    }
// 

    const nestedComments = (list?.children || []).forEach((a) => {
        // 
        // a?.children.forEach((b)=>{
// setCollectionList(a)
            return <FolderList key={a.id} list={a} type="child" />;
        // })
    });
    return (
        collectionList?.map((data, index) => {
            // 
            
            return (
                <div className='folderlist'>
                    <div className="mx-auto w-full">
                        <div className="mx-auto">
                            <dl className="space-y-2">
                                <Disclosure as="div" className="pt-1">
                                    {({ open }) => (
                                        <>
                                            {setSublist(open)}
                                            <dt className="text-lg">
                                                <div className='group ct-relative'>
                                                    <Disclosure.Button className="flex w-full items-center justify-start text-left text-gray-600 gap-2 folders">
                                                        <span className="flex h-4 items-center">
                                                            <ChevronDownIcon
                                                                className={classNames(open ? '-rotate-180  dark:text-white' : '-rotate-90  dark:text-white', 'h-4 w-4 transform')}
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                        <div className='flex justify-start items-center gap-1'>
                                                            {open ? <BsFolderFill className="h-4 w-4  dark:text-white" /> : <BsFolder className="h-4 w-4  dark:text-white" />}
                                                            <span className="font-medium text-sm text-gray-600  dark:text-white" >{data?.name}</span>
                                                        </div>
                                                    </Disclosure.Button>
                                                    <div className='flex absolute top-0 right-0 items-center opacity-0 group-hover:opacity-100'>
                                                    <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 mx-3 cursor-pointer' onClick={(e) => {openTab(data)}}/>
                                                        <button className='edit-btn' onClick={() => modalEdit(data)}>
                                                            <PencilSquareIcon className='w-5 h-5 text-gray-400' />
                                                        </button>
                                                        <button onClick={() => modalDelete(data)}>
                                                            <TrashIcon className='w-5 h-5 text-gray-400' />
                                                        </button>
                                                    </div>
                                                </div>
                                            </dt>
                                            {
                                                data?.gems?.map((gem, index) => {
                                                    return (
                                                        < Disclosure.Panel as="dd" className="mt-1 pl-6" >
                                                            <div className='flex justify-between items-center group'>
                                                                <div className='flex justify-start items-center gap-1 mt-3 cursor-pointer'>
                                                                    <img className='h-4 w-4' src={`${gem?.metaData?.icon}`} />
                                                                    <span className='text-sm text-gray-600 ml-1'><span onClick={(e)=> window.open(`${gem?.metaData?.url}`,"_shelf")}>{(gem?.metaData?.level === "gem" || gem?.media_type === "Link") ? gem.title.slice(0, 35).concat("", "....."): null}</span></span>                                                                </div>
                                                                <div className='flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100'>
                                                                    <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 cursor-pointer' onClick={(e)=> window.open(`${gem?.metaData?.url}`,"_shelf")}/>
                                                                    <button onClick={() => editGem(gem.id)}>
                                                                        <PencilSquareIcon className='w-5 h-5 text-gray-400' />
                                                                    </button>
                                                                    <button onClick={() => deleteGems(gem.id)}>
                                                                        <TrashIcon className='w-5 h-5 text-gray-400' />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </Disclosure.Panel>
                                                    )
                                                })
                                            }
                                            {
                                                open ?
                                                data?.children?.map((i) => {
                                                        return (
                                                            <div className='folderlist'>
                                                                <div className="mx-auto w-full">
                                                                    <div className="mx-auto">
                                                                        <dl className="space-y-2">
                                                                            <Disclosure as="div" className="pt-1">
                                                                                {({ open }) => (
                                                                                    <>
                                                                                        {setSublist(open)}
                                                                                        <dt className="text-lg">
                                                                                            {/* <div className='flex'> */}
                                                                                            <Disclosure.Button className="flex w-full items-center justify-start text-left text-gray-600 gap-2">
                                                                                                <span className="flex h-4 items-center">
                                                                                                    <ChevronDownIcon
                                                                                                        className={classNames(open ? '-rotate-180' : '-rotate-90', 'h-4 w-4 transform')}
                                                                                                        aria-hidden="true"
                                                                                                    />
                                                                                                </span>
                                                                                                <div className='flex justify-start items-center gap-1'>
                                                                                                    {open ? <BsFolderFill className="h-4 w-4" /> : <BsFolder className="h-4 w-4" />}
                                                                                                    <span className="font-medium text-sm text-gray-600">{i?.name}</span>
                                                                                                </div>
                                                                                            </Disclosure.Button>
                                                                                            {/* this comment is needed when subcollection is stored */}
                                                                                            {/* <div className='flex justify-end items-center opacity-100 group-hover:opacity-100'>
                                                                                                        <button onClick={() => EditSubcollection(i.id)}>
                                                                                                            <PencilSquareIcon className='w-5 h-5 text-gray-400' />
                                                                                                        </button>
                                                                                                        <button onClick={() => DeleteSubcollection(i.id)}>
                                                                                                            <TrashIcon className='w-5 h-5 text-gray-400' />
                                                                                                        </button>
                                                                                                    </div>
                                                                                            </div> */}
                                                                                        </dt>
                                                                                        {
                                                                                            i?.gems?.map((gem) => {
                                                                                                return (
                                                                                                    < Disclosure.Panel as="dd" className="mt-1 pl-6" >
                                                                                                        <div className='flex justify-between items-center group'>
                                                                                                            <div className='flex justify-start items-center gap-1 mt-3 cursor-pointer'>
                                                                                                                <img className='h-4 w-4' src={`${gem?.metaData?.icon}`} />
                                                                                                                <span className='text-sm text-gray-600 ml-1'><span onClick={(e)=> window.open(`${gem?.metaData?.link}`,"_shelf")}>{gem?.media_type === "Link" ?(gem.title.length > 35 ?gem.title.slice(0, 35).concat('...') :gem.title.slice(0, 35) ) : null}</span></span>
                                                                                                            </div>
                                                                                                            <div className='flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100'>
                                                                                                            <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 cursor-pointer' onClick={(e)=> window.open(`${gem?.metaData?.url}`,"_shelf")}/>
                                                                                                                <button onClick={() => editGem(gem.id)}>
                                                                                                                    <PencilSquareIcon className='w-5 h-5 text-gray-400' />
                                                                                                                </button>
                                                                                                                <button onClick={() => deleteGems(gem.id)}>
                                                                                                                    <TrashIcon className='w-5 h-5 text-gray-400' />
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </Disclosure.Panel>
                                                                                                )
                                                                                            })
                                                                                        }
                                                                                    </>
                                                                                )}
                                                                            </Disclosure>
                                                                        </dl>
                                                                    </div>
                                                                </div>
                                                            </div >
                                                        )
                                                    })
                                                    : null
                                            }
                                        </>
                                    )}
                                </Disclosure>
                            </dl>
                        </div>
                    </div>
                    {sublist ? nestedComments :null }
                </div >

            )
        })

    )
}
