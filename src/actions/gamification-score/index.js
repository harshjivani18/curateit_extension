import * as ActionTypes         from './action-types'

export const updateScore = (module) => ({
    type: ActionTypes.UPDATE_GAMFICATION_SCORE,
    payload: {
        request: {
            url: `/api/gamification-score?module=${module}`,
            method: "put"
        }
    }
})