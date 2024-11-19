import { Spin } from 'antd';

const Loadingscreen = ({ showSpin }) => {
    return(
        <div>
            {
            showSpin ? <div>
                <>
                <div className='mrg'>
                Loading Data...    <Spin size='middle'/>
                </div>
                </>
            </div> : <></>

            }
        </div>
    )
}

export default Loadingscreen;