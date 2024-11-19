import React                        from 'react'
import { message }                  from 'antd'

import HighlightActions             from './HighlightActions'
import FloatingButtons              from '../../components/Button/FloatingButtons'
import CodeEditor                   from './CodeEditor'
import { copyText }                 from "../../utils/message-operations";

const CodeHighlight = (props) => {
    const { obj, 
            editorClass } = props
    const media           = Array.isArray(obj.media) && obj.media.length !== 0 ? obj.media[0] : typeof obj.media === "object" && obj.media["0"] ? obj.media["0"] : typeof obj.media ? obj.media : null
    
    const onLinkCopy = () => {
        if (media) {
            try {
                copyText(media.code);
                message.success('Text Copied to clipboard');
            } catch (err) {
                message.error('Not have permission')
            }
        }
    }   

    const onDownload = () => {

    }
    
    if (media === null) return null
    return (
        <div>
            <div className='border-[1px] border-gray-300 border-b-0 rounded-b-0 rounded-sm py-2 pr-2'>
                <div className='py-1 pl-3 border-l-4 border-pink-500'>
                    <div className='mb-2'>
                        <div className='ct-relative bg-[#01122B] p-4 rounded-md'>
                            <FloatingButtons onLinkCopy={onLinkCopy} onDownload={onDownload} isHideDownload={true} />
                            <CodeEditor media={media} editorClass={editorClass} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='pl-4 border-[1px] border-gray-300 border-t-0 rounded-t-0 rounded-sm'>
                <hr className='w-full bg-gray-300 -mr-5' />
                <HighlightActions media={media} obj={obj} />
            </div>
        </div>
    )
}

export default CodeHighlight