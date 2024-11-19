import { Emoji, EmojiStyle } from 'emoji-picker-react';
import * as ReactIcons from 'react-icons/ri';

const FavIconComponent = ({data,renderingPlace='',showThumbnail=true,defaultImgSrc=''}) => {
    const Icon = data  && data?.type === 'icon' && ReactIcons[data?.icon];
    const isFavIconImageString = typeof data === 'string' ? true : false
    return (
        <>
        {
        renderingPlace === 'list' &&
        <>
        {
        (isFavIconImageString && showThumbnail && data) ?
            <img className='h-4 w-4' src={data} alt={"Curateit"} /> : 
        (isFavIconImageString && defaultImgSrc) ?
            <button className='bg-[#F8FBFF] rounded-sm'>
                <img style={{height:"14px", width:"14px"}} src={defaultImgSrc} alt="icon" onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}/>
            </button> : <></>
        }

        {
        (!isFavIconImageString && showThumbnail && data) ?
        <div>
                <div className="relative">
                <div>
                {/* img */}
                {data && data?.type === 'image' &&
                <>
                <img className='h-4 w-4' src={data?.icon || ''} alt={"Curateit"} onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}/>
                </>
                }

                {/* emoji */}
                {
                    data && data?.type === 'emoji'  && <div className="flex items-center justify-center">
                        <Emoji
                            unified={data?.icon || ''}
                            emojiStyle={EmojiStyle.APPLE}
                            size={18}
                        />
                    </div>
                }

                {
                    data && data?.type === 'color' && <div className="flex items-center justify-center">
                        <div style={{height:'14px',width:'14px',borderRadius:'50%',background: data?.icon || ''}}>
                        </div>
                    </div>
                }

                {
                    data  && data?.type === 'icon' && <div className="flex items-center justify-center">
                    <Icon style={{fontSize:'18px'}}/>
                    </div>
                }
              </div>
              </div>
        </div>
        :
        (!isFavIconImageString &&  defaultImgSrc) ?
        <button className='bg-[#F8FBFF] rounded-sm'>
            <img style={{height:"14px", width:"14px"}} src={defaultImgSrc} alt="pdf icon" onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}/>
        </button> : <></>
        }
        </>
        }

        {
        !renderingPlace &&
        <>
        {
        (isFavIconImageString && !renderingPlace && data) ?
        <img className={`w-[30px] h-[30px] rounded-[3px]`} src={data} alt={"Curateit"} onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}/>
        : <></>
        }

        {
        (!isFavIconImageString && !renderingPlace && data) ?
        <div>
                <div className="relative">
                <div className='bg-white rounded-lg pointer text-center' 
                style={{height: data && data?.type === 'image' ? '30px' : ' inherit',
                width: data && data?.type === 'image' ? '30px' : ' inherit'}}>
                {/* img */}
                {data && data?.type === 'image' &&
                <>
                <img className={`w-[30px] h-[30px] rounded-[3px]`} src={data?.icon || ''} alt={"Curateit"} onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}/>
                </>
                }

                {/* emoji */}
                {
                    data && data?.type === 'emoji'  && <div className="flex items-center justify-center">
                        <Emoji
                            unified={data?.icon || ''}
                            emojiStyle={EmojiStyle.APPLE}
                            size={22}
                        />
                    </div>
                }

                {
                    data && data?.type === 'color' && <div className="flex items-center justify-center">
                        <div style={{height:'20px',width:'20px',borderRadius:'50%',background: data?.icon || ''}}>
                        </div>
                    </div>
                }

                {
                    data  && data?.type === 'icon' && <div className="flex items-center justify-center">
                    <Icon style={{fontSize:'20px'}}/>
                    </div>
                }
              </div>
              </div>
        </div>
        : <></>
        }
        </>
        }
        </>
    )
}

export default FavIconComponent;