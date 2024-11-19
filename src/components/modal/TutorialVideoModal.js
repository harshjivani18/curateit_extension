import { Modal } from "antd";
import { useEffect, useState } from "react";
import { getTutorialVideoForMediaTypes } from "../../utils/constants";

const TutorialVideoModal = ({openTutorialVideoModal,setOpenTutorialVideoModal,selectedType}) => {
    const [videoId,setVideoId] = useState('')

    useEffect(() => {
        if(selectedType){
            const yUrl = getTutorialVideoForMediaTypes(selectedType)
            if(yUrl){
              const url = new URL(yUrl);
              const queryParams = new URLSearchParams(url.search);
              const id = queryParams.get('v');
              setVideoId(id)
            }
        }
    },[selectedType])

    return(
        <>
        <Modal
          title={null}
          open={openTutorialVideoModal}
          footer={null}
          maskClosable={true}
          onCancel={() => setOpenTutorialVideoModal(false)}
          bodyStyle={{
            padding:'0px'
          }}
          closable={false}
        > 
          {
          videoId ?
          <iframe width="100%" height='450px' src={`https://www.youtube.com/embed/${videoId}`} title="Tutorial youtube video"
          frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen id="curateit-tutorial-iframe-video">
          </iframe>
          :
          <div className="h-[300px]">
            <div className="font-medium flex items-center justify-center text-xl h-full">Video coming soon...</div>
          </div>
          }
      </Modal>
        </>
    )
}

export default TutorialVideoModal;