import React from 'react'
import {  Switch } from "antd"

const SettingType = ({ title, enableMenu, handleChange }) => {
  return (
    <div className="flex justify-between items-center py-1">
      <h2 className="flex-1">{title}</h2>
      <Switch
        checked={enableMenu}
        onChange={handleChange}
        style={{ background: enableMenu ? "#1890ff" : "#00000040" }}
        size="small"
      />
    </div>
  )
}

export default SettingType