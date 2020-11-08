import {
  CREATE_MEMBERSHIPS_BEGIN,
  CREATE_MEMBERSHIPS_FAILURE,
  CREATE_MEMBERSHIPS_SUCCESS,
} from "../actions/membership";

const initialState = {
  roomId: null,
  loading: false,
  error: null,
};

const membershipReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_MEMBERSHIPS_BEGIN:
      return {
        ...state,
        roomId: action.payload.roomId,
        loading: true,
        error: null,
      };
    case CREATE_MEMBERSHIPS_SUCCESS:
      return {
        ...state,
        roomId: null,
        loading: false,
        error: null,
      };
    case CREATE_MEMBERSHIPS_FAILURE:
      return {
        ...state,
        roomId: null,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};
export default membershipReducer;
