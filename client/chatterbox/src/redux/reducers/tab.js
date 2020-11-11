import { SET_ACTIVE_ROOM_ID, CLEAR_ACTIVE_ROOM_ID } from "../actions/tab";

const initialState = {
  activeRoom: null,
};

const tabReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ACTIVE_ROOM_ID:
      return {
        ...state,
        activeRoomId: action.payload.roomId,
      };
    case CLEAR_ACTIVE_ROOM_ID:
      return {
        ...state,
        activeRoomId: null,
      };
    default:
      return state;
  }
};
export default tabReducer;
