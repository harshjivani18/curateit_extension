import React from 'react'
import { Avatar, Checkbox, Dropdown, Switch } from "antd"
import {
  UserCircleIcon,
} from "@heroicons/react/24/outline"
import { FiEdit3 } from "react-icons/fi"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import session from '../../utils/session'

const onSettingClick = () => { 
  window.open(`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/edit-profile?userId=${session.userId}`, "_blank")
  }

const AccountDisplay = () => {
  const navigate = useNavigate()
  const user = useSelector(state => state?.user?.userData);
  return (
    <div className="py-1">
      <h2 className="font-bold text-gray-600">ACCOUNT</h2>
      <div className="flex justify-between items-center gap-2 py-2 border-b-2 border-blue-100">
        <div className="flex items-center justify-start gap-2 flex-1">
          <Avatar
            size="medium"
            icon={session?.userProfileImage && session?.userProfileImage !== "null" ? <img className="object-cover" src={session?.userProfileImage} alt={session?.username} /> : <UserCircleIcon />}
            className="cursor-pointer"
          />
          <div className="flex flex-col items-start justify-start flex-1">
            <span className="font-medium">{(user?.firstname && user?.lastname) ? `${user?.firstname} ${user?.lastname}` :  session?.username ? session?.username : ""}</span>
            <span className="text-[#7C829C]">My account</span>
          </div>
        </div>
        <button
          className="flex justify-start items-center gap-1"
          // onClick={() => navigate(`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/edit-profile`)}
          
          onClick={onSettingClick}
        >
          <FiEdit3 className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Edit</span>
        </button>
      </div>
    </div>
  )
}

export default AccountDisplay