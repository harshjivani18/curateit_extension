import React from 'react'
import { CheckBadgeIcon } from "@heroicons/react/24/outline"
import PublicHearder from '../components/publicHeader/PublicHearder'
import Footer from '../components/footer/Footer'
import Button from '../components/Button/Button';
import { useNavigate } from 'react-router-dom';

const LinkVerified = () => {
    const navigate = useNavigate();
    return (
        <div className='radial-grad-down py-4'>
            <PublicHearder />
            <div className='flex justify-center py-16'>
                <CheckBadgeIcon className='text-[#54C882] h-[95px] ' />
            </div>
            <div className='text-center mb-16'>
                <h5 className='text-lg font-bold text-[#062046] text-center mb-4'>Varified Successfully</h5>
                <Button variant="tertiary text-center" onClick={() => navigate("/search-bookmark")}>
                    Continue
                </Button>
            </div>
            <Footer />
        </div>
    )
}

export default LinkVerified