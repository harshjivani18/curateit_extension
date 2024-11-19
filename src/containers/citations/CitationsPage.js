import React, { useEffect, useState }                      from "react";
import { useNavigate }                          from "react-router-dom";
import { useSelector,
      useDispatch }                             from "react-redux";  
import { message,
         Input as AntInput,
         Spin,
         Select, 
         DatePicker}                               from "antd";

import OperationLayout                          from "../../components/layouts/OperationLayout";
import { copyText, panelClose }                           from "../../utils/message-operations";
import { MONTHNAMES, TEXT_MESSAGE }                           from "../../utils/constants";
import { CITATIONS }                            from "../../utils/citations";
import { fetchCurrentTab }                      from "../../utils/fetch-current-tab";
import session                                  from "../../utils/session";
import { removeDuplicates }                     from "../../utils/equalChecks";

import { addGem, updateGem }                    from "../../actions/gems";
import { addGemToSharedCollection, moveGemToSharedCollection, removeGemFromCollection, updateBookmarkWithExistingCollection } from "../../actions/collection";
import { getAllLevelCollectionPermissions, getBookmarkPermissions } from "../../utils/find-collection-id";
import { Validator } from "../../utils/validations";
import { AiOutlineUser } from "react-icons/ai";
import { LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import TextareaAutosize from "react-textarea-autosize";
import moment from "moment";

const { Option }        = Select;

const CitationsPage = (props) => {
    const dispatch                      = useDispatch()
    const navigate                      = useNavigate()
    
    const currentGem                    = useSelector((state) => state.gem.currentGem);
    const sharedCollections             = useSelector((state) => state.collection.sharedCollections)

    const [selectedCiatation,
            setSelectedCiatation]       = useState(currentGem ? currentGem?.media?.citation_format : 'Harvard')
    const [citationText, 
           setCitationText]             = useState(currentGem ? currentGem?.media?.citation : "")
    const [credibility,
           setCredibility]              = useState(currentGem ? currentGem?.media?.credibility : "")
    const [citationAuthor, 
           setCitationAuthor]           = useState(currentGem ? currentGem?.media?.citationAuthor : "")
    const [citationDate,
           setCitationDate]             = useState(currentGem ? currentGem?.media?.citationDate : "")
    const [processing, setProcessing]   = useState(false)
    const [fetching, setFetching]       = useState(false)
    const [showAssetUrlInput, setShowAssetUrlInput]     = useState(false)
    const [url, setUrl] = useState('');
    const [showUrlBox,setShowUrlBox]       = useState(false)

    const getCitationDataOnLoad = async (url) => {
            try {
            setSelectedCiatation('Harvard')
            setFetching(true)
            const today      = new Date()
            // const tab        = await fetchCurrentTab()
            const text = await window.chrome?.storage?.sync.get(["userData"]);
            const apiUrl = text?.userData?.apiUrl;
            const response = await fetch(`${apiUrl}/api/openai?isCitation=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "date": `${today.getDate()}`,
                    "month": `${MONTHNAMES[today.getMonth()]}`,
                    "year": `${today.getFullYear()}`,
                    "text": `Harvard`,
                    "url": `${url}`
                  }),
            });
            const result = await response.json();
            const parsedResult  = JSON.parse(result.message);
            setCitationText(parsedResult.citation)
            setCredibility(parsedResult.credibility)
            setCitationAuthor(parsedResult.author)
            setCitationDate(parsedResult.accessed_date)
            setFetching(false)
            }
            catch(err) {
                    message.error("Something went wrong")
            }
    }

    useEffect(() => {
        if(!currentGem){
             const getCall = async () => {
                const tab        = await fetchCurrentTab()
                getCitationDataOnLoad(tab.url)
            }
            getCall()
        }
    },[currentGem])

    const onCiataionCreate = async (obj) => {
        if (citationText === "") {
            message.error("Please enter citation text")
            return
        }
        if (credibility === "") {
            message.error("Please enter credibility")
            return
        }
        if (selectedCiatation === null) {
            message.error("Please select citation format")
            return
        }
        const mediaCovers  = currentGem?.metaData?.covers ? [ obj.imageUrl, ...currentGem?.metaData?.covers ] : obj.covers && obj.covers.length !== 0 ? obj.covers : [obj.imageUrl]
        const finalCovers  = removeDuplicates(mediaCovers)
        let finalObj = {
            title: obj.heading,
            description: obj.description,
            expander: obj.shortUrlObj,
            media_type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
            author: session.userId ? parseInt(session.userId) : null,
            url: obj.assetUrl,
            media: {
                covers: finalCovers,
                citation: citationText,
                credibility: credibility,
                citation_format: selectedCiatation,
                citationAuthor: citationAuthor,
                citationDate: citationDate
            },
            metaData: {
                type: typeof obj.selectedType === "object" ? obj.selectedType?.name : obj.selectedType,
                title: obj.heading,
                icon: obj?.favIconImage || '',
                defaultIcon: obj?.defaultFavIconImage || '',
                defaultThumbnail: obj?.defaultThumbnailImg || '',
                url: obj.assetUrl,
                docImages: obj.docImages,
                covers: finalCovers
            },
            collection_gems: obj.selectedCollection.id,
            remarks: obj.remarks,
            tags: obj.selectedTags?.map((t) => { return t.id }),
            is_favourite: obj.favorite,
            showThumbnail: obj?.showThumbnail
        }
        setProcessing(true)
        let isSingleBkShared = null
        let isSelectedCollectionShared = null
        let isCurrentCollectionShared = null
        if (currentGem) {
            isSingleBkShared = getBookmarkPermissions(sharedCollections,currentGem.id)
            isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
            isCurrentCollectionShared = getAllLevelCollectionPermissions(sharedCollections,currentGem?.collection_id || currentGem?.parent?.id)
            if(isSingleBkShared && !isSelectedCollectionShared){
                message.error(TEXT_MESSAGE.SHARED_COLLECTION_GEM_ERROR_TEXT)
                setProcessing(false)
                return;
            }
            const isCollectionChanged = currentGem?.parent.id !== obj.selectedCollection.id;
            const o = {
                ...finalObj,
                tags: obj.selectedTags
            }
            if (isCollectionChanged) {
                o["collection_id"] = obj.selectedCollection.id
                o["collection_gems"] = obj.selectedCollection
            }
            if(isSelectedCollectionShared){
                finalObj ={
                    ...finalObj,
                    author: isSelectedCollectionShared?.data?.author?.id
                }
                await dispatch(updateGem(currentGem?.id, { data: finalObj }))
                dispatch(removeGemFromCollection(currentGem.id || '', currentGem?.parent?.id || '',isCurrentCollectionShared))
                dispatch(moveGemToSharedCollection(obj.selectedCollection.id,currentGem.id,(currentGem) ? { ...currentGem, ...o } : finalObj))
                setProcessing(false)
                return navigate("/search-bookmark")
            }
            
            await dispatch(updateGem(currentGem?.id, { data: finalObj }))
            dispatch(updateBookmarkWithExistingCollection((currentGem) ? { ...currentGem, ...o } : finalObj, obj.selectedCollection, isCollectionChanged, "update", currentGem?.parent))
            setProcessing(false)
            return navigate("/search-bookmark")
        }

        isSelectedCollectionShared = getAllLevelCollectionPermissions(sharedCollections,obj.selectedCollection.id)
        if(isSelectedCollectionShared){
            finalObj ={
                ...finalObj,
                 author: isSelectedCollectionShared?.data?.author?.id
            }
        }

        const gemRes      = await dispatch(addGem({ data: finalObj }))
        if (gemRes.error === undefined && gemRes.payload.error === undefined) {
            const { data } = gemRes.payload
            if (data.data) {
                const d      = data.data;
                // const gTags  = d.tags.map((t) => { return { id: t.id, tag: t.tag }})
                const g      = {
                    id: d.id,
                    title: d.title,
                    media: d.media,
                    media_type: d.media_type,
                    url: d.url,
                    remarks: d.remarks,
                    metaData: d.metaData,
                    description: d.description,
                    S3_link: d.S3_link,
                    is_favourite: d.is_favourite,
                    collection_id: obj.selectedCollection.id,
                    tags: obj.selectedTags,
                    showThumbnail: d?.showThumbnail
                }
                if(isSelectedCollectionShared){
                    dispatch(addGemToSharedCollection(obj.selectedCollection.id,g))
                    setProcessing(false)
                    return navigate("/search-bookmark")
                }
                dispatch(updateBookmarkWithExistingCollection(g, obj.selectedCollection, false, "add", null))
            }
        }
        setProcessing(false)
        return navigate("/search-bookmark")
    }

    const onCiataionChange = async (value) => {
        try {
            setSelectedCiatation(value)
            setFetching(true)
            const today      = new Date()
            const tab        = await fetchCurrentTab()
            const text = await window.chrome?.storage?.sync.get(["userData"]);
            const apiUrl = text?.userData?.apiUrl;
            const response = await fetch(`${apiUrl}/api/openai?isCitation=true`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "date": `${today.getDate()}`,
                    "month": `${MONTHNAMES[today.getMonth()]}`,
                    "year": `${today.getFullYear()}`,
                    "text": `${value}`,
                    "url": `${tab.url}`
                  }),
            });
            const result = await response.json();
            const parsedResult  = JSON.parse(result.message);
            setCitationText(parsedResult.citation)
            setCredibility(parsedResult.credibility)
            setCitationAuthor(parsedResult.author)
            setCitationDate(parsedResult.accessed_date)
            setFetching(false)
        }
        catch(err) {
            message.error("Something went wrong")
        }
    }

    const handleChangeAssetUrl = (e) => {
    const {value} = e.target;
    setUrl(value)
  };

  const onKeyDownUrl = async(event) => {
    if (event.key === "Enter") {
      if (!url) return;
      if(Validator.validate('url',url,true)){
      message.error(Validator.validate('url',url,true))
      setCodeReset()
      return;
    }
    getCitationDataOnLoad(url)
    setShowAssetUrlInput(false)
    }

  };

  const onAssetURLBlur = async () => {
    if (!url) return;
    if(Validator.validate('url',url,true)){
      message.error(Validator.validate('url',url,true))
      setCodeReset()
      return;
    }
    getCitationDataOnLoad(url)
    setShowAssetUrlInput(false)
  }

    const setCodeReset = () => {
        setShowUrlBox(true)
        setCitationAuthor('')
        setCitationDate('')
        setCitationText('')
        setCredibility('')
        setSelectedCiatation('Harvard')
    }

    const handleRefreshData = async() => {
        const tab        = await fetchCurrentTab()
        getCitationDataOnLoad(tab.url)
        setShowUrlBox(false)
    }

    const onCopyCode = () => {
        if (citationText) {
            try {
                copyText(citationText)
                message.success("Citation text is copied to clipboard")
            }
            catch (err) {
                message.error("An error occured while copyinh this code", "error")
            }
        }
    }

    return (
        <OperationLayout currentGem={currentGem}
                        processing={processing}
                        onButtonClick={onCiataionCreate}
                        pageTitle={currentGem ? "Update citation" : "Add new citation"}
                        isHideBackButton={false}
                        isHideHeader={props.isHideHeader || false}
                        mediaType={"Citation"}
                        onPanelClose={panelClose}
                        setResetData = {setCodeReset}
                        getRefreshData={handleRefreshData}
                        citationText={citationText}
                        onTextCopy={onCopyCode}
                        >
            {/* <div className="pt-4">
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Citation style</h6>
                <Select value={selectedCiatation} onChange={onCiataionChange} placeholder="Select citation" 
                        showSearch={true}
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                        filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
                        }
                        options={CITATIONS.map((c) => { return { value: c, label: c } })}
                        className={"w-full"}>
                    {CITATIONS.map((c) => {
                        return <Option key={c} value={c}>{c}</Option>
                    })}
                </Select>
            </div>
            {fetching && 
                <div className="pt-4">
                    <Spin tip="Fetching citation" />
                </div>
            }
            {!fetching && <div className="pt-4">
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Citation</h6>
                <Input.TextArea value={citationText} 
                                onChange={(e) => setCitationText(e.target.value)} 
                                placeholder="Enter citation text" 
                                rows={6}
                                />
            </div>}
            {!fetching && <div className="pt-4">
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Author</h6>
                <Input value={citationAuthor}
                        onChange={(e) => setCitationAuthor(e.target.value)} 
                        placeholder="Enter citation author" />
            </div>}
            {!fetching && <div className="pt-4">
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Accessed Date</h6>
                <Input value={citationDate} onChange={(e) => setCitationDate(e.target.value)} className="w-full" placeholder="Enter Accessed Date" />
            </div>}
            {!fetching && <div className="pt-4">
                <h6 className="block text-xs font-medium text-gray-500 mb-1">Credibility</h6>
                <Select
                onChange={(value) => setCredibility(value)}
                value={credibility}
                className={"w-full"}
                placeholder="Select credibility"
                >
                    <Option value={'low'}>Low</Option>
                    <Option value={'high'}>High</Option>
                    <Option value={'medium'}>Medium</Option>
                </Select>
            </div>} */}


            {fetching && 
                <div className="pt-4 flex w-full items-center justify-center">
                    <Spin tip="Fetching citation" />
                </div>
        }

        {
        !fetching &&
        <>
        {
        !showUrlBox ? 
        <>
          <div className="">
          <Select
                value={selectedCiatation}
                onChange={onCiataionChange}
                placeholder="Select citation"
                showSearch={true}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label.toLowerCase() ?? "").includes(
                    input.toLowerCase()
                  )
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                options={CITATIONS.map((c) => {
                  return { value: c, label: c };
                })}
                className={"w-full border border-solid border-[#d9d9d9] my-2"}
              >
                {CITATIONS.map((c) => {
                  return (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  );
                })}
          </Select>
          <div className="ct-relative">
            <TextareaAutosize
            value={citationText}
            onChange={(e) => setCitationText(e.target.value)}
            placeholder="Enter citation text"
            minRows={4}
            className="w-full rounded-md resize-none !outline-none !focus:outline-none textarea-border h-auto"
          />
          </div>
          </div>

         <div className="my-2">
                <AntInput
                value={citationAuthor}
                onChange={(e) => setCitationAuthor(e.target.value)}
                placeholder="Enter citation author"
                className="rounded-md"
                size="medium"
                prefix={<AiOutlineUser className="h-5 w-5 text-[#4B4F5D]"/>}
              />
              </div>

              <div className="w-full flex items-center justify-between">
                  <div className="w-full flex items-center justify-between mt-2 bookStatus">
                    <DatePicker
                      value={
                        !citationDate ? citationDate : moment(citationDate)
                      }
                      onChange={(date, dateStirng) => setCitationDate(dateStirng)}
                      format={"YYYY-MM-DD"}
                      // allowClear={false}
                      showToday={false}
                      className="rounded-full border border-solid border-[#97A0B5] w-fit "
                    />
                  </div>
                
                <div className="bookStatus">
                <Select
                  onChange={(value) => setCredibility(value)}
                  value={credibility}
                  className={"w-full"}
                  placeholder="Select credibility"
                >
                  <Option value={"low"}>Low</Option>
                  <Option value={"high"}>High</Option>
                  <Option value={"medium"}>Medium</Option>
                </Select>
                </div>
              </div>
        </> 
        :
        <>
            <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex flex-col">
                    <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(true)
                    }}
                    >
                      <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                </div> 
                :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={url}
                    onChange={handleChangeAssetUrl}
                    onBlur={onAssetURLBlur}
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                    e.stopPropagation()
                    setShowAssetUrlInput(false)
                  }}/>}
                  onKeyDown={onKeyDownUrl}
                  />
                </div>
                }
            </div>
        </>
        }
        </>
        }

        </OperationLayout>
    )
}

export default CitationsPage