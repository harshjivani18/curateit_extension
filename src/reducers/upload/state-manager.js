export default class UploadStateManager {
    static addUploadSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.uploadFileData = data;
        }
        return state;
    }

    static addUploadReset = (prevState, action) => {
        const state = { ...prevState };
        state.uploadFileData = null;
        return state;
    }
}