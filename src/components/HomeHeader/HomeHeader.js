import React, { useState, useEffect } from 'react'
import { Bars3Icon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { Menu } from '@headlessui/react'
import MenuList from '../menuList/MenuList'
import session from '../../utils/session'
// import { toggleDarkMode } from '../../utils/toggle-dark-mode';

const HomeHeader = ({ isHomeHeader = false, headerMenu , userData ,nameData, importnameData}) => {

  const [user, setUser] = useState('')

  useEffect(() => {
    if(session){
      setUser(session.username)
    }
  }, [session])

  return (
    <>
      <div className='flex justify-between items-center'>
        <img className='h-[24px]' src="/icons/logo.png" alt="curateit.com" />
        {isHomeHeader ?
          (
            <div className='flex justify-end items-center'>
              <div>
                <MenuList menus={headerMenu} position="origin-top-left top-0 right-0 mt-8 w-48">
                  <Menu.Button className="inline-flex w-full justify-center  px-2 text-sm font-medium text-gray-700 outline-non">
                    {userData||nameData || importnameData || user}              
                    <ChevronDownIcon className="h-4 w-4 text-gray-700 mt-0.5" aria-hidden="true" />
                  </Menu.Button>
                </MenuList>
              </div>
              
              <UserCircleIcon className='h-6 w-6 text-[#105FD3]' />
            </div>
          ) : (
            <div className='flex justify-end items-center'>
              <span>{user}</span>
              <UserCircleIcon className='h-6 w-6 ml-2 text-[#105FD3] cursor-pointer' />
              <MenuList menus={headerMenu} position="origin-top-left top-0 right-0 mt-8 w-56">
                <Menu.Button className="text-white outline-non p-[2px] pt-[5px]">
                  <ChevronDownIcon className="h-4 w-4 text-gray-700" aria-hidden="true" />
                </Menu.Button>
              </MenuList>
              <button>
                <Bars3Icon className='h-7 w-7 ml-2 text-gray-700' />
              </button>
            </div>
          )}
      </div>
    </>
  )
}

export default HomeHeader