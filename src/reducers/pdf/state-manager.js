export default class PdfStateManager {
    static getAllPdfHighlights = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.pdfHighlights = data || [];
        }
        return state;
    };

    static getSinglePdfHighlight = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.singlePdfHighlight = [data] || [];
        }
        return state;
    };

    static getSinglePdfHighlightReset = (prevState, action) => {
        const state = { ...prevState };
        state.singlePdfHighlight = [];
        return state;
    };

    static getPdfDetails = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.pdfDetails = data || [];
        }
        return state;
    };

    static uploadPDFSuccess = (prevState, action) => {
        const state = { ...prevState };
        const { data } = action.payload;
        if (data) {
            state.uploadedPDF = [ ...state.uploadedPDF, data ];
        }
        return state;
    }

    static updatePDFSuccess = (prevState, action) => {
        const state             = { ...prevState };
        const { data }          = action.payload;
        if (data) {
            const idx               = state.uploadedPDF.findIndex((v) => { return v.id === data.id})
            state.uploadedPDF[idx]       = { 
                ...state.uploadedPDF[idx],
                ...data
            }
        }
        return state;
    };
}