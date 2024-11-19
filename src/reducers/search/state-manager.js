export default class TagStateManager {

    static searchObject = (prevState, action) => {
        const state = { ...prevState };
        const {data} = action.payload.data;
        if (data) {
            state.searchObjData = data;
        }
        return state;
    }

}