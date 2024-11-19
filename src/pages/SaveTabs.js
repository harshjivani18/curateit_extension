/*global chrome*/
import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { importGemsReset } from '../actions/gem'
import { importGems } from '../actions/gem'
import BookmarkFooter from '../components/bookmarkFooter/BookmarkFooter'
import CheckBox from '../components/checkbox/CheckBox'
import TypeComboBox from '../components/combobox/TypeComboBox'
import Header from "../components/header/Header"
import Loadingscreen from '../components/Loadingscreen/Loadingscreen'
import SmallMenu from '../components/SmallMenu/SmallMenu'
import TabDetails from '../components/tabDetails/TabDetails'
import { addTag } from '../actions/tags'
import { WithContext as ReactTags } from 'react-tag-input';
import {message} from 'antd';
import { KEY_CODES } from '../utils/constants'
import session from '../utils/session'
import { addImportedCollection } from '../actions/collection'
import { checkBookmarkExists } from '../utils/find-collection-id'
import Input from '../components/input/Input'

const SaveTabs = () => {
    const [tabs, setTabs] = useState();
    const [selectedTags, setSelectedTags] = useState([])
    const [close, setClose] = useState(false)
    const [showTypeInput, setShowTypeInput] = useState(false)
    const [selectedType, setSelectedType] = useState(false)
    const [remarks, setRemarks] = useState('')
    const [allStarredStatus, setAllStarredStatus] = useState(false)
    const [loading, setLoading] = useState(false)
    const [check,setCheck] = useState(false)
    const [collectionCheck,setCollectionCheck] = useState('')
    const [selectedCollections,setSelectedCollections] = useState({id:Number(session.unfiltered_collection_id),name:"Unfiltered"})
    const [bookmarkExist,setBookmarkExist] = useState([])
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const userData = useSelector((state) =>  state.user.userData)
    const importedGemData = useSelector((state) =>  state.gem.importedGemData)
    const userTags = useSelector((state) => state.user.userTags)
    const collections       = useSelector((state) => state.collection.collectionData);
    const [error, setError] = useState(false)
    const [messageApi, contextHolder] = message.useMessage();
    //Fetching all tabs
    useEffect(()=>{
        localStorage.setItem("show_spinner", true)
        setAllStarredStatus(false) 
        chrome.tabs && chrome.tabs.query({ currentWindow: true }, tabs => {
            setTabs(tabs.map(tab => ({ ...tab, starred: true })));
        });
        const todayDate = new Date().toLocaleDateString("en-US", {hour:'numeric', minute:'numeric'})
        dispatch(addTag({ data: { tag: todayDate, users: session.userId }})).then((res) => {
            if (res.error === undefined && res.payload.error === undefined) {
                setSelectedTags([ ...selectedTags, { id: res.payload?.data?.data?.id, tag: todayDate } ])
            }
        })
    },[check])

    //Closing tabs and redirecting
    // useEffect(()=>{
    //     if(importedGemData){
    //         if(close){
    //             for (var i = 0; i < tabs.length; i++) {
    //                         if(tabs[i].starred){
    //                         chrome.tabs.remove(tabs[i].chromeId);
    //                         }
    //                 }
    //         }
    //         dispatch(importGemsReset())
    //         setLoading(false)
    //         navigate('/search-bookmark')
    //     }
    // },[importedGemData])

    //all starred status
    useEffect(()=>{
        if(tabs?.every(t => t.starred)){
            setAllStarredStatus(true)
        }
    },[tabs])

    //Change all starred status
    const allStarredHandler = () => {
        setTabs(prev => prev.map(tab =>({...tab, starred: !allStarredStatus})))
        setAllStarredStatus(prev=>!prev)
    }

    //Change all starred statusof drop down
    const allStarredDropDownHandler = (value) => {
        setTabs(prev => prev.map(tab =>({...tab, starred: value})))
        setAllStarredStatus(value)
    }

    // Save tabs
    const dataArr = []
    const saveTabsHandler = async() => {
        let collectionObj = null
        setCheck(null)
        const tArr        = [ ...tabs.map((t) => { return { starred: t.starred, chromeId: t.id, t:t }}) ]
        for (let i = 0; i < tabs.length; i++) {
            const element = tabs[i];
            if (tabs[i]?.collection_data === undefined) {
                errorss()
                return;
            }
            if (element) {
                collectionObj = element.collection_data
                delete element.id
                delete element.active
                delete element.audible
                delete element.autoDiscardable
                delete element.discarded
                delete element.groupId
                delete element.groupId
                delete element.height
                delete element.highlighted
                delete element.incognito
                delete element.index
                delete element.mutedInfo
                delete element.pinned
                delete element.selected
                delete element.status
                delete element.width
                delete element.windowId
                delete element.collection_data
                delete element.chromeId
                delete element.type
                let allTabData = {
                    ...element,
                    author: userData.id,
                    media_type: selectedType?.name,
                    type: selectedType?.name,
                    metaData: {
                        icon:element.favIconUrl,
                        title: element.title,
                        url: element.url,
                        type: selectedType?.name,
                    },
                    media: {
                        covers: [element.favIconUrl]
                    },
                    icon: element.favIconUrl,
                    tags: selectedTags,
                    remarks: remarks,
                    is_favourite: element.starred,
                    title: element.title
                }
                dataArr.push(allTabData)
            }

        }

        if (dataArr.length > 0) {
           let result = tArr.filter(({ starred }) => starred)
           let isBookMarkExist = false
           const come = []
           for (let i = 0; i < result.length; i++) {            
            if (checkBookmarkExists(collectionCheck, result[i].t.url)) {
                isBookMarkExist = true
                come.push(i)
                
                // return
              }
            //   return
           }
           setBookmarkExist(come)
            if (isBookMarkExist === false){
            setLoading(true)
            const res = await dispatch(importGems({ data: dataArr.filter(tab => tab.is_favourite) }))
            setLoading(false)
            if (res.error !== undefined || res.payload.error !== undefined) {
                messageApi.open({
                    type: 'error',
                    content: 'An error occured while adding tabs!',
                });
            }
            else if (res.error === undefined && res.payload.error === undefined && collectionObj && isBookMarkExist === false) {
                dispatch(addImportedCollection(res.payload.data, collectionObj))
                if (close) {
                    for (let i = 0; i < tArr.length; i++) {
                        if(tArr[i].starred){
                            chrome.tabs.remove(tArr[i].chromeId);
                        }
                    }
                }
                dispatch(importGemsReset())
                navigate('/search-bookmark')
            }}
        }

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
        }
    }

    const onTagDelete = (i) => {
        selectedTags.splice(i, 1)
        setSelectedTags([ ...selectedTags ])
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
    
    if (!userData) {
        return <Loadingscreen showSpin={!userData} />
    }
    const errorss = () => {
        messageApi.open({
            type: 'error',
            content: 'Please select a collection',
        });
        setError(false)
    };
    const getCollection = (data) => {
        setCollectionCheck(data)
    }

    const handleReader = () => {
    // 
  }

    return (
        <>
        {contextHolder}
        <div className='save-tab-container ct-relative overflow-y-auto scroll-smooth'>
            <Header label="Save Tabs"/>
            <div className='bg-[#F8FBFF] p-4 rounded-t-[16px] pb-16'>

                <div>
                    <h6 className='text-xs text-gray-500'>Tabs</h6>
                    <div className='mt-3'>
                        <div className='grid grid-cols-11 gap-2'>
                            <div className='col-span-2 flex justify-start items-center'>
                                <CheckBox hideLabel={true} name="tab" darkColor={true} value={allStarredStatus} onChange={allStarredHandler}/>
                                <SmallMenu setAllStarredStatus = {allStarredDropDownHandler}/>
                            </div>
                            <div className='col-span-8 text-xs text-gray-500 flex justify-end items-center'>
                                <span>Collection</span>
                            </div>
                            <div className='text-xs text-gray-500 flex justify-center items-center'>
                                <span>Favs</span>
                            </div>
                        </div>
                        {tabs && tabs?.map((tab, i) => (
                                <>
                            <TabDetails  collectionData={collections || []} tab={tab} index={i} 
                                         userData={userData} 
                                         tabs={tabs} 
                                         setTabs={setTabs} 
                                         userId = {userData.id} 
                                         allStarred={allStarredStatus} 
                                         setAllStarredStatus={setAllStarredStatus} 
                                         getCollection = {getCollection}
                                         selectedCollections={selectedCollections}
                                         setSelectedCollections={setSelectedCollections}
                                         all={selectedCollections}
                             />
                             {
                                bookmarkExist.filter((index)=>(index === i)).length !== 0 ?<span className='bookmarkexist'>Bookmark already exist!</span>:null
                             }
                             </>
))}
                    </div>
                    <div className='mt-3'>
                        <h6 className='text-xs text-gray-500'>Tags</h6>
                        <div className='w-full bg-white rounded-lg border-2 p-2 mt-2'>
                            <ReactTags tags={selectedTags.map((t) => { return { id: t.tag, text: t.tag }})}
                                    suggestions={prepareTags()}
                                    delimiters={[KEY_CODES.comma, KEY_CODES.enter]}
                                    handleDelete={onTagDelete}
                                    handleAddition={onTagAdd}
                                    inputFieldPosition="bottom"
                                    placeholder="Enter Tag"
                                    onClearAll={() => setSelectedTags([])}
                                    clearAll
                                    // autocomplete
                                    // classNames={{tagInputField: 'tagInputFieldClass'}}
                            />
                            {/* <Tags setSelectedTags = {setSelectedTags} tagsList={userData.tags} userId = {userData.id} dateTag={true}/> */}
                        </div>
                    </div>
                    <div className='mt-3'>
                        <CheckBox label="Close tabs" name="closetab"  darkColor={true} onChange={()=>setClose(prev => !prev) } />
                    </div>
                    <div className='mt-4'>
                        <h6 className='text-xs text-gray-500 mb-1'>Type</h6>
                        <TypeComboBox setShowTypeInput={setShowTypeInput} setSelectedType = {setSelectedType}/>
                    </div>
                    <div className='mt-4'>
                        <h6 className='text-xs text-gray-500 mb-1'>Comment</h6>
                        <textarea placeholder='Add your comments' onChange={(e) => setRemarks(e.target.value)} className='w-full text-sm p-2 border-2 rounded-md h-14 resize-none'></textarea>
                    </div>
                </div>
            </div>
            <div className='border-t-[1px] py-3 px-4 bg-white z-50 fixed w-full bottom-0'>
                <BookmarkFooter page="save-tabs" hideSync={true} numberOfTabs={tabs?.filter(tab=>tab.starred)?.length} submitHandler={saveTabsHandler} loading={loading} handleReader={handleReader}/>
            </div>
        </div>
        </>

    )
}

export default SaveTabs