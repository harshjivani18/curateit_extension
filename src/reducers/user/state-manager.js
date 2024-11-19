import session from "../../utils/session";

export default class UserViewStateManager {
    static fetchUserDetailsSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        
        if (data) {
            state.userData = data;
            state.userTags = data.tags ? [ ...data.tags ] : []
            // state.themeMode = data.preferences?.theme?.mode
            state.sidebarPosition= data?.preferences?.sidebar_position || 'right'
            state.enableFloatMenu= session.enableFloatMenu
            state.show_image_option= data?.preferences?.show_image_option || true
            state.show_code_option= data?.preferences?.show_code_option || true
            state.sidebar_position= data?.preferences?.sidebar_position || 'right'
            state.sidebar_view= data?.preferences?.sidebar_view || 'auto_hide'

            session.setUserId(data.id)
            session.setUserProfileImage(data.profilePhoto);
            session.setIsBookmarkSynced(data.is_bookmark_sync)
        }
        return state;
    };

    static setSuperAdminConfiguration = (prevState, action) => {
        const state         = { ...prevState };
        const { data }      = action.payload;
        if (data?.data?.length > 0) {
            const config = data.data[0]?.attributes
            if (config) {
                state.userConfig = {
                    video_url: config.tutorial_video_url,
                    thumbnail_url: config.tutorial_video_thumbnail,
                    extension_url: config.extension_url,
                    embed_code: config.tutorial_video_embed_code
                }
            }
        }
        return state;
    }

    static updateUserTags = (prevState, action) => {
        const state       = { ...prevState }
        const { tags }    = action

        if (Array.isArray(tags)) {
            state.userTags = [ ...state.userTags, ...tags ]
        }
        else {
            state.userTags = [ ...state.userTags, tags ]
        }
        return state
    }
    
    static updateUserSuccess = (prevState, action) => {
        const state     = { ...prevState };
        const { data }  = action.payload;
        if (data) {
            state.userData = { ...state.userData, ...data };
            state.themeMode = data.preferences?.theme?.mode;
            state.sidebarPosition= data?.preferences?.sidebar_position
            state.enableFloatMenu= session.enableFloatMenu
            state.show_image_option= data?.preferences?.show_image_option 
            state.show_code_option= data?.preferences?.show_code_option
            state.sidebar_position= data?.preferences?.sidebar_position
            state.sidebar_view= data?.preferences?.sidebar_view
        }
        return state;
    };

    static removeDomain = (prevState, action) => {
        const state     = { ...prevState };
        const { data }  = action.payload
        state.blocked_sites = data?.data?.blocked_sites || [] 

        return state;
    };

    static getBlockDomain = (prevState, action) => {
        const state     = { ...prevState };
        const { data }  = action.payload
        state.blocked_sites = data?.userDetails?.blocked_sites || []

        return state;
    };

}