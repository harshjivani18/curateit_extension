import React, { useEffect, useState }   from 'react'
import { useNavigate }                  from 'react-router-dom'
import { useSelector }                  from 'react-redux'
import { XMarkIcon }                    from '@heroicons/react/24/outline'

import PlainLayout                      from '../../components/layouts/PlainLayout'
import LoginForm                        from '../../components/loginForm/LoginForm'
import RegisterForm                     from '../../components/registerForm/RegisterForm'
import SocialLogin                      from '../../components/socialLogin/SocialLogin'
import { fetchCurrentTab }              from '../../utils/fetch-current-tab'
import LayoutCommon from '../../components/commonLayout/LayoutCommon'
import session from '../../utils/session'

const  DEFAULT_PAGE_TABS = [
    { name: 'Sign in', href: '#', current: true },
    { name: 'Sign up', href: '#', current: false }
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Login = (props) => {
    const navigate          = useNavigate()
    const [tabs, setTabs]   = useState(DEFAULT_PAGE_TABS);

    useEffect(() => {
        // let session = localStorage.getItem("token");
        // if (session  === null) {
        //     navigate('/login');
        // } 
        if (session.token === null) {
            navigate('/login');
        }
    }, [navigate])

    // const updateLocation = () => {
    //     if (window.location.pathname !== '/index.html') return
    //     const { href } = window.location
    //     if (href.includes("?add-bookmark")) {
    //         navigate("/add-bookmark")
    //     }
    //     else if (href.includes("?add-highlight")) {
    //         navigate("/highlight-panel")
    //     }
    //     else if (href.includes("?add-code")) {
    //         navigate("/codesnippet-panel")
    //     }
    //     else if (href.includes("?image")) {
    //         navigate("/image-panel")
    //     }
    //     else if (href.includes("?pdfHighlight")) {
    //         const params        = new URLSearchParams(window.location.search)
    //         const file          =  params.get('file')
    //         const originalFile  =  params.get('originalFile')
    //         navigate(`/pdf-highlight?file=${file ? file : ''}&originalFile=${originalFile ? originalFile :''}`)
    //     }
    //     else{
    //         navigate('/search-bookmark')
    //     }
    // }

    const onCloseClick = async () => {
        const tab = await fetchCurrentTab()
        window.chrome.tabs.sendMessage(tab.id, { type: "CT_CLOSE_PANEL" })
    }

    const setCurrentTab = (name) => {
        const newTabs = tabs.map(t => {
            if(t.name === name){
                return {...t, current: true}
            }else{
                return { ...t, current: false }
            }
        });

        setTabs(newTabs);
    }

    return (
        <>
            {/* <div className="close-container">
                <button className="header-close-btn" onClick={onCloseClick}>
                    <XMarkIcon />
                </button>
            </div> */}
        <LayoutCommon isHideOverflow={true}>
            <PlainLayout page={"membership"}>
                <nav className="-mb-px flex space-x-1 justify-around overflow-hidden" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <a
                            onClick={() => setCurrentTab(tab.name)}
                            key={tab.name}
                            href={tab.href}
                            className={classNames(
                                tab.current
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 dark:text-white hover:text-gray-700 hover:border-gray-300',
                                'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm w-[48%] text-center'
                            )}
                            aria-current={tab.current ? 'page' : undefined}
                        >
                            {tab.name}
                        </a>
                    ))}
                </nav>
                <SocialLogin />
                <h6 className='text-sm text-center text-gray-500'>{tabs.filter(t => t.current === true)[0].name === "Sign in" ? 'or sign in with email': 'or create your account' }</h6>
                {tabs.filter(t => t.current === true)[0].name === "Sign in" ? <LoginForm /> : <RegisterForm />}
            </PlainLayout>
        </LayoutCommon>
        </>
    )
}

export default Login