import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { HashtagIcon, HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const recents = [
    {
        id:"1",
        title: "cms",
        time: "11:57 PM" 
    },
    {
        id:"2",
        title: "complaint manag",
        time: "Aug 31" 
    },
    {
        id:"3",
        title: "complaint management",
        time: "Aug 31" 
    },
    {
        id:"4",
        title: "cm",
        time: "Aug 11" 
    },
]
 

export default function SuggestionMenu({ children, menus, position = "origin-top-right" }) {
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
                <Menu.Items className={classNames(position, "absolute z-10 px-4 py-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none  max-h-[400px] overflow-scroll")} as="section">
                    <h2 className='pb-1 text-xs text-gray-400'>Suggested</h2>
                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href=""
                                className='text-gray-600 group flex items-center py-2 text-xs space-x-3'>
                                <div className='flex-1 flex justify-start items-center gap-1'>
                                    <HeartIcon className='h-4 w-4 text-red-400' />
                                    <span>Favorites</span>
                                </div>
                                <span className='text-xs'>1</span>
                            </a>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href=""
                                className='text-gray-600 group flex items-center py-2 text-xs gap-1'>
                                <div className='flex-1 flex justify-start items-center gap-1'>
                                    <HashtagIcon className='h-4 w-4 text-gray-400' />
                                    <span>Tag</span>
                                </div>
                                <span className='text-xs'>4</span>
                            </a>
                        )}
                    </Menu.Item>

                    <h2 className='pt-4 pb-1 text-sm text-gray-400'>Recent</h2>
                    {recents.map((r,i) => (<Menu.Item key={i}>
                        {({ active }) => (
                            <a
                                href=""
                                className='text-gray-600 group flex items-center py-2 text-xs space-x-3'>
                                <div className='flex-1 flex justify-start items-center gap-2'>
                                    <MagnifyingGlassIcon className='h-4 w-4 text-gray-400' src="/icons/" />
                                    <span>{r.title}</span>
                                </div>
                                <span className='text-xs'>{r.time}</span>
                            </a>
                        )}
                    </Menu.Item>))}
                    
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
