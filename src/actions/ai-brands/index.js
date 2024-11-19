import * as ActionTypes from './action-types';

export const fetchMyPrompts = () => ({
    type: ActionTypes.FETCH_MY_PROMPTS,
    payload: {
        request: {
            url: '/api/media-type?mediatype=Ai Prompt',
            method: 'get'
        }
    }
})

export const fetchPublicPrompts = () => ({
    type: ActionTypes.FETCH_PUBLIC_PROMPTS,
    payload: {
        request: {
            url: '/api/fetch-public-prompts',
            method: 'get'
        }
    }
})

export const fetchBrandPrompts = () => ({
    type: ActionTypes.FETCH_BRAND_PROMPTS,
    payload: {
        request: {
            url: `/api/get-brand-prompts`,
            method: 'get'
        }
    }
})

export const addPersona = (persona) => ({
    type: ActionTypes.ADD_PERSONA,
    payload: {
        request: {
            method: 'POST',
            url: '/api/personas',
            data: persona
        }
    }
})

export const addVoice = (voice) => ({
    type: ActionTypes.ADD_VOICE,
    payload: {
        request: {
            method: 'POST',
            url: '/api/voices',
            data: voice
        }
    }
})

export const addBrand = (persona) => ({
    type: ActionTypes.ADD_BRAND,
    payload: {
        request: {
            method: 'POST',
            url: '/api/ai-brands?populate=*',
            data: { data: persona }
        }
    }
})

export const editBrand = (persona, brandId) => ({
    type: ActionTypes.EDIT_BRAND,
    payload: {
        request: {
            method: 'PUT',
            url: `/api/ai-brands/${brandId}?populate=*`,
            data: { data: persona }
        }
    }
})

export const deleteBrand = (id) => ({
    type: ActionTypes.DELETE_BRAND,
    payload: {
        request: {
            method: 'DELETE',
            url: `/api/ai-brands/${id}`
        }
    },
    meta: {
        id
    }
})

export const fetchPersonas = () => ({
    type: ActionTypes.FETCH_PERSONAS,
    payload: {
        request: {
            method: 'GET',
            url: '/api/get-user-personas'
        }
    }
})

export const fetchVoices = () => ({
    type: ActionTypes.FETCH_VOICES,
    payload: {
        request: {
            method: 'GET',
            url: '/api/get-user-voices'
        }
    }
})

export const syncAiPromptAgain = (status) => ({
    type: ActionTypes.SYNC_AI_PROMPT_AGAIN,
    status
})

export const rephraseAIPrompt = (promptText) => ({
    type: ActionTypes.REPHRASE_AI_PROMPT,
    payload: {
        request: {
            method: 'POST',
            url: '/api/repharse-prompt',
            data: { prompt: promptText }
        }
    }
})

export const fetchChatAudio = (text, voice) => ({
    type: ActionTypes.FETCH_CHAT_AUDIO,
    payload: {
        request: {
            method: 'POST',
            url: '/api/convert-chat-to-audio',
            data: { text, voice }
        }
    }
})

export const updatePrompts = (prompts) => ({
    type: ActionTypes.UPDATE_PROMPTS,
    prompts
})