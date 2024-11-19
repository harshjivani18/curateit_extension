import * as ActionTypes from './action-types';

export const groupTabs = (links) => {
    return {
        type: ActionTypes.GROUP_TABS,
        payload: {
            request: {
                url: `/api/smart-group-tabs`,
                method: "post",
                data: {
                    links
                }
            }
        }
    }
}

export const importTabs = (data) => ({
    type: ActionTypes.IMPORT_TABS,
    payload: {
        request: {
            url: `/api/import-tabs`,
            method: "post",
            data
        }
    }
})