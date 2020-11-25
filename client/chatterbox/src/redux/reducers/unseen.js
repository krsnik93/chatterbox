import {
  GET_COUNTS_BEGIN,
  GET_COUNTS_FAILURE,
  GET_COUNTS_SUCCESS,
} from "../actions/unseen";

const initialState = {
  counts: {},
  loading: false,
  error: null,
};

const unseenReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_COUNTS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_COUNTS_SUCCESS:
      return {
        counts:
          action.payload.operation === "update"
            ? {
                ...state.counts,
                ...action.payload.unseen_counts_by_room,
              }
            : action.payload.unseen_counts_by_room,
        loading: false,
        error: null,
      };
    case GET_COUNTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};
export default unseenReducer;
