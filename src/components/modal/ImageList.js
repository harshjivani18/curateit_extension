const ImageList = ({data,onImageClick}) => {
    return(
        <>
        {
        (data && data.length>0) ? 
        data.map(item => {
            return(
                <>
                <div className="w-[25%]">
                    <div className="p-1 flex flex-col" onClick={() => onImageClick(item?.urls?.full)}>
                        <img src={item?.urls?.small} alt={item.alt_description} className="cursor-pointer w-[120px] h-[64px] rounded-[3px] object-cover transform transition-all duration-200 hover:scale-110"/>

                        <span className="text-[#37352f80] text-xs">by {item?.user?.username}</span>
                    </div>
                </div>
                
                </>
            )
        })
        : 
        'No Image'
        }
        </>
    )
}

export default ImageList;