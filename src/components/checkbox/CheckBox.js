import React from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
const CheckBox = ({ label, name, value, onChange,darkColor = false, hideLabel = false  }) => {
    return (
        <div className="ct-relative flex items-center justify-start">
            <div className="flex h-5 items-center">
                <input
                    id={name}
                    checked={value}
                    aria-describedby="comments-description"
                    name={name}
                    onChange={(e) =>onChange(e.target.checked)}
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-200 text-indigo-600 focus:ring-indigo-500 bg-transparent"
                />
            </div>
            <div className="ml-2 text-sm">
            {!hideLabel && (<label htmlFor={name} className={classNames(darkColor ? "text-black" : "text-gray-500", "ml-2 text-xs")}>
            {label}
        </label>)}
            </div>
        </div>
    )
    }


export default CheckBox