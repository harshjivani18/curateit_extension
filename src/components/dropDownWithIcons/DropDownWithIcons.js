import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { FiDownload } from "react-icons/fi"
import { BookOpenIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function DropDownWithIcons({ showName = false }) {
    return (
        <Menu as="div" className="ct-relative inline-block text-left">
            <div>
                {showName ? (
                    <Menu.Button className="inline-flex w-full justify-center  px-2 text-sm font-medium text-gray-700 outline-non">
                        James P.
                        <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                ) : (
                    <Menu.Button className="inline-flex w-full pt-1 justify-center text-sm font-medium text-gray-700 outline-non">
                        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                    </Menu.Button>
                )}
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
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href="/"
                                className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                )}
                            >
                                <Cog6ToothIcon
                                    className="mr-3 h-5 w-5 text-gray-500"
                                    aria-hidden="true"
                                />
                                Setting
                            </a>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href="/"
                                className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                )}
                            >
                                <FiDownload
                                    className="mr-3 h-5 w-5 text-gray-500"
                                    aria-hidden="true"
                                />
                                Download app
                            </a>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href="/"
                                className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                )}
                            >
                                <img src="/icons/help-octagon.svg" alt="help octagon icon" className="mr-3 h-5 w-5" aria-hidden="true" />
                                Help & Support
                            </a>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href="/"
                                className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                )}
                            >
                                <BookOpenIcon
                                    className="mr-3 h-5 w-5 text-gray-500"
                                    aria-hidden="true"
                                />
                                What's New?
                            </a>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <a
                                href="/"
                                className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'group flex items-center px-4 py-2 text-sm'
                                )}
                            >
                                <img src="/icons/log-out.svg" alt="logout icon" className="mr-3 h-5 w-5" aria-hidden="true" />
                                Logout
                            </a>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
