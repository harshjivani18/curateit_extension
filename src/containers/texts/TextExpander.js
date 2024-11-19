import React                            from 'react'
import { useDispatch }                  from 'react-redux';
import { PencilSquareIcon }             from '@heroicons/react/24/outline'
import { MdOutlineOpenInNew }           from "react-icons/md";
import { Tooltip }                      from 'antd';

import { setCurrentGem, 
         setCurrentMedia }              from '../../actions/gem';

const TextExpander = (props) => {
    const dispatch  = useDispatch()
    const covers    = props.obj?.metaData?.covers
    const plainText = props.obj?.plainText || props.obj?.text || ""
    const onPageOpen = (e) => {
        e.preventDefault()
        e.stopPropagation()
        const { obj } = props
        if (obj && obj.url) {
            window.open(obj.url, "_blank")
        }
        return false
    }

    const onEditClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(setCurrentGem({ ...props.obj, parent: props.parent }))
        dispatch(setCurrentMedia(props.obj.media))
        props.editGem({ ...props.obj, parent: props.parent })
        return false
    }

    const onDeleteClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        props.modalDelete(props)
        return false
    }

    const onToggleFav = (e) => {
        e.preventDefault()
        e.stopPropagation()
        return false
    }

    return (
        <dd className="mt-1" onClick={onPageOpen}>
            <div className='flex justify-between items-center group'>
                <div className='flex justify-start items-center gap-1 cursor-pointer'>
                    {/* <img className='h-4 w-4' src={`${props.obj?.metaData?.icon}`} /> */}
                    {props.obj.type === "expander" ?
                     <button className='bg-[#F8FBFF] p-[2px] rounded-sm'>
                        <img className='h-5 w-5' src="/icons/text-spacing.svg" alt="text spacing" />
                     </button> 
                     :
                    ((covers && covers.length > 0 && covers[0]) || props.obj?.metaData?.icon)
                      ? <img className='h-4 w-4' src={ props.obj?.metaData?.icon ? `${props.obj?.metaData?.icon}` : `${covers[0]}`} alt={props.obj?.title} />
                      : 
                      <button className='bg-[#F8FBFF] rounded-sm'>
                        <img style={{height:"14px", width:"14px"}} src="/icons/bookmark-svgrepo-com.svg" alt="pdf icon" />
                     </button> 
                    }
                    <span className='text-sm text-gray-600 ml-1'>
                        <Tooltip title={plainText}>
                            {plainText.length > 35 ? plainText.slice(0,35).concat("...") : plainText}
                        </Tooltip>
                    </span>                                                                
                </div>
                <div className='flex justify-end items-center space-x-3 opacity-0 group-hover:opacity-100'>
                    <MdOutlineOpenInNew className='text-gray-400 h-5 w-5 cursor-pointer' onClick={onPageOpen}/>
                    <button onClick={onEditClick}>
                        <PencilSquareIcon className='w-5 h-5 text-gray-400' />
                    </button>
                </div>
            </div>
        </dd>
    )
}

export default TextExpander