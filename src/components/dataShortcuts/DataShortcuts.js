/*global chrome*/
import "./style.css"

import React, { useState }  from "react"
import { useSelector, 
         useDispatch }      from "react-redux"
import { Collapse }         from "antd"
import { ChevronDownIcon, 
         ChevronUpIcon }    from "@heroicons/react/24/outline"

import ButtonSetting        from "./ButtonSetting"

// import { updateUser }       from "../../actions/user"

const { Panel } = Collapse

const DataShortcuts = ({ deleteCollections, deleteGems }) => {
  const userDetails         = useSelector(state => state?.user);
  const dispatch            = useDispatch();
  const [prefix, setPrefix] = useState(userDetails?.userData?.preferences?.short_link_prefix || "")

  const openShortcut = () => {
    chrome.runtime.sendMessage({ request: "extensions/shortcuts" })
  }

  // const onShortLinkPrefixBlur = async () => {
  //   if (prefix.length > 3 || prefix === "") return
  //   await dispatch(updateUser({ preferences: { ...userDetails.userData?.preferences, short_link_prefix: prefix } }))
  // }

  // const onPrefixChange = (e) => {
  //   const { value } = e.target
  //   if (value.length > 3) {
  //     message.error("Prefix must be less than 3 characters")
  //     return
  //   } 
  //   setPrefix(value)
  // }

  return (
    <div>
      <Collapse
        bordered={false}
        expandIcon={(status) => {
          return (
            <div>
              {status.isActive ? (
                <ChevronUpIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </div>
          )
        }}
        expandIconPosition="end"
      >
        <Panel
          header={
            <div>
              <h2 className="font-bold text-gray-600">DATA & SHORTCUTS</h2>
            </div>
          }
          key="1"
        >
          {/* <div className="flex justify-between items-center">
            <h2 className="text-gray-600">Short Link Prefix</h2>
            <div className="flex items-center">
              <input value={prefix} 
                     type="text" 
                     className="border border-gray-300 rounded-md px-2 py-1 w-[60px]" 
                     onChange={onPrefixChange}
                     onBlur={onShortLinkPrefixBlur} />
            </div>
          </div> */}
          <ButtonSetting
            title="All collections"
            btnText="Delete"
            color="text-red-600 bg-red-100 border border-red-500"
            onClick={deleteCollections}
          />
          <ButtonSetting
            title="All gems"
            btnText="Delete"
            color="text-red-600 bg-red-100 border border-red-500"
            onClick={deleteGems}
          />
          <ButtonSetting
            title="Shortcuts"
            btnText="Add"
            color="text-blue-600 bg-blue-100 border border-blue-500"
            onClick={openShortcut}
          />
        </Panel>
      </Collapse>
    </div>
  )
}

export default DataShortcuts
