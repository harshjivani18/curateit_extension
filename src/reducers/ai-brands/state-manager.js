export default class AIBrandsStateManager {
    static fetchMyPromptSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data?.data) {
            state.myPrompts = [ ...data.data ];
        }
        return state;
    }

    static fetchPublicPromptSuccess = (prevState, action) => {
        const state             = { ...prevState };
        const { data }          = action.payload;
        if (data?.data) {
            state.publicPrompts = [ ...data.data ];
        }
        return state;
    }

    static fetchBrandPromptSuccess = (prevState, action) => {
        const state             = { ...prevState };
        const { data }          = action.payload;
        if (data?.data) {
            state.brandPrompts  = [ ...data.data ];
        }
        return state;
    }

    static addBrandSuccess = (prevState, action) => {
        const state         = { ...prevState };
        const { data }      = action.payload;
        if (data?.data?.brand_type === "Persona") {
            state.personas  = [ ...state.personas, data.data ];
        }
        else if (data?.data?.brand_type === "Voice") {
            state.voices    = [ ...state.voices, data.data ];
        }
        return state;
    }
    static editBrandSuccess = (prevState, action) => {
        const state     = { ...prevState };
        const { data }  = action.payload;

        if (data?.data?.attributes?.brand_type === "Persona") {
            const author        = {
                id: data.data.attributes.author.data.id,
                ...data.data.attributes.author.data.attributes
            }
            const obj           = {
                ...data.data.attributes,
                id: data.data.id,
                author
            }
            const index = state.personas.findIndex((persona) => persona.id === data.data.id);
            if (index !== -1) {
                state.personas[index] = {
                    ...state.personas[index],
                    ...obj
                };
            }
        }
        else if (data?.data?.attributes?.brand_type === "Voice") {
            const index = state.voices.findIndex((persona) => persona.id === data.data.id);
            const author        = {
                id: data.data.attributes.author.data.id,
                ...data.data.attributes.author.data.attributes
            }
            const obj           = {
                ...data.data.attributes,
                id: data.data.id,
                author
            }
            if (index !== -1) {
                state.voices[index] = {
                    ...state.voices[index],
                    ...obj
                };
            } 
        }
        return state;
    }

    static deleteBrandSuccess = (prevState, action) => {
        const state     = { ...prevState };
        const { id }    = action.meta.previousAction.meta
        state.personas  = state.personas.filter((persona) => persona.id !== id);
        state.voices    = state.voices.filter((voice) => voice.id !== id);
        return state;
    }
}