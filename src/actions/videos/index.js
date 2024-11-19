import * as ActionTypes from './action-types'

export const createVideo = (data) => ({
    type: ActionTypes.CREATE_VIDEO,
    payload: {
        request: {
            url: `/api/videos`,
            method: "post",
            data
        }
    }
})

export const updateVideo = (data, id) => ({
    type: ActionTypes.UPDATE_VIDEO,
    payload: {
        request: {
            url: `/api/videos/${id}`,
            method: "put",
            data
        }
    }
})