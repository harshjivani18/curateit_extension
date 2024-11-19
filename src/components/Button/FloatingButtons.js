import React                from 'react'
import { BsLink45Deg }      from 'react-icons/bs'
import { FiDownload }       from 'react-icons/fi'
import { RiImageEditFill }  from 'react-icons/ri'   

const FloatingButtons = (props) => {

    const onLinkCopy = () => {
        props.onLinkCopy && props.onLinkCopy()
    }

    const onDownload = () => {
        props.onDownload && props.onDownload()
    }

    const onEditorClick = () => {
        props.onEditorClick && props.onEditorClick()
    }

    const onTextExtractClick = () => {
        props.onTextExtractClick && props.onTextExtractClick()
    }

    return (
        <div className='flex flex-col gap-2 absolute right-2 top-2'>
            <button className='flex justify-center items-center h-7 w-7 rounded-md bg-slate-200 bg-opacity-40 hover:bg-opacity-60' onClick={onLinkCopy}>
                <BsLink45Deg className='text-white h-5 w -5' />
            </button>
            {!props.isHideDownload &&
                <button className='flex justify-center items-center h-7 w-7 rounded-md bg-slate-200 bg-opacity-40 hover:bg-opacity-60' onClick={onDownload}>
                    <FiDownload className='text-white h-5 w -5' />
                </button>
            }
            {!props.showImageEditor &&
                <button className='flex justify-center items-center h-7 w-7 rounded-md bg-slate-200 bg-opacity-40 hover:bg-opacity-60' onClick={onEditorClick}>
                    <RiImageEditFill className='text-white h-5 w -5' />
                </button>
            }
            {props.onTextExtractClick &&
                <button className='flex justify-center items-center h-7 w-7 rounded-md bg-slate-200 bg-opacity-40 hover:bg-opacity-60' onClick={onTextExtractClick}>
                    {props.isLoadingExtract ? <div className='loader w-5 h-5' /> : <span className='text-white'>T</span>}
                </button>
            }
        </div>
    )
}

export default FloatingButtons