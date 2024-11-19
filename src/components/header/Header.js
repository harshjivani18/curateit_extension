import React                          from 'react'
import { useNavigate }                from 'react-router-dom'
import { ArrowLeftIcon, 
         DocumentArrowDownIcon,
         ArrowRightIcon 
       }                              from '@heroicons/react/24/outline'
import { Menu }                       from '@headlessui/react'

import MenuList                       from '../menuList/MenuList';
import session from '../../utils/session';
import { setExpandedKeys, setLoadedKeys } from '../../actions/collection';
import { useDispatch } from 'react-redux';

const Header = ({ label, isHideBackButton, isMenuItemEnabled, onSkip, menuItems, MenuIcon, isDownloadable, onDownload, onClose, onBackBtnClick,backUrl=''  }) => {
  const navigate = useNavigate();
  const dispatch  = useDispatch()

  const onDownloadClick = () => {
    onDownload && onDownload()
  }

  const onCloseClick = () => {
    if (onClose) {
      onClose()
      return
    }
    navigate("/search-bookmark")
  }

  const onBackClick = () => {
    dispatch(setLoadedKeys([]))
    dispatch(setExpandedKeys([]))
    if (onBackBtnClick) {
      onBackBtnClick()
    }
    if(backUrl){
      navigate(backUrl)
    }else{
      if(session?.userId){
        navigate("/search-bookmark")
      }else{
        navigate('/login')
      }
    }
  }

  return (
    <div className="flex justify-between items-center px-4 py-3 bookmark-bg">
      {isHideBackButton 
        ? <div className="flex justify-start items-center cursor-pointer">
            <span className="text-white text-sm ml-1">{label}</span>
          </div>
        : <div className="flex justify-start items-center cursor-pointer" onClick={onBackClick}>
            <ArrowLeftIcon className="h-4 w-4 text-white" aria-hidden="true" />
            <span className="text-white text-sm ml-1">{label}</span>
          </div>
      }
      <div className='flex space-x-4 items-center justify-end'>
        {isMenuItemEnabled && 
          <MenuList menus={menuItems} position="origin-top-left top-0 left-0 mt-8">
            <Menu.Button className="text-white outline-non p-[2px]">
              <MenuIcon className='h-6 w-6' />
            </Menu.Button>
          </MenuList>
        }
        {isDownloadable &&
          <button onClick={onDownloadClick}>
            <DocumentArrowDownIcon className='h-6 w-6 text-white' />
          </button>
        }
        {onSkip &&
          <div className="flex justify-start items-center cursor-pointer" onClick={onSkip}>
            <span className="text-white text-sm mr-1">Skip</span>
            <ArrowRightIcon className="h-4 w-4 text-white mr-1" aria-hidden="true" />
          </div>
        }
        {/* <div className='h-6 w-6 rounded-sm bg-[#C85C54] cursor-pointer'>
          <XMarkIcon className="h-6 w-6 text-white p-1" onClick={onCloseClick}/>
        </div> */}
      </div>
    </div>
  )
}

export default Header