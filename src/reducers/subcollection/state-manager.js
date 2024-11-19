export default class SubcollectionStateManger {
    
    static deleteSubcollectionSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.deleteSuccess = true;
        }
        return state;
    };
}