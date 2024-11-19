import { S }                    from "../../utils/prefix";
import * as ActionTypes         from "../../actions/ai-brands/action-types";
import AIBrandsStateManager     from "./state-manager";

const INITIAL_STATE = {
    myPrompts: [],
    publicPrompts: [],
    brandPrompts: [],
    voices: [],
    personas: [],
    syncAIPrompt: false
}

export default function brandStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.FETCH_MY_PROMPTS):
            return AIBrandsStateManager.fetchMyPromptSuccess(state, action);
        case S(ActionTypes.FETCH_PUBLIC_PROMPTS):
            return AIBrandsStateManager.fetchPublicPromptSuccess(state, action);
        case S(ActionTypes.FETCH_BRAND_PROMPTS):
            return AIBrandsStateManager.fetchBrandPromptSuccess(state, action);
        case S(ActionTypes.ADD_BRAND):
        case S(ActionTypes.ADD_PERSONA):
        case S(ActionTypes.ADD_VOICE):
            return AIBrandsStateManager.addBrandSuccess(state, action)
        case S(ActionTypes.EDIT_BRAND):
            return AIBrandsStateManager.editBrandSuccess(state, action)
        case S(ActionTypes.DELETE_BRAND):
            return AIBrandsStateManager.deleteBrandSuccess(state, action)
        case S(ActionTypes.FETCH_PERSONAS):
            return { ...state, personas: [ ...action.payload.data.data ] };
        case S(ActionTypes.FETCH_VOICES):
            return { ...state, voices: [ ...action.payload.data.data ] };
        case ActionTypes.SYNC_AI_PROMPT_AGAIN:
            return { ...state, syncAIPrompt: action.status }
        case ActionTypes.UPDATE_PROMPTS:
            return { ...state, myPrompts: [ ...action.prompts ] }
        default:
            return state;
    }
}