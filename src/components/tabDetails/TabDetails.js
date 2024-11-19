import React, { useEffect, useState } from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/20/solid'
import ComboBox from '../combobox/ComboBox1'
import { GlobeAmericasIcon }            from '@heroicons/react/24/outline'
import session from '../../utils/session'

const TabDetails = ({tab, index, all, setSelectedCollections, tabs, setTabs, allStarred, setAllStarredStatus ,collectionData, getCollection, selectedCollections}) => {
    const [liked, setLiked] = useState(false)
    const [showCollectionInput, setShowCollectionInput] = useState(false)

    //Change Favourite status
    const setFavouriteHandler = () =>{
        setTabs(prev => {
            let a = prev.findIndex(t => t.id === tab.id)
            if(prev[a]){
            prev[a].is_favourite= !liked
            setLiked(prev=> !prev)
            return prev
            }
        })
    }

    //Change Starred status
    const starredHandler = (e,i) => {
        if(allStarred){
        setAllStarredStatus(false)
        }
        const tabsArr = [...tabs]
        tabsArr[i].starred = e.target.checked;

        setTabs(tabsArr)
    }
   

  return (
      <div className='grid grid-cols-11 gap-2 mt-2' key={index}>
          <div className='flex justify-start items-center'>
              <input
                  aria-describedby="comments-description"
                  name="checkbox"
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-200 text-indigo-600 focus:ring-indigo-500 bg-transparent"
                  checked={tab.starred}
                  onChange={(e) => starredHandler(e,index)}
              />
          </div>
          <div className='col-span-9 text-xs text-gray-800 flex justify-start items-start w-full bg-white border-2 rounded-md p-2 space-x-1'>
              <img src={tab?.favIconUrl ? tab?.favIconUrl :"/icons/icons8-globe-48.png"} alt="" className='h-3 w-3' />
              <span>{tab?.title?.substring(0,30) + (tab?.title?.length > 30?'...' : '')}</span>
          </div>
          {/* <div onClick={() => setShowCollectionInput(true)} className='col-span-4 text-xs text-gray-500 flex justify-start items-start w-full bg-white'>
              <ComboBox collectionData={collectionData} 
                        hideCount={true} 
                        tabs={tabs} 
                        userId={session.userId} 
                        setSelectedCollection={setTabs} 
                        tab={tab} 
                        setShowCollectionInput={setShowCollectionInput} 
                        selectedCollection={tab.collection_gems}
                        getCollection={getCollection}
                        selectedCollections={selectedCollections}
                        setSelectedCollections={setSelectedCollections}
                        all={all}
                         />
          </div> */}
          <div className='text-xs text-gray-500 flex justify-center items-center w-full bg-white border-2 rounded-md cursor-pointer' onClick={setFavouriteHandler}>
              {liked ? <SolidHeartIcon className="w-5 h-5 text-[#FB5959]" /> : <HeartIcon className="w-5 h-5" />}
          </div>
      </div>
  )
}

export default TabDetails