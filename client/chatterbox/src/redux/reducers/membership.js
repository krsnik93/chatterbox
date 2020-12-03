import {
  GET_MEMBERSHIPS_BEGIN,
  GET_MEMBERSHIPS_FAILURE,
  GET_MEMBERSHIPS_SUCCESS,
  CREATE_MEMBERSHIPS_BEGIN,
  CREATE_MEMBERSHIPS_FAILURE,
  CREATE_MEMBERSHIPS_SUCCESS,
  DELETE_MEMBERSHIP,
} from "../actions/membership";

const initialState = {
  memberships: [],
  roomId: null,
  loadingGet: false,
  errorGet: null,
  loadingCreate: false,
  errorCreate: null,
};

const membershipReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_MEMBERSHIPS_BEGIN:
      return {
        ...state,
        loadingGet: true,
        errorGet: null,
      };
    case GET_MEMBERSHIPS_SUCCESS:
      return {
        ...state,
        memberships: action.payload.memberships,
        loadingGet: false,
        errorGet: null,
      };
    case GET_MEMBERSHIPS_FAILURE:
      return {
        ...state,
        loadingGet: false,
        errorGet: action.payload.error,
      };
    case CREATE_MEMBERSHIPS_BEGIN:
      return {
        ...state,
        roomId: action.payload.roomId,
        loadingCreate: true,
        errorCreate: null,
      };
    case CREATE_MEMBERSHIPS_SUCCESS:
      return {
        ...state,
        roomId: null,
        loadingCreate: false,
        errorCreate: null,
      };
    case CREATE_MEMBERSHIPS_FAILURE:
      return {
        ...state,
        roomId: null,
        loadingCreate: false,
        errorCreate: action.payload.errorCreate,
      };
    case DELETE_MEMBERSHIP:
      return {
        ...state,
        memberships: [...state.memberships].filter(
          (m) => m !== action.payload.roomId
        ),
      };
    default:
      return state;
  }
};
export default membershipReducer;
