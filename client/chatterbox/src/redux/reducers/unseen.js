import {
  SET_COUNTS_BEGIN,
  SET_COUNTS_FAILURE,
  SET_COUNTS_SUCCESS,
} from "../actions/unseen";

const initialState = {
  counts: {},
  loading: false,
  error: null,
};

const unseenReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_COUNTS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SET_COUNTS_SUCCESS:
      return {
        counts: action.payload.unseen_messages,
        loading: false,
        error: null,
      };
    case SET_COUNTS_FAILURE:
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
