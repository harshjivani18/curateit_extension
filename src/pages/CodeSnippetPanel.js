/*global chrome*/
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getActiveTabURL } from "../utils/send-theme-to-chrome";
import { useSelector,useDispatch } from "react-redux";
import BookmarkFooter from "../components/bookmarkFooter/BookmarkFooter";
import ComboBox from "../components/combobox/ComboBox";
import TypeComboBox from "../components/combobox/TypeComboBox";
import Input from "../components/input/Input";
import { WithContext as ReactTags } from 'react-tag-input';
import { addTag } from "../actions/tags";
import session from "../utils/session";
import { KEY_CODES } from "../utils/constants";
import { fetchUrlData } from "../actions/domain";
import { addCode, getAllCodes, updateCode, updateCodeToGem } from "../actions/code";
import { v4 as uuidv4 } from 'uuid';
import { getAllCollections } from "../actions/collection";

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const CodeSnippetPanel = () => {
    const [codeSnippet,setCodeSnippet] = useState('')
    const [showCollectionInput, setShowCollectionInput] = useState(false);
    const [showTypeInput, setShowTypeInput] = useState(false);
    const [bookmarkTitle, setBookmarkTitle] = useState('');
    const [description, setDescription] = useState('');
    const [remarks, setRemarks] = useState('');
    const [assetUrl, setAssetUrl] = useState('');
    const [selectedCollection, setSelectedCollection] = useState({id:Number(session.unfiltered_collection_id),name:"Unfiltered"});
    const [selectedType, setSelectedType] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [loader, setLoader] = useState('');
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [language, setLanguage] = useState('')
    const [currentUrlGemId,setCurrentUrlGemId] = useState('')
    const [assetError, setAssetError] = useState(false)
    
    const dispatch          = useDispatch();

   
    const collections       = useSelector((state) => state.collection.collectionData);
    const userTags          = useSelector((state) => state.user.userTags)
    const urlData           = useSelector((state) => state.domain.urlData)

    useEffect(() => {
       const getCall = async () => {
        setLoader('loading')
        const tabs = await getActiveTabURL()
        const url = tabs.url.endsWith('/') ? tabs.url.slice(0,-1) : tabs.url
        const response = await dispatch(getAllCodes(url))
        await dispatch(getAllCollections())
        if(response?.payload?.data?.length>0){
          setCurrentUrlGemId(response.payload.data[0].id)
        }else{
          setCurrentUrlGemId('')
        }
        if (urlData === undefined || urlData === null) {
            const urlRes = await dispatch(fetchUrlData(url))
            if (urlRes.error === undefined && urlRes.payload?.error === undefined) {
                updateURLData(urlRes.payload.data)
            } 
        }
        else {
            updateURLData(urlData)
        }
        setLoader("success")

       }

       getCall()

        chrome?.storage?.sync.get(['codeSnippetData'],function(data){
        setCodeSnippet(data.codeSnippetData.code || '')
    });
    },[])

    const updateURLData = (details) => {
        if(details){
            setAssetUrl(details?.url || '')
            setBookmarkTitle(details?.title || '')
            setDescription(details?.description || '')
        }

        if(details && details.TagsData &&details.TagsData.length>0){
            let dd = []
            for(let i=0 ; i < 5;i++){
            let tag ={
                text:details?.TagsData[i]
            }
            const add = async () => {
                const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
                if(res.error === undefined){
                    const d = {
                    id: res.payload?.data?.data?.id,
                    tag: tag.text
                }
                dd.push(d)
                setSelectedTags([ ...selectedTags, ...dd])
                }
            }
            add()
            }
        }
    }

    const handleClosePanel = async() => {
        const tabs = await getActiveTabURL()
        window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_CODE_SNIPPET_PANEL" })
        chrome.storage.sync.set({'codeSnippetData': {
            code: '',
        }})
    }

    const onTagAdd = async (tag) => {
    const existingIdx = userTags?.findIndex((t) => { return t.tag === tag.text })
    if (existingIdx !== -1) {
      setSelectedTags([ ...selectedTags, { id: userTags[existingIdx].id, tag: userTags[existingIdx].tag }])
    }
    else {
      const res = await dispatch(addTag({ data: { tag: tag.text, users: session.userId }}))
      if (res.error === undefined && res.payload.error === undefined) {
        setSelectedTags([ ...selectedTags, { id: res.payload?.data?.data?.id, tag: tag.text } ])
      }
      return res;
    }
    
  }

  const onTagDelete = (i) => {
    selectedTags.splice(i, 1)
    setSelectedTags([ ...selectedTags ])
  }

const resetValues = () => {
    setBookmarkTitle('')
    setAssetUrl('')
    setDescription('')
    setSelectedTags([])
    setSelectedCollection('')
    setRemarks('')
    setSelectedType('Code')
    setLanguage('')
}

const submitHandler = async() => {
    setError(false)
    setAssetError(false)
    if (selectedCollection.id === undefined) {
      setError(true)
      return;
    }
    if(!assetUrl){
        setAssetError(true)
        return;
    }
    setLoading(true)

    const tabs = await getActiveTabURL()

    const payload = {
        title: bookmarkTitle,
        description: description,
        type: typeof selectedType === "object" ? selectedType?.name : selectedType,
        author: session.userId ? parseInt(session.userId) : null,
        url: (assetUrl && assetUrl.endsWith('/')) ? assetUrl?.slice(0, -1): assetUrl,
        tags: selectedTags.map((t) => { return {id: t.id, tag: t.tag} }),
        collections: selectedCollection.id,
        notes: remarks,
        code: codeSnippet,
        language: language,
        _id: uuidv4()
    }

    if(currentUrlGemId){
        const res1 = await dispatch(updateCodeToGem(payload.collections,currentUrlGemId,payload))
        if(res1.error === undefined){
            resetValues()
            window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_CODE_SNIPPET_PANEL" })
            chrome.storage.sync.set({'codeSnippetData': {
                code: '',
            }})
            setLoading(false)
        }else{
            resetValues()
            window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_CODE_SNIPPET_PANEL" })
            chrome.storage.sync.set({'codeSnippetData': {
                code: '',
            }})
            setLoading(false)
        }
    }else{
        const res = await dispatch(addCode(payload))

        if(res.error === undefined){
            resetValues()
            window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_CODE_SNIPPET_PANEL" })
            chrome.storage.sync.set({'codeSnippetData': {
                code: '',
            }})
            setLoading(false)
        }else{
            resetValues()
            window.chrome.tabs.sendMessage(tabs.id, { value: true, type: "CLOSE_CODE_SNIPPET_PANEL" })
            chrome.storage.sync.set({'codeSnippetData': {
                code: '',
            }})
            setLoading(false)
        }
    }

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
        <div className='h-full '>
            <div className='bookmark-bg h-full' 
                        onClick={() => { setShowCollectionInput(false); setShowTypeInput(false) }}
                    >
                        <div className="flex justify-between items-center px-4 py-3">
                            <div className="flex justify-start items-center cursor-pointer">
                                <span className="text-white text-sm ml-1">Save Code Snippet</span>
                            </div>
                            <div className='flex space-x-4 items-center justify-end'>
                                <div className='h-6 w-6 rounded-sm bg-[#C85C54] cursor-pointer'>
                                <XMarkIcon className="h-6 w-6 text-white p-1" onClick={handleClosePanel}/>
                                </div>
                            </div>
                        </div>
                        
                        <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-5' style={{height:'600px',overflow:'auto'}}>
                            <div className='grid grid-cols-8 gap-2'>
                                <div className='col-span-7' >
                                <Input size="medium w-full mb-2" type="text" name="link" placeholder="Asset url" 
                                loader={loader} 
                                chooseMessage={loader}
                                value={assetUrl} 
                                onChange={(e)=>setAssetUrl(e.target.value)}
                                />
                                {assetError && <span className='error-label'>Please Enter Valid URL</span>}
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
                                        <ComboBox inputShown={showCollectionInput} setShowCollectionInput={setShowCollectionInput} collectionData={collections || []} userId={session.userId} setSelectedCollection={setSelectedCollection} selectedCollection={selectedCollection} error={error}/> 
                                        
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
                                    <div className='bg-[#F8FBFF] p-4 rounded-t-[16px]'>
                                        <pre className="pre-tag-style" style={{height:'250px'}}>
                                        <code className="code-tag-style" style={{height:'250px'}}>
                                            {codeSnippet}
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
                                        delimiters={[KEY_CODES.enter, KEY_CODES.comma]}
                                        handleDelete={onTagDelete}
                                        handleAddition={onTagAdd}
                                        inputFieldPosition="bottom"
                                        placeholder="Enter Tag"
                                        onClearAll={() => setSelectedTags([])}
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

                        <div className='bg-white px-4 py-2 border-t-2 mb-10'>
                        <BookmarkFooter page="codeSnippetPanel"
                            submitHandler = {submitHandler} 
                            loading={loading}
                            />
                        </div>
            </div>
        </div>
    )
}

export default CodeSnippetPanel;