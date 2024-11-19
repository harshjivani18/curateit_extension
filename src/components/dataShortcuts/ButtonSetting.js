import React from 'react'

const ButtonSetting = ({ title, btnText, onClick, color }) => {
  return (
    <div className="flex justify-between items-center py-1">
      <h2 className="flex-1">{title}</h2>
      <button onClick={onClick} className={`${color} rounded-md p-1 px-2`}>
         {btnText}
      </button>
    </div>
  )
}


export default ButtonSetting