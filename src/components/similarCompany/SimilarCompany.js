import React from 'react'

const SimilarCompany = ({ company, openUrl }) => {
  const createLogoText = (f) => {
    if (!f) return
    const splitText = f.split(" ")
    let newArr = splitText.map((sf) => {
      return sf.toString().charAt(0).toUpperCase()
    })

    return newArr.join("")
  }

  return (
    <div
      key={company?.id}
      className="min-h-8 w-full p-2 rounded-md border-[2px] border-gray-400 flex items-center cursor-pointer"
      onClick={() => openUrl(company?.domain)}
    >
      <h2 className="text-black text-sm font-semibold flex-1 break-words">
        {company?.name}
      </h2>
    </div>
  )
}

export default SimilarCompany