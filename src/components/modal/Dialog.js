import * as ReactIcons from 'react-icons/ri';
import { Modal, Tabs,message, Button } from 'antd'
import EmojiPicker, { Emoji, EmojiStyle } from 'emoji-picker-react';
import { FileUploader } from 'react-drag-drop-files'
import { FiUpload } from "react-icons/fi"
import { CirclePicker } from 'react-color';
import React, { useState } from 'react';
import { IoMdRefresh } from 'react-icons/io';
import axios from 'axios';

const fileTypes = ["JPG", "PNG", "GIF","JPEG","WBEP"];

const DialogModal = ({open,handleEmoji,selectedEmoji,selectedColor,
                handleColor,
                handleImageUploadChange,handleCoverModalSubmit,selectedImage,resetCancelValues,loadingImg,handleIcon,selectedIcon,handleRemoveIconModalSubmit,defaultFavIconImage='',
                setSelectedEmoji=() =>{},
                setSelectedColor =() => {},
                setSelectedImage =() => {},
                setSelectedIcon =() => {},
                setLoadingImg =() => {},
                setOpenIconModal= () => {},setFavIconImage=() => {},setDefaultFavIconImage=() => {},
                currentGem=''
            }) => {

    const [tabKey,setTabKey] = useState('Emoji')
    const iconNames = Object.keys(ReactIcons);

    const renderEmoji = () => {
        return(
            <>
            <div className="mt-2">
                <EmojiPicker
            onEmojiClick={handleEmoji}
            autoFocusSearch={false}
            previewConfig={{
              defaultCaption: "Pick one!",
              defaultEmoji: "1f92a" ,
            }}
            
        />
            </div>
            </>
        )
    }

    const renderColor = () => {
        return(
            <>
            <CirclePicker color={selectedColor} onChange={handleColor} />
            </>
        )
    }

    const renderIcons = () => {
        return(
                <div className="div-icon-list" style={{height:'450px',overflow:'hidden',overflowY:'auto'}}>
                {iconNames.map((iconName) => {
                    const Icon = ReactIcons[iconName];

                    return (
                    <div className="div-icon cursor-pointer hover:bg-[#f5f5f5]" key={iconName} onClick={() =>handleIcon(iconName)}>
                        <Icon />
                        <span>{iconName}</span>
                    </div>
                    );
                })}
            </div>
        )
    }

    const renderImageUpload = () => {
        return(
            <>
            <FileUploader 
                handleChange={handleImageUploadChange} 
                name="drop-zone-section-file" 
                types={fileTypes} 
                onTypeError={(err) => message.error(err)}
                disabled={loadingImg}
                >
                    <div className='my-0 mx-auto w-[348px] h-[218px] bg-white border-2 border-dashed border-gray-400 flex text-center justify-center align-middle items-center'>
                        <div>
                            <FiUpload className='h-6 w-6 text-gray-500 my-0 mx-auto mb-2' 
                            disabled={loadingImg}
                            />
                            <span>Drag & drop to upload file</span>
                            <div className='flex justify-center items-center gap-2 mt-2'>
                                <hr className='w-12' />
                                <span className='text-gray-500'>OR</span>
                                <hr className='w-12' />
                            </div>
                            <Button variant="mt-2 primary" 
                            disabled={loadingImg}
                            >Browse File</Button>
                        </div>
                    </div>
            </FileUploader>
            </>
        )
    }

    const handleTabChange = (key) => {
        setTabKey(key)
    }

    const getFavicon = async (url) =>{
    try {
        const response = await axios.get(url);
        const html = response.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Look for the favicon in <link> elements
        const faviconLink = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');

        let faviconUrl;
        if (faviconLink) {
        const faviconHref = faviconLink.getAttribute('href');
        faviconUrl = new URL(faviconHref, url); // Resolve relative URLs
        } else {
        // If not found in <link> elements, try fetching from the root level
        faviconUrl = new URL('favicon.ico', url);
        const faviconResponse = await axios.get(faviconUrl.toString());
        if (faviconResponse.status !== 200) {
            return;
        }
        }

        return faviconUrl;
    } catch (error) {
        console.error('Error fetching favicon:', error);
    }
    }

    const handleRefresh = async() => {
        if(defaultFavIconImage){
            setFavIconImage({
                type:'image',
                icon: defaultFavIconImage
            })
            setSelectedEmoji('')
            setSelectedColor('')
            setSelectedImage('')
            setSelectedIcon('')
            setOpenIconModal(false)
            return;
        }

        setLoadingImg(true)
        const img = await getFavicon(currentGem.url)
        if(img){
            setFavIconImage({
            type:'image',
            icon: img?.href || ''
            })
            setDefaultFavIconImage(img?.href || '')
            setLoadingImg(false)

            setSelectedEmoji('')
            setSelectedColor('')
            setSelectedImage('')
            setSelectedIcon('')
            setOpenIconModal(false)
        }else{
            setLoadingImg(false)
            setOpenIconModal(false)
            message.error('Error occured. Cant able to get favicon')
        }
    }

    const modalTitle = (
    <div className="flex justify-between items-center pr-8">
      <div>Choose icon</div>
      
      <div className='flex items-center'>
        {currentGem && <IoMdRefresh className="w-5 h-5 text-gray-700 hover:text-[#347AE2] mr-2 cursor-pointer" onClick={handleRefresh}/>}
        <button
        onClick={handleCoverModalSubmit}
        className=" bg-[#40a9ff] text-white p-2 font-normal text-sm rounded-sm"
      >
        Ok
      </button>
      </div>
    </div>
  );

    return(
        <>
        {
        open && 
        <Modal 
        title={modalTitle}
        open={open} 
        onCancel={() => resetCancelValues()}
        maskClosable={false}
        footer={null}
        >
        <div className='pt-1'>
            <div className='mb-1'>
                <div className="flex items-center justify-between"
                    style={{ wordBreak: "break-word" }}>
                    <div className='flex items-center mr-2'>
                        <div className="mr-2">Your selected icon is:</div>
                        {
                        selectedEmoji ? 
                            <Emoji
                            unified={selectedEmoji.unified || selectedEmoji ||''}
                            emojiStyle={EmojiStyle.APPLE}
                            size={22}
                        /> : 
                        selectedColor ?
                        <div style={{height:'20px',width:'20px',borderRadius:'50%',background: selectedColor}}></div>
                        : 
                        selectedImage  ? 
                        
                        <div>
                            {typeof selectedImage === 'string' && (selectedImage.includes('aws') || selectedImage.includes('http')) ? (
                            <div className="ml-2">
                                <img src={selectedImage} alt="" className="h-[50px] w-[50px]" />
                            </div>
                            ) : (
                            <div>
                                {selectedImage.name ? (
                                <div>
                                    {selectedImage.name}
                                </div>
                                ) : (
                                <div>{selectedImage || selectedImage.name || ""}</div>
                                )}
                            </div>
                            )}
                        </div>
                        : 
                        selectedIcon ? 
                        <div>{selectedIcon || ""}</div>
                        : ''
                        }
                        
                    </div>

                    {(selectedEmoji ||
                  selectedColor ||
                  selectedImage ||
                  selectedIcon) &&
                (
                    <div className="">
                      <Button
                        type="text"
                        className="text-[#EB5757] hover:text-[#EB5757]"
                        onClick={handleRemoveIconModalSubmit}
                        disabled={loadingImg}
                      >
                        Remove Icon{" "}
                      </Button>
                    </div>
                  )}
                </div>
            </div>
            <Tabs
                defaultActiveKey={tabKey}
                onChange={handleTabChange}
                items={[
                {
                    label: `Emoji`,
                    key: 'Emoji',
                    children: renderEmoji(),
                },
                {
                    label: `Color`,
                    key: 'Color',
                    children: renderColor(),
                },
                {
                    label: `Icons`,
                    key: 'Icons',
                    children: renderIcons(),
                },
                {
                    label: `Upload`,
                    key: 'Upload',
                    children: renderImageUpload(),
                },
                ]}
            />

        </div>
        </Modal>
        }
       
        </>
    )
}

export default DialogModal