import session from '../../utils/session';

export default class LoginViewStateManager {
    static loginSuccess = (prevState, action) => {
        const state = { ...prevState };
        const data = action.payload.data;
        
        
        if (data) {
            state.loginData = data;
        }

        const token = action.payload.data.jwt;
        if (token !== undefined) {
            session.setToken(token);
            session.setUserId(data.user?.id)
            session.setUser(data.user?.username)
            session.setMode(data.user?.preferences?.theme?.mode)
            session.setBioCollectionId(data.user?.bio_collection)
            session.setCollectionId(data.user?.unfiltered_collection)
            session.setIsBookmarkSynced(data.user?.is_bookmark_sync)
        }else{
            const tokken = data.jwt
            state.loginData = data
            session.setUserId(data.user?.id)
            session.setToken(tokken);
            session.setUser(data.user?.username)
            session.setMode(data.user?.preferences?.theme?.mode)
            session.setCollectionId(data.user?.unfiltered_collection)
            session.setIsBookmarkSynced(data.user?.is_bookmark_sync)
        }
        return state;
    };

    static setUserSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.signupData = {
                ...state.signupData,
                unfiltered_collection: data.unfiltered_collection
            };
        }
        session.setCollectionId(data.unfiltered_collection)
        return state;
    }

    static signupSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.signupData = data;
        }
        const token = action.payload.data.jwt;
        session.setToken(token);
        session.setUser(data.user?.username)
        session.setCollectionId(data.user?.unfiltered_collection)
        session.setUserId(data.user?.id)
        session.setIsBookmarkSynced(data.user?.is_bookmark_sync)
        return state;
    };

    static emailVerificationSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.emailVerificationData = data;
        }
        return state;
    };

    static forgotSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.signupData = data;
        }
        return state;
    };

}
