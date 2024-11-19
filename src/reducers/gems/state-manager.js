export default class GemViewStateManager {
    static fetchGemByIdSuccess = (prevState, action) => {
        const state = { ...prevState };
        const {data} = action.payload.data;
        if (data) {
            state.gemData = data;
        }
        return state;
    };

    static addGemSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.addedGemData = data;
        }
        return state;
    };

    static addGemReset = (prevState, action) => {
        const state = { ...prevState };
        state.addedGemData = null; 
        return state;
    };

    static importGemSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.importedGemData = data;
        }
        return state;
    };

    static updateGemSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data  } = action.payload;
        if (data) {
            state.updateGemData = data;
        }
        return state;
    };

    static updateGemReset = (prevState, action) => {
        const state = { ...prevState };
        state.updateGemData = null;
        return state;
    };

    static deleteGemSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.deleteSuccess = true;
        }
        return state;
    };

}