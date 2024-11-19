import React, { 
  useEffect, 
  useState 
}                           from 'react'
import { useDispatch }      from 'react-redux'
import { 
  getUserPlanDetails,
  getIsPlanOwner
}                           from '../../actions/user'  
import { fetchCurrentTab }  from '../../utils/fetch-current-tab'
import session              from '../../utils/session'

const AccountType = () => {
  const dispatch                              = useDispatch()
  const [isPlanOwner, setIsPlanOwner]         = useState(-1)
  const [userPlanDetails, setUserPlanDetails] = useState(null)
  const [isLoading, setIsLoading]             = useState(false)

  useEffect(() => {
    setIsLoading(true)
    dispatch(getUserPlanDetails()).then((res) => {
      setUserPlanDetails(res?.payload?.data)
      dispatch(getIsPlanOwner()).then((res1) => {
        setIsLoading(false)
        setIsPlanOwner(res1?.payload?.data?.isPlanOwner)
      })
    })
  }, [dispatch])

  const onUpgradeClick = async () => {
    const tab = await fetchCurrentTab()
    window.chrome.tabs.sendMessage(tab.id, {
      tabURLs: [`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/edit-profile?billing=true`],
      id: "CT_OPEN_WINDOW"
    })
  }

  return (
    <div className="py-2 flex justify-between items-center border-b-2 border-blue-100">
      <h2>Account type</h2>
      <div className="flex justify-end items-center gap-4">
        {isLoading 
          ? <h2>Loading...</h2>
          : isPlanOwner
            ? <h2>{userPlanDetails?.userPlan?.related_plan?.display_name}</h2>
            : <h2>Free</h2>
        }
        <button className='border border-blue-300 bg-blue-100 text-[#347AE2] rounded-md p-1' onClick={onUpgradeClick}>
          {userPlanDetails?.userPlan?.plan === "free" ? "Upgrade now" : "Change plan"}
        </button>
      </div>
    </div>
  )
}

export default AccountType