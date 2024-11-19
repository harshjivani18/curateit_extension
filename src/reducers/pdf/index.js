import { S,  } from "../../utils/prefix";
import * as ActionTypes from "../../actions/pdf/action-types";
import PdfStateManager from "./state-manager";


const INITIAL_STATE = {
    pdfHighlights: [],
    singlePdfHighlight:[],
    pdfDetails: [],
    uploadedPDF: []
}

export default function pdfStates(state = INITIAL_STATE, action) {
    switch (action.type) {
        case S(ActionTypes.GET_ALL_PDF_HIGHLIGHT):
            return PdfStateManager.getAllPdfHighlights(state, action);
        case S(ActionTypes.GET_SINGLE_PDF_HIGHLIGHT):
            return PdfStateManager.getSinglePdfHighlight(state, action);
        case S(ActionTypes.GET_PDF_DETAILS):
            return PdfStateManager.getPdfDetails(state, action);
        case S(ActionTypes.UPLOAD_PDF):
            return PdfStateManager.uploadPDFSuccess(state, action)
        case S(ActionTypes.UPDATE_PDF):
            return PdfStateManager.updatePDFSuccess(state, action)
        case (ActionTypes.GET_SINGLE_PDF_HIGHLIGHT_RESET):
            return PdfStateManager.getSinglePdfHighlightReset(state, action);
        default:
            return state;
    }
}