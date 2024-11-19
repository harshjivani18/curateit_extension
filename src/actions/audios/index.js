import * as ActionTypes from './action-types'

export const createAudio = (data) => ({
    type: ActionTypes.CREATE_AUDIO,
    payload: {
        request: {
            url: `/api/audios`,
            method: "post",
            data
        }
    }
})

export const updateAudio = (data, id) => ({
    type: ActionTypes.UPDATE_AUDIO,
    payload: {
        request: {
            url: `/api/audios/${id}`,
            method: "put",
            data
        }
    }
})