import { MicrophoneIcon } from "@heroicons/react/20/solid";
import { ArrowTopRightOnSquareIcon, ArrowUpTrayIcon, CheckIcon, CommandLineIcon, DocumentTextIcon, GlobeAltIcon, HeartIcon, LinkIcon, LockClosedIcon, MagnifyingGlassIcon, PhotoIcon, PlayCircleIcon, SpeakerWaveIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PLATFORMS_ICON, getColorForProfilePlatform, getDomainFromURLForBookBookmark, getDomainFromURLForBookmark } from "../../../utils/constants";
import { PiPencilSimple, PiUploadSimpleLight } from "react-icons/pi";
import { BsLightningCharge } from "react-icons/bs";
import { Dropdown ,Input as AntInput, Spin} from "antd";
import { useRef } from "react";
import TranslatorComponent from "../../audioTranscript/TranslatorComponent";
import { RiScreenshot2Line } from "react-icons/ri";

const MediaTypeUI = (props) => {

    const {setFavorite,favorite,assetUrl,showAssetUrlInput,setShowAssetUrlInput,setShowShortEndInput,onOpenImageDialog,showShortEndInput,setIsReaded,isReaded,selectedType,shortendurl,setShortendurl,onKeyDownUrl,onAssetURLBlur,handleChangeAssetUrl,onKeyDownShortUrl,imageUrl,handlefileTypeChange,onFileChange,fileType,imageSrc,pdfSrc,setReadStatus,readStatus,showBookSearchInput,setShowBookSearchInput,onSearchTerm,searchBooks,onClickBook,setSearchBooks,loadingBookMovie,l, showMovieSearchInput,setShowMovieSearchInput,searchMovies,onClickMovie, watchStatus, setWatchStatus,currentGem,html,title,onScreenshotClick,handleClearFields} = props;

    const fileRef = useRef();

    const articleStatusItems = [
  {
    label: <div onClick={e => {
      e.stopPropagation()
      setIsReaded('read')
    }} className="text-[#00D863]">Read</div>,
    key: '0',
  },
   {
    label: <div onClick={e => {
      e.stopPropagation()
      setIsReaded('to Read')
    }} className="text-[#348EE2]">To Read</div>,
    key: '1',
  },
  ]

  const bookStatusItems = [
  {
    label: <div onClick={e => {
      e.stopPropagation()
      setReadStatus('read')
    }} className="text-[#00D863]">Read</div>,
    key: '0',
  },
  {
    label: <div onClick={e => {
      e.stopPropagation()
      setReadStatus('reading')
    }} className="text-[#EEAF0D]">Reading</div>,
    key: '1',
  },
  {
    label: <div onClick={e => {
      e.stopPropagation()
      setReadStatus('to-read')
    }} className="text-[#348EE2]">To Read</div>,
    key: '2',
  },
  ]

  const movieStatusItems = [
  {
    label: <div onClick={e => {
      e.stopPropagation()
      setWatchStatus('watched')
    }} className="text-[#00D863]">Watched</div>,
    key: '0',
  },
  {
    label: <div onClick={e => {
      e.stopPropagation()
      setWatchStatus('watching')
    }} className="text-[#EEAF0D]">Watching</div>,
    key: '1',
  },
  {
    label: <div onClick={e => {
      e.stopPropagation()
      setWatchStatus('to-watch')
    }} className="text-[#348EE2]">To Watch</div>,
    key: '2',
  },
  ]

  const renderBookList = (item) => {
    const bookInfoArr = [];
    if (item?.volumeInfo?.publisher) {
      bookInfoArr.push(item?.volumeInfo?.publisher);
    }

    if (item?.volumeInfo?.publishedDate) {
      const year = item?.volumeInfo?.publishedDate.split('-')[0]
      bookInfoArr.push(year);
    }

    if (item?.volumeInfo?.pageCount && Number(item?.volumeInfo?.pageCount) > 0) {
      let pages = item?.volumeInfo?.pageCount + ' pages'
      bookInfoArr.push(pages);
    }

    let formatedBookInfo = "";
    if (bookInfoArr.length > 0) {
      formatedBookInfo = bookInfoArr.join(' . ');
    }
    return (
      <div className="grid grid-cols-5 p-2 border-b-[1px] gap-1 cursor-pointer hover:bg-gray-100" key={item.id} onClick={(e) => onClickBook(e, item.id)}>
        <div className="p-[5px] flex justify-center items-center">
          {item?.volumeInfo?.imageLinks?.thumbnail &&
            <img className="object-contain" src={item?.volumeInfo?.imageLinks?.thumbnail} alt={item?.volumeInfo?.title || "no alt"} />
          }
        </div>
        <div className="col-span-4">
          {item.volumeInfo.title && <h5 className="font-semibold">{item.volumeInfo.title.length > 30 ? `${item.volumeInfo.title.substring(0, 30)}...` : item.volumeInfo.title}</h5>}
          {item.volumeInfo.authors && Array.isArray(item.volumeInfo.authors) && item.volumeInfo.authors.length > 0 && (
            <h6 className="text-gray-700 text-xs">{item.volumeInfo.authors.join(', ')}</h6>
          )}
          {formatedBookInfo && <div className="text-gray-700 text-xs">{formatedBookInfo}</div>}
          {item.volumeInfo.industryIdentifiers &&
            Array.isArray(item.volumeInfo.industryIdentifiers) &&
            item.volumeInfo.industryIdentifiers.length > 0 && (
              <h6 className="text-gray-700 text-xs">ISBN: {item?.volumeInfo?.industryIdentifiers[0]?.identifier}</h6>
            )}
        </div>
      </div>
    )
  }

  const onUploadFileClick = () => {
      if (fileRef) {
        fileRef.current.click();
      }
    };

  const renderFileUpload = () => {
    if (selectedType?.name === "PDF") {
      return (
        <>
          <input
            type={"file"}
            className={"hidden"}
            onChange={onFileChange}
            ref={fileRef}
            accept="application/pdf"
          />
        </>
      );
    }
    if (selectedType?.name === "Audio") {
      return (
        <>
          <input
            type={"file"}
            className={"hidden"}
            onChange={onFileChange}
            ref={fileRef}
            accept="audio/*"
          />
        </>
      );
    }
    if (selectedType?.name === "Video") {
      return (
        <>
          <input
            type={"file"}
            className={"hidden"}
            onChange={onFileChange}
            ref={fileRef}
            accept="video/*"
          />
        </>
      );
    }
    if (selectedType?.name === "Image") {
      return (
        <>
          <input
            type={"file"}
            className={"hidden"}
            onChange={onFileChange}
            ref={fileRef}
            accept="image/*"
          />
        </>
      );
    }
  };

    return(
        <>
        {
        (selectedType?.name === 'Link' || selectedType?.name === 'Article' || selectedType?.name === 'App' || selectedType?.name === 'Product') &&
        <>
        {
        (imageUrl || currentGem || title) ? <div className="ct-relative">
                {props.children}

                {selectedType?.name === 'Article' && 
                <div className="absolute top-0 right-0 pt-2">
                  <Dropdown
                    menu={{
                      items:articleStatusItems,
                    }}
                    trigger={['click']}
                  >
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="max-content" height="22" viewBox="0 0 102 30" fill="none">
                        <path d="M100 29.8C100.994 29.8 101.8 28.9941 101.8 28V2C101.8 1.00589 100.994 0.200001 100 0.200001L2.81549 0.200001C1.21352 0.200001 0.409668 2.13545 1.54029 3.27037L12.0253 13.7953C12.8961 14.6694 12.8779 16.0886 11.985 16.9401L1.75311 26.6974C0.577606 27.8183 1.37101 29.8 2.99532 29.8L100 29.8Z" fill={isReaded === 'read' ? '#00D863'  : `#348EE2`} stroke="white" stroke-width="0.4"/>
                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial, sans-serif" cursor={'pointer'}>
                            {isReaded && isReaded.charAt(0).toUpperCase() + isReaded.slice(1)}
                        </text>
                    </svg>
                    </div>
                  </Dropdown>
                    
                </div>
                }

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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

                {
                showShortEndInput &&
                <div className="absolute bottom-[50%] w-full items-center px-2 aiInput aiInput">
                  <AntInput  
                    addonBefore={"c:"}
                    className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                      e.stopPropagation()
                      setShowShortEndInput(false)
                    }}/>}
                    name="shortendurl"
                    placeholder={selectedType?.name === "Text Expander" ? "Enter expander name" : selectedType?.name === "Ai Prompt" ? "Enter prompt name" : "Enter Shortend URL"}
                    value={shortendurl}
                    onChange={(e) => setShortendurl(e.target.value)}
                    onKeyDown={onKeyDownShortUrl}
                  />
                </div>
                }

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookmark(assetUrl)}</div>
                    </div>

                    {!currentGem && <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                      setShowShortEndInput(false)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>}

                    <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showShortEndInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                        e.stopPropagation()
                        setShowShortEndInput(!showShortEndInput)
                        setShowAssetUrlInput(false)
                      }}>
                      <BsLightningCharge className="text-[#74778B] h-4 w-4 aspect-square" />
                    </div>

                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

            </div>:

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
                </div> :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
        }
        </>
        }

        {
        selectedType?.name === 'Video' &&
        <>
        {
        (fileType === 'url' && imageUrl) ? 
        <div className="ct-relative">
                {props.children}
                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookmark(assetUrl)}</div>
                    </div>

                    {!currentGem && <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                      setShowShortEndInput(false)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>}
                    
                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>
        </div>
        :
        (fileType === 'file') ?
        <div className="ct-relative">
                {props.children}
        </div>
        :
        <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
            {
                !showAssetUrlInput ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        handlefileTypeChange('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" 
                    onClick={() => {
                        onUploadFileClick()
                    }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
        }
        </>
        }

        {
        selectedType?.name === 'Audio' &&
        <>
        {
        (fileType === 'url' && imageUrl) ? 
        <div className="ct-relative">
                {props.children}

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookmark(assetUrl)}</div>
                    </div>

                    {!currentGem && <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                      setShowShortEndInput(false)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>}

                    {/* <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div> */}

                  </div>

                </div>

        </div>
        :
        (fileType === 'file') ?
        <div className="ct-relative">
          {props.children}
        </div>
        :
        (fileType === 'record') ?
        <div className="ct-relative">
          {props.children}
        </div>
        :
        <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        handlefileTypeChange('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
                        // handlefileTypeChange('file')
                        onUploadFileClick()
                      }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>

                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
                        handlefileTypeChange('record')
                      }}
                      >
                        <MicrophoneIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Record</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
        }
        </>
        }

        {
        (selectedType?.name === 'Image' || selectedType === 'Image') &&
        <>
        {
        (imageSrc || imageUrl || title) ? 
        <div className="ct-relative">
                {props.children}

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookmark(assetUrl)}</div>
                    </div>

                    {!currentGem && <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                      setShowShortEndInput(false)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>}

                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

        </div>
        :
        <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        handlefileTypeChange('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
                        onUploadFileClick()
                        // handlefileTypeChange('file')
                      }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>

                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleClearFields()
                        onScreenshotClick()
                      }}
                      >
                        <RiScreenshot2Line className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">Screenshot</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
        }
        </>
        }


        {
        selectedType?.name === 'PDF' &&
        <>
        {
        ((fileType === 'file' && pdfSrc) || (fileType === 'url' && pdfSrc)) ?
        <div>{props.children}</div>
        :
        <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${showAssetUrlInput ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                !showAssetUrlInput ?
                <div className="flex items-center justify-center my-3 max-w-full w-[156px] gap-5">
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAssetUrlInput(true)
                        handlefileTypeChange('url')
                      }}
                      >
                        <LinkIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 text-center">URL</div>
                  </div>

                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={() => {
                        onUploadFileClick()
                      }}
                      >
                        {renderFileUpload()}
                        <ArrowUpTrayIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Upload</div>
                  </div>
                </div>
                 :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
        }
        </>
        }

        {
        selectedType?.name === 'Note' &&
        <>
        <div>
          {props.children}
        </div>
        </>
        }

        {
        selectedType?.name === 'Profile' &&
        <>
        {
        (imageUrl || title) ? <div className="ct-relative">
                {props.children}

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2 z-10">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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

                {
                showShortEndInput &&
                <div className="absolute bottom-[50%] w-full items-center px-2 z-10">
                  <AntInput  addonBefore={"c:"} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                      e.stopPropagation()
                      setShowShortEndInput(false)
                    }}/>}
                    name="shortendurl"
                    placeholder={selectedType?.name === "Text Expander" ? "Enter expander name" : selectedType?.name === "Ai Prompt" ? "Enter prompt name" : "Enter Shortend URL"}
                    value={shortendurl}
                    onChange={(e) => setShortendurl(e.target.value)}
                    onKeyDown={onKeyDownShortUrl}
                  />
                </div>
                }

                <div className="z-10 px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookmark(assetUrl)}</div>
                    </div>

                    {!currentGem && <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                      setShowShortEndInput(false)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>}

                    <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showShortEndInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                        e.stopPropagation()
                        setShowShortEndInput(!showShortEndInput)
                        setShowAssetUrlInput(false)
                      }}>
                      <BsLightningCharge className="text-[#74778B] h-4 w-4 aspect-square" />
                    </div>

                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

            </div>:

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
                </div> :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
        }
        </>
        }
        

        {
        selectedType?.name === "Book" &&
        <>
        {
        (imageUrl || title) ? <div className="ct-relative">
                {props.children}

                <div className="absolute top-0 right-0 pt-2">
                  <Dropdown
                    menu={{
                      items:bookStatusItems,
                    }}
                    trigger={['click']}
                  >
                    
                    <div >
                      <svg xmlns="http://www.w3.org/2000/svg" width="max-content" height="22" viewBox="0 0 102 30" fill="none">
                        <path d="M100 29.8C100.994 29.8 101.8 28.9941 101.8 28V2C101.8 1.00589 100.994 0.200001 100 0.200001L2.81549 0.200001C1.21352 0.200001 0.409668 2.13545 1.54029 3.27037L12.0253 13.7953C12.8961 14.6694 12.8779 16.0886 11.985 16.9401L1.75311 26.6974C0.577606 27.8183 1.37101 29.8 2.99532 29.8L100 29.8Z" fill={readStatus === 'to-read' ? '#348EE2' : readStatus === 'read' ? '#00D863' : `#EEAF0D`} stroke="white" stroke-width="0.4"/>
                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial, sans-serif" cursor={'pointer'}>
                            {readStatus && readStatus.charAt(0).toUpperCase() + readStatus.slice(1)}
                        </text>
                    </svg>
                    </div>
                  </Dropdown>
                    
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookBookmark(assetUrl)}</div>
                    </div>
                    
                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

            </div>:

            <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${(showAssetUrlInput || showBookSearchInput) ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                (!showAssetUrlInput && !showBookSearchInput) ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
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
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        setShowBookSearchInput(true)
                      }}
                      >
                        <MagnifyingGlassIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Search</div>
                  </div>
                </div> :
                showAssetUrlInput ?
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
                </div> :
                <div className="flex items-center w-full flex-col">
                  <AntInput prefix={<MagnifyingGlassIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                      e.stopPropagation()
                      setShowBookSearchInput(false)
                      setSearchBooks([])
                    }}/>}
                    name="search"
                    placeholder={"Search Book" }
                    onChange={onSearchTerm}
                  />
                  {loadingBookMovie &&<div className="w-full bg-white z-50">
                        <div className="flex justify-center items-center py-4">
                          <Spin />
                        </div>
                    </div>}
                  {searchBooks &&  searchBooks?.items?.length>0 &&(
                    <div className="h-[400px] overflow-y-auto mb-2 w-full bg-white z-50">
                      {searchBooks?.items?.map((item) => (
                        renderBookList(item)
                      ))}
                    </div>
                  )}
                </div>
                }
            </div>
        }
        </>
        }

        {
        selectedType?.name === "Movie" &&
        <>
        {
        (imageUrl || title) ? <div className="ct-relative">
                {props.children}

                <div className="absolute top-0 right-0 pt-2">
                  <Dropdown
                    menu={{
                      items:movieStatusItems,
                    }}
                    trigger={['click']}
                  >
                    
                    <div >
                      <svg xmlns="http://www.w3.org/2000/svg" width="max-content" height="22" viewBox="0 0 102 30" fill="none">
                        <path d="M100 29.8C100.994 29.8 101.8 28.9941 101.8 28V2C101.8 1.00589 100.994 0.200001 100 0.200001L2.81549 0.200001C1.21352 0.200001 0.409668 2.13545 1.54029 3.27037L12.0253 13.7953C12.8961 14.6694 12.8779 16.0886 11.985 16.9401L1.75311 26.6974C0.577606 27.8183 1.37101 29.8 2.99532 29.8L100 29.8Z" fill={watchStatus === 'to-watch' ? '#348EE2' : watchStatus === 'watched' ? '#00D863' : `#EEAF0D`} stroke="white" stroke-width="0.4"/>
                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial, sans-serif" cursor={'pointer'}>
                            {watchStatus && watchStatus.charAt(0).toUpperCase() + watchStatus.slice(1)}
                        </text>
                    </svg>
                    </div>
                  </Dropdown>
                    
                </div>

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookBookmark(assetUrl)}</div>
                    </div>
                    
                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

            </div>:

            <div className={`flex justify-center items-center py-12 w-full bg-sky-100 rounded-lg  ${(showAssetUrlInput || showMovieSearchInput) ? 'px-2' : 'max-md:px-5 px-16' }`} 
              >
                {
                (!showAssetUrlInput && !showMovieSearchInput) ?
                <div className="flex gap-5 justify-between my-3 max-w-full w-[156px]">
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
                  <div className="flex flex-col">
                      <div className="flex justify-center items-center px-2 w-11 h-11 bg-white rounded-lg shadow-md aspect-square cursor-pointer" onClick={(e) => {
                        e.stopPropagation()
                        setShowMovieSearchInput(true)
                      }}
                      >
                        <MagnifyingGlassIcon className="text-[#74778B] h-6 w-6 aspect-square"/>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">Search</div>
                  </div>
                </div> :
                showAssetUrlInput ?
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
                </div> :
                <div className="flex items-center w-full flex-col">
                  <AntInput prefix={<MagnifyingGlassIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    style={{background:'white'}}
                    suffix={<XMarkIcon className="text-[#74778B] h-5 w-5 ml-1 aspect-square cursor-pointer" 
                    onClick={e => {
                      e.stopPropagation()
                      setShowMovieSearchInput(false)
                      setSearchBooks([])
                    }}/>}
                    name="search"
                    placeholder={"Search Movie" }
                    onChange={onSearchTerm}
                  />
                  {loadingBookMovie &&<div className="w-full bg-white z-50">
                        <div className="flex justify-center items-center py-4">
                          <Spin />
                        </div>
                    </div>}
                  {searchMovies && searchMovies?.length>0 &&
                  <div className="h-[400px] overflow-y-auto mb-2 w-full bg-white z-50">
                    {searchMovies?.map((item) => (
                    <div>
                    <p style={{ background: 'white', border: '1px solid grey' }}
                        value={item.id}
                        onClick={(e) => onClickMovie(e, item.id)}>{item.title}</p>
                    </div>
                    ))}
                  </div>
                  }
                </div>
                }
            </div>
        }
        </>
        }

        {
        (selectedType?.name === 'Code' || selectedType === 'Code') &&
        <>
        {props.children}
        </>
        }

        {
        selectedType?.name === 'Quote' &&
        <>
        {props.children}
        </>
        }

        {
        (selectedType?.name === 'Highlight' || selectedType === 'Highlight') &&
        <>
        {props.children}
        </>
        }

        {
        selectedType?.name === 'SocialFeed' &&
        <>
        {
        (imageUrl || title) ? <div className="ct-relative">
                {props.children}

                {
                showAssetUrlInput && 
                <div className="absolute bottom-[50%] w-full items-center px-2">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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

                <div className="px-1 absolute bottom-[10px] flex items-center justify-between w-full md:px-2">
                  <div className="bg-white rounded-[60px] p-1 cursor-pointer flex items-center justofy-center border border-solid border-[#97A0B5]" onClick={(e) => {
                    e.stopPropagation()
                    setFavorite(prev => !prev)
                  }}>
                    {
                    favorite ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22.5 8.8125C22.5 15.375 12.7697 20.6869 12.3553 20.9062C12.2461 20.965 12.124 20.9958 12 20.9958C11.876 20.9958 11.7539 20.965 11.6447 20.9062C11.2303 20.6869 1.5 15.375 1.5 8.8125C1.50174 7.27146 2.11468 5.79404 3.20436 4.70436C4.29404 3.61468 5.77146 3.00174 7.3125 3C9.24844 3 10.9434 3.8325 12 5.23969C13.0566 3.8325 14.7516 3 16.6875 3C18.2285 3.00174 19.706 3.61468 20.7956 4.70436C21.8853 5.79404 22.4983 7.27146 22.5 8.8125Z" fill="#E50000"/>
                      </svg> :
                    <HeartIcon className={`h-5 w-5 text-[#74778B]}`}/>
                    }
                    
                  </div>

                  <div className="flex items-center">
                    <div className="cursor-pointer bg-[#FDFDFD] rounded-md flex items-center p-1 border border-solid border-[#97A0B5]" onClick={() => window.open(assetUrl|| '', "_blank")}>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1 text-[#74778B]"/>
                      <div className="text-[#475467] text-sm">{assetUrl && getDomainFromURLForBookmark(assetUrl)}</div>
                    </div>

                    {!currentGem && <div className={`ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 cursor-pointer ${showAssetUrlInput ? 'bg-[#B8D4FE]' : 'bg-white'}`} onClick={(e) => {
                      e.stopPropagation()
                      setShowAssetUrlInput(!showAssetUrlInput)
                      setShowShortEndInput(false)
                    }}>
                      <PiPencilSimple className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>}
                    
                    <div className="ml-1 md:ml-2 border border-solid border-[#97A0B5] rounded-full w-fit p-1 bg-white cursor-pointer" onClick={() => onOpenImageDialog("thumbnail")}>
                      <PiUploadSimpleLight className="text-[#74778B] h-4 w-4 aspect-square"/>
                    </div>

                  </div>

                </div>

            </div>:

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
                </div> :
                <div className="flex items-center w-full">
                  <AntInput placeholder="Website link here..." prefix={<LinkIcon className="text-[#74778B] h-5 w-5 mr-1 aspect-square" />} className='rounded-lg shadow-md outline-none w-full text-black' 
                    size="large"
                    type="text" 
                    name="link" 
                    value={assetUrl}
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
        }
        </>
        }

        {
        (selectedType?.name === 'Screenshot' || selectedType === 'Screenshot') &&
        <>
        {props.children}
        </>
        }
       
        </>
    )
}

export default MediaTypeUI;