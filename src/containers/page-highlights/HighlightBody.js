import React from 'react'
import { convertHtmlToReact } from '@hedgedoc/html-to-react';
import {
  RiCheckboxBlankCircleFill,
  RiFileCopyLine,
  RiLinkM
} from 'react-icons/ri'
import { message } from 'antd'

import { copyText } from '../../utils/message-operations'

const HighlightBody = (props) => {
  const onTextCopy = () => {
    try {
      copyText(props.text);
      message.success('Text Copied to clipboard');
    } catch (err) {
      message.error('Not have permission')
    }
  }

  const onCopyLinkHighlight = () => {
    props.copyLinkToHighlight()
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link']
    ]
  }

  // const onTextExpanderChange = (content, delta, source, editor) => {
  //   setTextExpander(content)
  // }
  return (
    <div className='flex justify-start items-start gap-2'>
      <p className={`flex-1 text-xs text-gray-600`}>
        <div className="pt-4">
          <div className='bg-white rounded-md p-2 border-2 flex gap-[5px] justify-between items-end'>
            <div style={{ margin: "auto 0" }}>
              {/* view highlights page */}
              {convertHtmlToReact(props.text) || "Curateit"}
            </div>
            <div className='colorOps flex flex-col items-end'>
              <RiCheckboxBlankCircleFill className={`h-4 w-4 ${props.color && props.color.text ? props.color.text : "text-pink-400"} mb-3 cursor-pointer`} />
              <RiFileCopyLine className='h-4 w-4 text-gray-500 mb-3 cursor-pointer' onClick={onTextCopy} />
              <RiLinkM className='h-4 w-4 text-gray-500 cursor-pointer' onClick={onCopyLinkHighlight} />
            </div>
          </div>
        </div>
      </p>
    </div>
  )

}

export default HighlightBody