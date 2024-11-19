import { S, F } from '../../utils/prefix'
import * as ActionTypes from '../../actions/search/action-types'
import SearchStateManger from './state-manager'

const INITIAL_STATE = {
    searchObjData: null,
}


export default function searchStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.SEARCH_BOOKS):
        case S(ActionTypes.CREATE_BOOK_GEM):
        case S(ActionTypes.SEARCH_MOVIES):
        case S(ActionTypes.CREATE_MOVIE_GEM):
            return SearchStateManger.searchObject(state, action);
        default:
            return state;
    }
}
