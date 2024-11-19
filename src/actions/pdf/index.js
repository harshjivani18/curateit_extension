import * as ActionTypes from "./action-types";

export const addPdfHighlight = (data) => (
  {
  type: ActionTypes.ADD_PDF_HIGHLIGHT,
  payload: {
      request: {
          url: `/api/highlightpdf`,
          method: "post",
          data
      }
  }
});

export const getAllPdfHighlights = (url) => (
    {
    type: ActionTypes.GET_ALL_PDF_HIGHLIGHT,
    payload: {
        request: {
            url: `/api/highlightpdf?url=${url}&type=Highlight`,
            method: "get"
        }
    }
});

export const updatePdfHighlight = (collectionId,gemId,data) => ({
    type: ActionTypes.UPDATE_PDF_HIGHLIGHT,
    payload: {
      request: {
        url: `/api/collections/${collectionId}/highlightpdf/${gemId}`,
        method: "put",
        data
      },
    },
  });

export const deletePdfHighlight = (collectionId,gemId) => ({
    type: ActionTypes.DELETE_PDF_HIGHLIGHT,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/highlightpdf/${gemId}`,
            method: "delete",
        }
    },
})

export const getSinglePdfHighlight = (collectionId,gemId) => (
    {
    type: ActionTypes.GET_SINGLE_PDF_HIGHLIGHT,
    payload: {
        request: {
            url: `/api/collections/${collectionId}/highlightpdf/${gemId}`,
            method: "get"
        }
    }
});

export const singlePdfHighlightReset = () => {
    return{
    type: ActionTypes.GET_SINGLE_PDF_HIGHLIGHT_RESET
  }};

export const getPdfDetails = (url) => (
    {
    type: ActionTypes.GET_PDF_DETAILS,
    payload: {
        request: {
            url: `/api/highlightpdf?url=${url}&type=PDF`,
            method: "get"
        }
    }
});

export const createPdf = (data) => ({
    type: ActionTypes.UPLOAD_PDF,
    payload: {
        request: {
            url: `/api/pdf`,
            method: "post",
            data
        }
    }
})

export const updatePdf = (data, id) => ({
    type: ActionTypes.UPDATE_PDF,
    payload: {
        request: {
            url: `/api/pdf/${id}`,
            method: "put",
            data
        }
    }
})

export const savePDFUrl = (url) => (
  {
  type: ActionTypes.SAVE_PDF_URL,
  payload: {
      request: {
          url: `/api/pdfstore?file=${encodeURIComponent(url)}`,
          method: "post",
      }
  }
});