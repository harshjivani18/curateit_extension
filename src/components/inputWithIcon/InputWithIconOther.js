import React, { useState } from 'react'
import {  MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import SuggestionMenu from '../suggestionMenu/SuggestionMenu';
import { Menu } from '@headlessui/react';

const InputWithIconOther = ({ type, name, placeholder, customClass, onChange, onFocusInput, inputRef }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(type);

    const togglePassVisibility = () => {
        if (name !== "password") return;

        if (showPassword) {
            setInputType(type)
            setShowPassword(false)
        } else {
            setInputType("text")
            setShowPassword(true)
        }
    }
    return (
        <div className="ct-relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                {name === "search-bookmark" && <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />}
            </div>
            <input
                type={inputType}
                name={name}
                id={name}
                className="block w-full outline-none rounded-md border-[1px] border-gray-300 pl-12 focus:border-indigo-500 focus:ring-indigo-500 text-sm h-[40px] text-gray-500"
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value) }
                onFocus={onFocusInput}
                ref={inputRef}
            />
            {name === "search-bookmark" &&
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer">
                    <SuggestionMenu position="origin-top-left top-0 right-0 mt-8 w-[18rem]">
                        <Menu.Button className="inline-flex w-full justify-center  px-2 text-sm font-medium text-gray-700 outline-non">
                            <img className="h-5 w-5 text-gray-500" src="/icons/adjustment.svg" alt="adjustment icons" aria-hidden="true" />
                        </Menu.Button>
                    </SuggestionMenu>
                </div>
                }
        </div>
    )
}

export default InputWithIconOther