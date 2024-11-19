import React from 'react'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


const SmallMenu = ({setAllStarredStatus}) => {
  return (
      <Menu as="div" className="ct-relative inline-block text-right">
          <div>
                <Menu.Button className="inline-flex w-full pt-1 justify-center text-sm font-medium text-gray-700 outline-non">
                    <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                </Menu.Button>
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
              <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                      {({ active }) => (
                          <button
                              onClick={()=>setAllStarredStatus(true)}
                              className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'group flex items-center px-4 py-1 text-xs'
                              )}
                          >
                              Starred
                          </button>
                      )}
                  </Menu.Item>
                  <Menu.Item>
                      {({ active }) => (
                          <button
                              onClick={()=>setAllStarredStatus(false)}
                              className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'group flex items-center px-4 py-1 text-xs'
                              )}
                          >
                              Unstarred
                          </button>
                      )}
                  </Menu.Item>
              </Menu.Items>
          </Transition>
      </Menu>
  )
}

export default SmallMenu