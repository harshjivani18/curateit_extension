import session from "../../utils/session";

export default class DomainViewStateManager {
    static fetchUrlDataSuccess = (prevState, action) => {
        const state = { ...prevState };
        const data = action?.payload?.data;
        if (data) {
            state.urlData = data;
            session.setCurrentSiteData(JSON.stringify(data))
        }
        return state;
    };

    static fetchUrlDataReset = (prevState, action) => {
        const state = { ...prevState };   
        state.urlData = null;
        
        return state;
    };

    static fetchUrlScreenshotDataSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.urlScreenshotData = data;
        }
        return state;
    };

    static fetchUrlScreenshotDataReset = (prevState, action) => {
        const state = { ...prevState };   
        state.urlScreenshotData = null;
        
        return state;
    };
}