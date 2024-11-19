import * as ActionTypes from './action-types';

export const getAllGroup = () => ({
    type: ActionTypes.GET_ALL_GROUPS,
    payload: {
        request: {
            url: `/api/groups`,
            method: "get"
        }
    }
});

export const getGroup = (id) => ({
    type: ActionTypes.GET_GROUP,
    payload: {
        request: {
            url: `/api/groups/${id}`,
            method: "get"
        }
    }
});

export const updateGroup = (data, id, isRemove=false) => ({
    type: ActionTypes.EDIT_GROUP,
    payload: {
        request: {
            url: `/api/groups/${id}?isRemove=${isRemove}`,
            method: "put",
            data: { data }
        }
    }
});

export const deleteGroup = (id) => ({
    type: ActionTypes.DELETE_GROUP,
    payload: {
        request: {
            url: `/api/groups/${id}`,
            method: "delete"
        }
    }
});

export const createGroup = (data) => ({
    type: ActionTypes.CREATE_GROUP,
    payload: {
        request: {
            url: `/api/groups`,
            method: "post",
            data
        }
    }
});

export const getAllPublicUsers = () => ({
    type: ActionTypes.GET_PUBLIC_USERS,
    payload: {
        request: {
            url: `/api/public-users`,
            method: "get"
        }
    }
})

export const findMemberExist = (email) => ({
    type: ActionTypes.FIND_MEMBER_EXIST,
    payload: {
        request: {
            url: `/api/is-member-exist?email=${email}`,
            method: "get"
        }
    }
})

export const getAllRegisteredUsers = () => ({
    type: ActionTypes.GET_ALL_REGISTERD_USERS,
    payload: {
        request: {
            url: `/api/get-all-register-users`,
            method: "get"
        }
    }
})