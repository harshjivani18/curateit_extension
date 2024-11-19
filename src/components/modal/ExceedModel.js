"use client"
import React                   from 'react'
import {  Button, Modal }                    from 'antd'
import { useDispatch, useSelector }                          from "react-redux"
import { toggleExceedPopup}        from "../../actions/app"
import { useNavigate } from 'react-router-dom'
import session from '../../utils/session'

const ExceedLimitModal = () => {
    const {showExceedModal, 
           exceedMessage}      = useSelector( state => state.app)
    const dispatch             = useDispatch()

    const onHideModal = () => {
        dispatch(toggleExceedPopup(false, ""))
    }

    const goPricingPage = () => {
        window.open(`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/edit-profile?billing=true`, '_blank')
    }

    const goReferalPage = () => {
        window.open(`${process.env.REACT_APP_WEBAPP_URL}/u/${session.username}/referral`, '_blank')
    }

    return (
        <Modal open={showExceedModal}
               title={"Plan Limit Exceeded"}
               footer={[
                <Button type="primary" className='bg-[#347AE2]' onClick={goReferalPage}>Earn</Button>,
                <Button type="primary" className='bg-[#347AE2]' onClick={goPricingPage}>Upgrade</Button>,
                <Button type="ghost" onClick={onHideModal} >Cancel</Button>
               ]}
               onCancel={onHideModal}
               className="welcome-modal-container"
               width={800}
               height={600}
               destroyOnClose>
            <p>{exceedMessage ? exceedMessage : "Your current plan limit is exceed you need to upgrade your plan or earn some credits"}</p>
        </Modal>
    )
}

export default ExceedLimitModal