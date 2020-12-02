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
  SORT_ROOMS,
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
    case SORT_ROOMS:
      return {
        ...state,
        rooms: [...state.rooms].sort((room1, room2) => {
          const room1Messages = action.payload.messages[room1.id];
          const room2Messages = action.payload.messages[room2.id];
          const room1LatestMsg = new Date(
            Math.max(...(room1Messages || []).map((m) => new Date(m.sent_at)))
          );
          const room2LatestMsg = new Date(
            Math.max(...(room2Messages || []).map((m) => new Date(m.sent_at)))
          );
          const room1LatestUnseen = new Date(
            action.payload.unseenMessageCounts?.[room1.id]?.max_datetime
          );
          const room2LatestUnseen = new Date(
            action.payload.unseenMessageCounts?.[room2.id]?.max_datetime
          );
          const room1CreatedAt = new Date(room1.created_at);
          const room2CreatedAt = new Date(room2.created_at);
          const room1Dates = [
            room1LatestMsg,
            room1LatestUnseen,
            room1CreatedAt,
          ].filter((date) => date instanceof Date && isFinite(date));
          const room2Dates = [
            room2LatestMsg,
            room2LatestUnseen,
            room2CreatedAt,
          ].filter((date) => date instanceof Date && isFinite(date));
          const room2MaxDate = Math.max(...room2Dates);
          const room1MaxDate = Math.max(...room1Dates);
          return room2MaxDate - room1MaxDate;
        }),
      };
    default:
      return state;
  }
};
export default roomReducer;
