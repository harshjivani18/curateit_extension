import { useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react'
import { ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { MdOutlineOpenInNew } from "react-icons/md";

export default function GemList({ gem, deleteGems, editGem}) {
    // const [sublist, setSublist] = useState()

    return (
        < Disclosure.Panel as="dd" className="mt-1 pl-6" >
            <div className='flex justify-between items-center group'>
                <div className='flex justify-start items-center gap-1 mt-3 cursor-pointer'>
                    <img className='h-4 w-4' src={`${gem?.metaData?.icon}`} />
                    <span className='text-sm text-gray-600 ml-1'><span onClick={(e) => window.open(`${gem?.metaData?.url}`, "_shelf")}>{(gem?.metaData?.level === "gem" || gem?.media_type === "Link") ? gem.title.slice(0, 35).concat("", ".....") : null}</span></span>                                                                </div>
                <div className='flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100'>
                    <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 cursor-pointer' onClick={(e) => window.open(`${gem?.metaData?.url}`, "_shelf")} />
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
}
