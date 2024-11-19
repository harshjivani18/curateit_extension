import * as ActionTypes         from './action-types'

export const setIsSyncing = (status) => ({
    type: ActionTypes.SET_IS_SYNCING,
    status
})

export const setCurrentTabDetails = (tab) => ({
    type: ActionTypes.SET_CURRENT_TAB,
    tab
});

export const setSyncingCollection = (status) => ({
    type: ActionTypes.SYNCING_COLLECTION,
    status
})

export const setActiveHomeTab = (key) => ({
    type: ActionTypes.SET_ACTIVE_HOME_TAB,
    key
})

export const setShortLinks = (shortLinks) => ({
    type: ActionTypes.SET_SHORT_LINKS,
    shortLinks
})

export const setPercentageData = (percent) => ({
    type: ActionTypes.SET_PERCENTAGE,
    percent
})

export const toggleExceedPopup = (status, exceedMessage) => ({
    type: ActionTypes.SHOW_EXCEED_POPUP,
    status,
    exceedMessage
})

export const setCurrentUploadItems = (totals) => ({
    type: ActionTypes.SET_CURRENT_UPLOAD_ITEMS,
    totals
})

export const setFullLoaderScreen = (value) => ({
    type: ActionTypes.SET_FULL_LOADER_SCREEN,
    value
})

export const setCurrentImportStatus = (status) => ({
    type: ActionTypes.SET_CURRENT_IMPORT_STATUS,
    status
})

export const showSingleFilePopup = (status) => ({
    type: ActionTypes.SHOW_SINGLE_FILE_POPUP,
    status
})
