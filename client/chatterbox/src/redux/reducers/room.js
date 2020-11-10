import {
  GET_ROOMS_BEGIN,
  GET_ROOMS_FAILURE,
  GET_ROOMS_SUCCESS,
  ADD_ROOM_BEGIN,
  ADD_ROOM_SUCCESS,
  ADD_ROOM_FAILURE,
} from "../actions/room";

const initialState = {
  rooms: [],
  loading: false,
  error: null,
};

const roomReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ROOMS_BEGIN:
      return {
        ...state,
        rooms: [],
        loading: true,
        error: null,
      };
    case GET_ROOMS_SUCCESS:
      return {
        ...state,
        rooms: action.payload.rooms,
        loading: false,
        error: null,
      };
    case GET_ROOMS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case ADD_ROOM_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ADD_ROOM_SUCCESS:
      return {
        ...state,
        rooms: [action.payload.room].concat(state.rooms),
        loading: false,
        error: null,
      };
    case ADD_ROOM_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};
export default roomReducer;
