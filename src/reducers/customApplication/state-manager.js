import session from "../../utils/session";

export default class SidebarApplicationStateManager {

    static getAllPublicSidebarApps = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.publicSidebarApps = data.sidebarApps || [];
        }
        return state;
    };

    static getSidebarAppsUser = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.sidebarAppsUser = data || [];
        }
        return state;
    };

    static getSidebarOrder = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data && data.sidebarArr) {
            state.sidebarOrder = data?.sidebarArr?.filter(item => item.name !== 'Save tabs') || [];
            session.setSidebarOrder(
              data?.sidebarArr?.filter((item) => item.name !== "Save tabs")
            );
        }
        return state;
    };

    static updateMostVisited = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            data.forEach((d) => {
                const sidebarAppIdx     = state.sidebarAppsUser.findIndex((s) => s.url === d.url);
                const sidebarOrderIdx   = state.sidebarOrder.findIndex((s) => s.url === d.url);
                
                if (sidebarAppIdx === -1) {
                    state.sidebarAppsUser = [ ...state.sidebarAppsUser, d ]
                }

                if (sidebarOrderIdx === -1) {
                    state.sidebarOrder = [ ...state.sidebarOrder, d ]
                }
            })
            session.setSidebarOrder(state.sidebarOrder)
        }
        return state;
    };

    
}