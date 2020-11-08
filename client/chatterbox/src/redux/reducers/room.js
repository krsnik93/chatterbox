import {
  GET_ROOMS_BEGIN,
  GET_ROOMS_FAILURE,
  GET_ROOMS_SUCCESS,
  CREATE_ROOM_BEGIN,
  CREATE_ROOM_SUCCESS,
  CREATE_ROOM_FAILURE,
} from "../actions/room";

const initialState = {
  rooms: [],
  createdRoom: null,
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
    case CREATE_ROOM_BEGIN:
      return {
        ...state,
        createdRoom: null,
        loading: true,
        error: null,
      };
    case CREATE_ROOM_SUCCESS:
      return {
        ...state,
        createdRoom: action.payload.room,
        loading: false,
        error: null,
      };
    case CREATE_ROOM_FAILURE:
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
