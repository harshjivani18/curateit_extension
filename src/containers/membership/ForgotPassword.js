import React                    from 'react'

import PlainLayout              from '../../components/layouts/PlainLayout'
import Forform                  from '../../components/forgotpass/Forform'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const ForgotPassword = () => {
    const navigate  = useNavigate();
    return (
        <PlainLayout>
            <button className='absolute top-3 left-3 outline-none bg-none' onClick={() => navigate("/login")}>
                <ArrowLeftIcon className='h-4 w-5' />
            </button>
            <h1 className='fogot-pass'>Forgot Password</h1>
            <Forform/>
        </PlainLayout>
    )
}

export default ForgotPassword