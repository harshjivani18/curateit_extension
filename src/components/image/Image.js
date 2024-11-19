import React from 'react'

const Image = ({ image, openViewer }) => {
  return (
    <div className="h-24 w-full bg-lightest-blue border-[1px] rounded-md flex justify-center items-center p-4 cursor-pointer" 
        onClick={() => openViewer(image?.url || image) }>
      <img
        className="object-contain min-h-[2rem] max-h-[4rem] w-auto"
        src={image?.url || image}
        alt="images"
      />
    </div>
  )
}

export default Image