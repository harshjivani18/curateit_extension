export default class CodeStateManager {
    static getAllCodes = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.codes = data || [];
        }
        return state;
    };

    static getSingleCode = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.singleCode = [data] || [];
        }
        return state;
    };

    static getSingleCodeReset = (prevState, action) => {
        const state = { ...prevState };
        state.singleCode = [];
        return state;
    };
}