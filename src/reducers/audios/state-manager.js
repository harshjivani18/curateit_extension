export default class AudioStateManager {
    static createAudioSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.audios = [ ...state.audios, data ];
        }
        return state;
    }

    static updateAudioSuccess = (prevState, action) => {
        const state             = { ...prevState };
        const { data }          = action.payload;
        if (data) {
            const idx               = state.audios.findIndex((v) => { return v.id === data.id})
            state.audios[idx]       = { 
                ...state.audios[idx],
                ...data
            }
        }
        return state;
    };
}