import React                    from 'react'
import { useNavigate }          from 'react-router-dom';
import { CheckBadgeIcon }       from "@heroicons/react/24/outline"

import PlainLayout              from '../../components/layouts/PlainLayout'
import Button                   from '../../components/Button/Button';

const LinkVerified = (props) => {
    const navigate = useNavigate();
    return (
        <PlainLayout>
            <div className='flex justify-center py-16'>
                <CheckBadgeIcon className='text-[#54C882] h-[95px] ' />
            </div>
            <div className='text-center mb-16'>
                <h5 className='text-lg font-bold text-[#062046] text-center mb-4'>{props.message}</h5>
                <Button variant="tertiary text-center" onClick={() => navigate(props.target)}>
                    Continue
                </Button>
            </div>
        </PlainLayout>
    )
}

export default LinkVerified