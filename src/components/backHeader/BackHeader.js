import React from 'react'
import { ChevronLeftIcon } from '@heroicons/react/20/solid'
import { useNavigate } from 'react-router-dom'

const BackHeader = ({ backUrl }) => {
  const navigate = useNavigate()
  const goBack = () => {
    if(backUrl){
      navigate(backUrl)
    }else{
      navigate("/search-bookmark")
    }
  }
  return (
    <div className="p-2">
      <button
        className="flex justify-start items-center gap-2"
        onClick={goBack}
      >
        <ChevronLeftIcon className="h-5 w-5" />
        <span>Back</span>
      </button>
    </div>
  )
}

export default BackHeader