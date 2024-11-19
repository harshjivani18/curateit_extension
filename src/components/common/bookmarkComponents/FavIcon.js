import { Emoji, EmojiStyle } from 'emoji-picker-react';
import { PiPencilSimple } from 'react-icons/pi';
import * as ReactIcons from 'react-icons/ri';

const FavIcon = ({data,}) => {
    const Icon = data  && data?.type === 'icon' && ReactIcons[data?.icon];
    const isFavIconImageString = typeof data === 'string' ? true : false
    if(!data){
        return(
            <div className="border border-solid border-[#97A0B5] rounded-full w-fit p-1 mt-4 cursor-pointer">
                <PiPencilSimple className="text-[#74778B] h-6 w-6 aspect-square"/>
            </div>
        )
    }
    return (
        <>
        {
        (isFavIconImageString && data) ?
        <img className={`w-[30px] h-[30px] rounded-[3px]`} src={data} alt={"Curateit - Curate, Save, Search gems of web, 10x your productivity"} onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src=`${process.env.REACT_APP_STATIC_IMAGES_CDN}/webapp/curateit-logo.png`
                    }}/>
        : <></>
        }

        {
        (!isFavIconImageString && data) ?
        <div className="relative border border-solid border-[#97A0B5] rounded-full mt-2 w-fit text-start flex items-center justify-center p-[6px]">
            <div className='bg-white cursor-pointer text-center' 
                style={{height: (data && data?.type === 'image') ? '30px' : 'inherit',
                width: (data && data?.type === 'image') ? '30px' : ' inherit'}}>
                {/* img */}
                {data && data?.type === 'image' &&
                <>
                <img className={`w-[30px] h-[30px]  rounded-[3px]`} src={data?.icon} alt={"Curateit - Curate, Save, Search gems of web, 10x your productivity"} onError={(e) => {
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
                            size={30}
                        />
                    </div>
                }

                {
                    data && data?.type === 'color' && <div className="flex items-center justify-center">
                        <div style={{height:'30px',width:'30px',borderRadius:'50%',background: data?.icon || ''}}>
                        </div>
                    </div>
                }

                {
                    data  && data?.type === 'icon' && <div className="flex items-center justify-center">
                    <Icon style={{fontSize:'30px'}}/>
                    </div>
                }
            </div>

            <div className='cursor-pointer rounded-full bg-[#347AE2] p-1 absolute right-[-8px] bottom-[-6px]'>
                <PiPencilSimple className="text-white h-3 w-3 aspect-square"/>
            </div>
        </div>
        : <></>
        }
        </>
    )
}

export default FavIcon;