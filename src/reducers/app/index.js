import * as ActionTypes         from '../../actions/app/action-types'

const INITIAL_STATE = {
    tab: null,
    isSyncing: false,
    activeTabKey: "search-bookmark",
    shortLinks: [],
    percentage: 1,
    showExceedModal: false,
    totals: null,
    fullLoaderScreen: false,
    currentImportStatus: null,
    showSingleFileModal: false,
}

export default function codeStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ActionTypes.SET_CURRENT_TAB:
            return { ...state, tab: action.tab };
        case ActionTypes.SYNCING_COLLECTION:
            return { ...state, isSyncing: action.status };
        case ActionTypes.SET_ACTIVE_HOME_TAB:
            return { ...state, activeTabKey: action.key }
        case ActionTypes.SET_SHORT_LINKS:
            return { ...state, shortLinks: action.shortLinks }
        case ActionTypes.SET_PERCENTAGE:
            return { ...state, percentage: action.percent }
        case ActionTypes.SHOW_EXCEED_POPUP:
            return { ...state, showExceedModal: action.status, exceedMessage: action.exceedMessage };
        case ActionTypes.SET_IS_SYNCING:
            return { ...state, isSyncing: action.status }
        case ActionTypes.SET_CURRENT_UPLOAD_ITEMS:
            return { ...state, totals: action.totals }
        case ActionTypes.SET_FULL_LOADER_SCREEN:
            return { ...state, fullLoaderScreen: action.value }
        case ActionTypes.SET_CURRENT_IMPORT_STATUS:
            return { ...state, currentImportStatus: action.status }
        case ActionTypes.SHOW_SINGLE_FILE_POPUP:
            return { ...state, showSingleFileModal: action.status }
        default:
            return state;
    }
}