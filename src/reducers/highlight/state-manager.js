export default class HighlightStateManager {

    static updateHighlightsArr = (prevState, action) => {
        const state            = { ...prevState }
        const { operation,
                obj 
              }                = action
        const idx = state.allTypeHighlights.findIndex((o) => { return o.id === obj.id })
        if (operation === "delete" && idx !== -1) {
            state.allTypeHighlights.splice(idx, 1)
            state.allTypeHighlights = [ ...state.allTypeHighlights ]
        }
        else if (idx !== -1) {
            state.allTypeHighlights[idx] = {
                ...state.allTypeHighlights[idx],
                ...obj
            }
        }
        else if (state.allTypeHighlights.length !== 0) {
            state.allTypeHighlights = [ ...state.allTypeHighlights, obj ]
        }

        return state
    }

    static getAllTypeHighlightSuccess = (prevState, action) => {
        const state         = { ...prevState }
        const { data }      = action.payload
        
        if (data) {
            state.allTypeHighlights = [ ...data ]
        }

        return state
    }

    static getAllHighlights = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.highlights = data || [];
        }
        return state;
    };

    static getSingleHighlight = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.singleHighlight = [data] || [];
        }
        return state;
    };

    static getSingleHighlightReset = (prevState, action) => {
        const state = { ...prevState };
        state.singleHighlight = [];
        return state;
    };
}