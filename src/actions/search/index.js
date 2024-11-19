import * as ActionTypes from "./action-types";

export const getSearchBooks = (name) => ({
    type: ActionTypes.SEARCH_BOOKS,
    payload: {
        request: {
            url: `api/book-list?name=${name}`,
            method: "get",
        }
    }
})

export const getSelectedBook = (id) => ({
    type: ActionTypes.CREATE_BOOK_GEM,
    payload: {
        request: {
            url: `/api/book-details?bookId=${id}`,
            method: "get",
        }
    }
})

export const getSearchMovies = (name) => ({
    type: ActionTypes.SEARCH_MOVIES,
    payload: {
        request: {
            url: `api/movies-list?name=${name}`,
            method: "get",
        }
    }
})

export const getSelectedMovie = (id) => ({
    type: ActionTypes.CREATE_MOVIE_GEM,
    payload: {
        request: {
            url: `/api/movie-details?imdbId=${id}`,
            method: "get",
        }
    }
})