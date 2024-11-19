import React, { useState }      from 'react'
import { useSelector, 
         useDispatch }          from 'react-redux'
import { message }              from 'antd'
import HighlightActions         from './HighlightActions'
import FloatingButtons          from '../../components/Button/FloatingButtons'
import HighlightBody            from './HighlightBody'
import { copyText }             from '../../utils/message-operations'
import session                  from '../../utils/session'
import { fetchCurrentTab }      from '../../utils/fetch-current-tab'
import { extractImageText }     from '../../actions/image'

const ImageHighlight = (props) => {
    const { obj }                       = props
    const media                         = Array.isArray(obj.media) && obj.media.length !== 0 ? obj.media[0] : typeof obj.media === "object" && obj.media["0"] ? obj.media["0"] : typeof obj.media ? obj.media : null
    const tabDetails                    = useSelector((state) => state.app.tab)
    const dispatch                      = useDispatch()
    const [textExtract, setTextExtract] = useState('')
    const [isTextExtractLoading, 
           setTextExtractLoading]       = useState(false)

    const onLinkCopy = () => {
        if (media) {
            try {
                copyText(obj?.S3_link && obj.S3_link.length !== 0 ? obj.S3_link[0] : media.image);
                message.success('Text Copied to clipboard');
            } catch (err) {
                message.error('Not have permission')
            }
        }
    }

    const onDownload = () => {
        const src    = obj?.S3_link && obj.S3_link.length !== 0 ? obj.S3_link[0] : media.image ? media.image : null
        if(src){
            const link      = document.createElement('a');
            link.href       = src;
            link.download   = src;
    
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    }

    const onEditorClick = async () => {
        const { REACT_APP_WEBAPP_URL } = process.env
        const url                      = obj?.S3_link && obj.S3_link.length !== 0 ? obj.S3_link[0] : media.image
        const editorURL                = `${REACT_APP_WEBAPP_URL}/u/${session.username}/image-editor/${obj.id}/${session.token}?url=${url}`
        const t                        = tabDetails || await fetchCurrentTab()
        window.chrome.tabs.sendMessage(t.id, { id: "CT_OPEN_WINDOW", tabURLs: [editorURL], isCloseExt: true })
    }

    const onTextExtractClick = async () => {
        const imageSrc = obj?.S3_link && obj.S3_link.length !== 0 ? obj.S3_link[0] : media.image
        if (imageSrc.startsWith("blob")) { 
            message.error('Image is not uploaded yet. So not able to extract text')
            return
        }
        try {
            if(textExtract){
                message.info('Text Already Copied to clipboard');
                copyText(textExtract)
                return;
            }else{
                setTextExtractLoading(true)
                const resp = await dispatch(extractImageText(imageSrc))
                if (resp.error === undefined && resp.payload?.error === undefined) { 
                    setTextExtractLoading(false)
                    const { data } = resp.payload
                    if (data) {
                        const { text } = data
                        setTextExtract(text)
                        copyText(text)
                        message.success('Text Copied to clipboard');
                    }
                }
                else {
                    setTextExtractLoading(false)
                    message.error('Not able to extract text')
                    setTextExtract('')
                }
            }  
        } catch (err) {
            message.error('Not have permission')
            setTextExtract('')
        }
    }

    if (media === null) return null
    return (
        <div>
            <div className='border-[1px] border-gray-300 border-b-0 rounded-b-0 rounded-sm py-2 pr-2'>
                <div className='py-1 pl-3 border-l-4 border-pink-500'>
                    <div className='mb-2'>
                        <div className='ct-relative'>
                            <FloatingButtons onLinkCopy={onLinkCopy} onDownload={onDownload} onEditorClick={onEditorClick} onTextExtractClick={onTextExtractClick} isLoadingExtract={isTextExtractLoading} />
                            <img src={obj?.S3_link && obj.S3_link.length !== 0 ? obj.S3_link[0] : media.image} alt="" className='w-full h-auto object-cover rounded-sm' />
                        </div>
                    </div>
                    <HighlightBody text={obj.text || obj.title || obj.description} />
                </div>
            </div>
            <div className='pl-4 border-[1px] border-gray-300 border-t-0 rounded-t-0 rounded-sm'>
                <hr className='w-full bg-gray-300 -mr-5' />
                <HighlightActions media={media} obj={obj} />
            </div>
        </div>
    )
}

export default ImageHighlight