export default class ImageStateManager {
    static getAllImages = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.images = data || [];
        }
        return state;
    };

    static getSingleImage = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.singleImage = [data] || [];
        }
        return state;
    };

    static getSingleImageReset = (prevState, action) => {
        const state = { ...prevState };
        state.singleImage = [];
        return state;
    };
}