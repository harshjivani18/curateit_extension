import { S, F } from '../../utils/prefix'
import * as ActionTypes from '../../actions/subcollection/action-types'
import SubcollectionStateManger from './state-manager'

const INITIAL_STATE = {
    subcollectionData : []
}


export default function collectionStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        
        case S(ActionTypes.DELETE_SUBCOLLECTION):
            return SubcollectionStateManger.deleteSubcollectionSuccess(state, action);

        
        case F(ActionTypes.DELETE_SUBCOLLECTION):
            return {
                ...state,
                currentErrorMsg: action.error?.response?.data?.error?.message,
                currentSuccessMsg: "",
            };
        default:
            return state;
    }
}