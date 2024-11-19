import React, { useState, useRef,
       useEffect }                  from 'react';
import CodeMirror                   from '@uiw/react-codemirror';
import { javascript }               from '@codemirror/lang-javascript';

import { DocumentTextIcon, 
         MinusCircleIcon }          from '@heroicons/react/24/solid';
import { LANGUAGES, THEMES }        from '../../utils/constants';


const CodeEditor = ({ media, editorClass }) => {
    const lowerLang             = media.language ? media.language.toLowerCase() : "javascript"
    const docRef                = useRef(null);
    const [theme, setTheme]     = useState("dark");
    const [extentionLng, 
           setExtentionsLng]    = useState(javascript())

    useEffect(() => {
        handleLanguageChange("javascript");

        //Set initaila theme
        handleThemeChange("dracula")
    }, []);

    const handleThemeChange = (e) => {
        const value = e?.target?.value || e;
        const selectedObj = THEMES.filter(lng => lng.mode === value)[0];
        if (selectedObj) {
            setTheme(selectedObj.theme);
        } else {
            setTheme("dark");
        }
    }

    const handleLanguageChange = (e) => {
        const selectedObj = LANGUAGES.filter(lng => lng.mode === lowerLang)[0];
        if (selectedObj) {
            setExtentionsLng(selectedObj.lng);
        } else {
            setExtentionsLng(javascript());
        }
    }

    return (
        <div ref={docRef}>
            <div className='max-h-full w-full bg-gradient-to-t from-[#256F6C] to-[#50BF91] py-[1.2rem] rounded-md'>
                <div className='flex justify-center items-center'>
                    <div className={`bg-[#1A3D71] rounded-md shadow-sm ${editorClass}`}>
                        <div className='flex justify-start h-8 pt-[2px] scrollbar-hide'>
                            <div className='flex justify-start items-center space-x-1 h-full px-2'>
                                <MinusCircleIcon className='h-2 w-2 rounded-full text-pink-700 bg-pink-700' />
                                <MinusCircleIcon className='h-2 w-2 rounded-full text-yellow-500 bg-yellow-500' />
                                <MinusCircleIcon className='h-2 w-2 rounded-full text-green-400 bg-green-400' />
                            </div>
                            <div className='bg-gray-700 flex justify-between items-center gap-2 px-2 h-full text-white cursor-pointer'>
                                <button className='flex justify-start items-center gap-1'>
                                    <DocumentTextIcon className='h-3 w-3' />
                                    <span className='text-xs'>index.js</span>
                                </button>
                            </div>
                        </div>
                        <div className='text-[0.7rem] overflow-auto'>
                            <CodeMirror
                                style={{
                                    overflow: 'hidden',
                                    wordBreak: 'break-all',
                                    wordWrap: 'break-word',
                                    flexWrap: 'wrap'
                                }}
                                width="330px"
                                indentWithTab={true}
                                value={media.code}
                                theme={theme}
                                extensions={[extentionLng]}
                                editable={false}
                                readOnly={true}
                                basicSetup={{
                                    lineNumbers: false
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CodeEditor