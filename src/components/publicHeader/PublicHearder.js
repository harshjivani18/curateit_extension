import React                from 'react'
import { useSelector }      from 'react-redux';
import { XMarkIcon }        from '@heroicons/react/24/outline';

import { useTheme }         from '../../hooks/useTheme'
import { fetchCurrentTab }  from '../../utils/fetch-current-tab';

const PublicHearder = () => {
  const { theme }     = useTheme()

  return (
    <header className='flex justify-center'>
      <img className="h-[32px]" src={theme === "dark" ? "/icons/logo-dark.svg" : "/icons/logo.png"} alt="curateit" />
    </header>
  )
}

export default PublicHearder