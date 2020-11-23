import {
  GET_ROOMS_BEGIN,
  GET_ROOMS_FAILURE,
  GET_ROOMS_SUCCESS,
  ADD_ROOM_BEGIN,
  ADD_ROOM_SUCCESS,
  ADD_ROOM_FAILURE,
  LEAVE_ROOM_BEGIN,
  LEAVE_ROOM_SUCCESS,
  LEAVE_ROOM_FAILURE,
  DELETE_ROOM_BEGIN,
  DELETE_ROOM_SUCCESS,
  DELETE_ROOM_FAILURE,
} from "../actions/room";

const initialState = {
  rooms: [],
  page: null,
  pageCount: null,
  loadingGet: false,
  errorGet: null,
  loadingAdd: false,
  errorAdd: null,
  loadingLeave: false,
  errorLeave: null,
  loadingDelete: false,
  errorDelete: null,
};

const roomReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ROOMS_BEGIN:
      return {
        ...state,
        loadingGet: true,
        errorGet: null,
      };
    case GET_ROOMS_SUCCESS:
      return {
        rooms: state.rooms.concat(action.payload.rooms),
        page: action.payload.page,
        pageCount: action.payload.page_count,
        loadingGet: false,
        errorGet: null,
      };
    case GET_ROOMS_FAILURE:
      return {
        ...state,
        loadingGet: false,
        errorGet: action.payload.error,
      };
    case ADD_ROOM_BEGIN:
      return {
        ...state,
        loadingAdd: true,
        errorAdd: null,
      };
    case ADD_ROOM_SUCCESS:
      return {
        ...state,
        rooms: [action.payload.room].concat(state.rooms),
        loadingAdd: false,
        errorAdd: null,
      };
    case ADD_ROOM_FAILURE:
      return {
        ...state,
        loadingAdd: false,
        errorAdd: action.payload.error,
      };
    case LEAVE_ROOM_BEGIN:
      return {
        ...state,
        loadingLeave: true,
        errorLeave: null,
      };
    case LEAVE_ROOM_SUCCESS:
      return {
        ...state,
        rooms: state.rooms.filter(
          (room) => room.id !== parseInt(action.payload.roomId)
        ),
        loadingLeave: false,
        errorLeave: null,
      };
    case LEAVE_ROOM_FAILURE:
      return {
        ...state,
        loadingLeave: false,
        errorLeave: action.payload.error,
      };
    case DELETE_ROOM_BEGIN:
      return {
        ...state,
        loadingDelete: true,
        errorDelete: null,
      };
    case DELETE_ROOM_SUCCESS:
      return {
        ...state,
        rooms: state.rooms.filter(
          (room) => room.id !== parseInt(action.payload.roomId)
        ),
        loadingDelete: false,
        errorDelete: null,
      };
    case DELETE_ROOM_FAILURE:
      return {
        ...state,
        loadingDelete: false,
        errorDelete: action.payload.error,
      };
    default:
      return state;
  }
};
export default roomReducer;
