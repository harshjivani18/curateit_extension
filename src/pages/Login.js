import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Footer from '../components/footer/Footer'
import LoginForm from '../components/loginForm/LoginForm'
import PublicHearder from '../components/publicHeader/PublicHearder'
import RegisterForm from '../components/registerForm/RegisterForm'
import SocialLogin from '../components/socialLogin/SocialLogin'
import { useTheme } from '../hooks/useTheme'


const  defaultTabs = [
    { name: 'Sign in', href: '#', current: true },
    { name: 'Sign up', href: '#', current: false }
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const Login = () => {
    const navigate = useNavigate()
    const { theme } = useTheme()
    const [tabs, setTabs] = useState(defaultTabs);
    
    useEffect(() => {
        let session = localStorage.getItem("token");
        if (session  === null) {
            navigate('/login');
        } else {
            //redirect to add bookmark for on click add bookmark
            if(window.location.pathname === '/index.html' && window.location.search.includes("?add-bookmark")) {
                navigate('/add-bookmark')
            }else if(window.location.pathname === '/index.html' && window.location.search === "?highlights"){
                navigate('/highlights')
            }else if(window.location.pathname === '/index.html' && (window.location.search.includes("?highlightPanel"))){
                const params = new URLSearchParams(window.location.search)
                const collectionId =  params.get('collectionId')
                const gemId =  params.get('gemId')
                const highlightId =  params.get('highlightId')
             
                navigate(`/highlight-panel?collectionId=${collectionId ? collectionId : ''}&gemId=${gemId ? gemId : ''}&highlightId=${highlightId ? highlightId : ''}`)
            }else if(window.location.pathname === '/index.html' && window.location.search === "?codeSnippetPanel"){
                navigate('/codesnippet-panel')
            }else if(window.location.pathname === '/index.html' && window.location.search === "?codeSnippetDetailsPanel"){
                navigate('/codesnippet-details-panel')
            }else if(window.location.pathname === '/index.html' && window.location.search === "?imagePanel"){
                navigate('/image-panel')
            }else if(window.location.pathname === '/index.html' && window.location.search === "?imagePanelDetails"){
                navigate('/image-details-panel')
            }
            else if(window.location.pathname === '/index.html' && (window.location.search.includes("?pdfHighlight"))){
                const params = new URLSearchParams(window.location.search)
                const file =  params.get('file')
                const originalFile =  params.get('originalFile')
             
                navigate(`/pdf-highlight?file=${file ? file : ''}&originalFile=${originalFile ? originalFile :''}`)
            }
            else{
            navigate('/search-bookmark')
            }
        } 
    }, [navigate])
    
    const activateTab = (name) => {
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
      <div className={classNames(theme === 'light' && "radial-grad","w-full h-full py-4  dark:bg-[#292B38]")}>
          <PublicHearder />
          {/* Tabs */}
          <main className='px-16 mt-[14px]'>
              <div className="border-b border-cyan-100 dark:border-gray-700">
                <nav className="-mb-px flex space-x-1 justify-around" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <a
                            onClick={() => activateTab(tab.name)}
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
            </div>
            <div>
                <SocialLogin />
            </div>
              <h6 className='text-sm text-center text-gray-500'>{tabs.filter(t => t.current === true)[0].name === "Sign in" ? 'or sign in with email': 'or create your account' }</h6>
           {tabs.filter(t => t.current === true)[0].name === "Sign in" ? <LoginForm /> : <RegisterForm />}
            <Footer/>
          </main>
      </div>
  )
}

export default Login