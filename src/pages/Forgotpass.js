import React, { useState } from 'react'
import Footer from '../components/footer/Footer'
import PublicHearder from '../components/publicHeader/PublicHearder'
import Forform from '../components/forgotpass/Forform'

const Forgotpass = () => {


  return (
      <div className="w-full h-full py-4 radial-grad">
          <PublicHearder />
          <main className='px-16 mt-[150px]'>
                <h1 className='fogot-pass'>Forgot Password</h1>
    
            <div>
                <Forform/>
            </div>
            <Footer/>
          </main>
      </div>
  )
}

export default Forgotpass