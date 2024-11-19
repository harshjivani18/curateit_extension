export default class VideoStateManager {
    static createVideoSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.videos = [ ...state.videos, data ];
        }
        return state;
    }

    static updateVideoSuccess = (prevState, action) => {
        const state             = { ...prevState };
        const { data }          = action.payload;
        if (data) {
            const idx               = state.videos.findIndex((v) => { return v.id === data.id})
            state.videos[idx]       = { 
                ...state.videos[idx],
                ...data
            }
        }
        return state;
    };
}