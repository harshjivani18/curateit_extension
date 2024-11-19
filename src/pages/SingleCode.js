import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getAllCodes, getSingleCode, updateCode } from "../actions/code";
import Header from "../components/header/Header";
import BookmarkFooter from "../components/bookmarkFooter/BookmarkFooter";
import ComboBox from "../components/combobox/ComboBox";
import TypeComboBox from "../components/combobox/TypeComboBox";
import Input from "../components/input/Input";
import { WithContext as ReactTags } from 'react-tag-input';
import { addTag } from "../actions/tags";
import session from "../utils/session";
import { KEY_CODES } from "../utils/constants";
import { getActiveTabURL } from "../utils/send-theme-to-chrome";
import { useSelector } from "react-redux";
import { copyText } from "../utils/message-operations";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const footerMenuList = [
  {
    id: 1,
    name: "Language",
    link: "#",
    icon: "message-chat-square.svg",
    alt: "message icon"
  },
  {
    id: 2,
    name: "Youtube clip",
    link: "#",
    icon: "youtube-icon.svg",
    alt: "youtube icon"
  },
  {
    id: 3,
    name: "Setting",
    link: "#",
    icon: "settings-icon.svg",
    alt:"setting icon"
  }
]

const SingleCode = () => {
    const dispatch = useDispatch(); 
    const navigate = useNavigate()
    const { collectionId,gemId, codeId } = useParams()

    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [error, setError] = useState(false)
    
    //states
    const [loader, setLoader] = useState('');
    const [assetUrl, setAssetUrl] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false)
    const [code,setCode] = useState('')
    const [language,setLanguage] = useState('')
    const collections       = useSelector((state) => state.collection.collectionData);
    const singleCode       = useSelector((state) => state.codes.singleCode);
    const userTags       = useSelector((state) => state.user.userTags);
    const [loadingState, setLoadingState] = useState(false)

    useEffect(() => {
    const getCall = async () => {
        setLoadingState(true)
        setLoader('loading')
        const res = await dispatch(getSingleCode(collectionId,gemId,codeId))
  
        if(res){
            setLoadingState(false)
            setLoader('success')
        }
    }
    getCall()
  },[])

    useEffect(() => {
    if(singleCode && singleCode.length>0){
        setSelectedTags(singleCode[0].codeData.tags || [])
        setSelectedCollection(singleCode[0].collectionData || '')
        setSelectedType(singleCode[0].codeData.type || '')
        setRemarks(singleCode[0].codeData.notes || '')
        setAssetUrl(singleCode[0].codeData.url)
        setCode(singleCode[0].codeData.code)
        setLanguage(singleCode[0].codeData.language)
        setBookmarkTitle(singleCode[0].codeData.title)
        setDescription(singleCode[0].codeData.description)
    }
  }, [singleCode]);

  const submitHandler = async() => {
    setError(false)
    if (selectedCollection?.id === undefined) {
      setError(true)
      return;
    }
    let newLink = assetUrl.endsWith('/') ? assetUrl.slice(0, -1): assetUrl
    setLoading(true)
    const payload = {
        notes: remarks,
        url:  newLink,
        collections: selectedCollection?.id,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        type:typeof selectedType === "object" ? selectedType?.name : selectedType,
        _id: singleCode[0].codeData._id,
        code:code,
        language: language,
        title: bookmarkTitle,
        description: description
      }
    const res = await dispatch(updateCode(collectionId,gemId,codeId,payload))
    
    if(res.error === undefined){
      await dispatch(getAllCodes(newLink))
      setLoading(false)
      navigate('/all-highlights')
    }
  }

  const onTagDelete = (i) => {
    selectedTags.splice(i, 1)
    setSelectedTags([ ...selectedTags ])
  }

  const onTagAdd = async (tag) => {
    const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
    if (res.error === undefined && res.payload.error === undefined) {
      setSelectedTags([ ...selectedTags, { id: res.payload?.data?.data?.id, tag: tag.text } ])
    }
  }

  const handleCopy = () => {
    copyText(code)
    message.success('Code Copied to clipboard');
  }

  const prepareTags = () => {
    const tagArr = []
    userTags.forEach((t) => {
      if (t.tag) {
        tagArr.push({
          id: t.tag,
          text: t.tag
        })
      }
    })
    return tagArr
  }

    return(
        <div className='h-full' 
            onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}
            >
            <Header label="Edit Code" page="CODE" 
            />
            {
                loadingState ? <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] d-flex'>
                    <Spin size='middle' tip='Loading...'/>
                </div>
                :
            
            <>
                <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5 mb-10'>
                            <div className='grid grid-cols-8 gap-2'>
                                <div className='col-span-7' >
                                <Input size="medium w-full mb-2" type="text" name="link" placeholder="Asset url" 
                                loader={loader} 
                                chooseMessage={loader}
                                value={assetUrl} 
                                onChange={(e)=>setAssetUrl(e.target.value)}
                                />
                                <Input size="medium w-full mb-2" type="text" name="bookmark_name" placeholder="Bookmark title"
                                    value={bookmarkTitle || ""}  
                                    loader={loader} 
                                    chooseMessage={loader}
                                    onFocus={()=>setLoader(false)} 
                                    onChange={(e) => setBookmarkTitle(e.target.value)}
                                />
                                <Input size="medium w-full" type="text" name="description" placeholder="Enter description" 
                                value={description} loader={loader} onChange={(e) => setDescription(e.target.value)}
                                chooseMessage={loader}
                                />
                                <div className='pt-6 flex justify-between space-x-2'>
                                    {/* Collections */}
                                    <div 
                                    className={classNames("flex-1", showTypeInput && "hidden")}
                                    >
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Collections</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                        <div 
                                        onClick={() => setShowCollectionInput(true)} 
                                        className="w-full">
                                        <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} 
                                        setSelectedCollection = {setSelectedCollection} 
                                        selectedCollection={selectedCollection} 
                                        error={error}/> 
                                        </div>
                                    </div>
                                    </div>
                                    {/* Types */}
                                    <div 
                                    className={classNames("flex-1", showCollectionInput && 'hidden')}
                                    >
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Type</h6>
                                    <div className='ct-relative' onClick={e => e.stopPropagation()}>
                                        <div 
                                        className="w-full">
                                            <TypeComboBox inputShown={showTypeInput} setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType} type={'Code'} disabled={true}/> 
                                        </div>
                                    </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Input size="medium w-full mb-2" type="text" name="language" placeholder="Enter Language" 
                                        value={language} 
                                        onChange={(e)=>setLanguage(e.target.value)}
                                    />
                                </div>

                                <div className="pt-4">
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Code Snippet</h6>
                                    <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] p-relative'>
                                        <svg 
                                        className='highlight-copy-svg'
                                        onClick={handleCopy}
                                        xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z"/></svg>
                                        <pre className="pre-tag-style" style={{height:'250px'}}>
                                        <code className="code-tag-style" style={{height:'250px'}}>
                                            {code}
                                        </code>
                                        </pre>
                                    </div>
                                </div>

                                <div className='pt-4'>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Tags</h6>
                                    <div className='bg-white border-2 border-gary-400 p-2 rounded-lg'>
                                    <ReactTags 
                                        tags={selectedTags.map((t) => { return { id: t.tag, text: t.tag }  })}
                                        suggestions={prepareTags()}
                                        // suggestions={userTags ? userTags.map((t) => { return { id: t.tag, text: t.tag } }) : []}
                                        delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                                        handleDelete={onTagDelete}
                                        handleAddition={onTagAdd}
                                        inputFieldPosition="bottom"
                                        placeholder="Enter Tag"
                                        autocomplete
                                        clearAll
                                    />
                                    </div>
                                </div>
                                <div className='pt-4'>
                                    <h6 className="block text-xs font-medium text-gray-500 mb-1">Comment</h6>
                                    <Input size="medium w-full mb-2 h-20" type="text" name="descriptions" placeholder="Add your comments" value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>
                            
                                </div>
                            </div>
                </div>

            <div className='bg-white px-4 border-t-2 mb-9 fixed bottom-0 w-full code-footer'>
                <BookmarkFooter page="highlight" footerMenuList={footerMenuList} 
                submitHandler = {submitHandler} 
                loading={loading}/>
            </div>
            </>
            }
      </div>
    )
}

export default SingleCode;