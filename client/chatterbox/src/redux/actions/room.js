export const GET_ROOMS_BEGIN = "GET_ROOMS_BEGIN";
export const GET_ROOMS_SUCCESS = "GET_ROOMS_SUCCESS";
export const GET_ROOMS_FAILURE = "GET_ROOMS_FAILURE";
export const ADD_ROOM_BEGIN = "ADD_ROOM_BEGIN";
export const ADD_ROOM_SUCCESS = "ADD_ROOM_SUCCESS";
export const ADD_ROOM_FAILURE = "ADD_ROOM_FAILURE";
export const LEAVE_ROOM_BEGIN = "LEAVE_ROOM_BEGIN";
export const LEAVE_ROOM_SUCCESS = "LEAVE_ROOM_SUCCESS";
export const LEAVE_ROOM_FAILURE = "LEAVE_ROOM_FAILURE";
export const DELETE_ROOM_BEGIN = "DELETE_ROOM_BEGIN";
export const DELETE_ROOM_SUCCESS = "DELETE_ROOM_SUCCESS";
export const DELETE_ROOM_FAILURE = "DELETE_ROOM_FAILURE";
export const SORT_ROOMS = "SORT_ROOMS";

export const getRoomsBegin = () => ({
  type: GET_ROOMS_BEGIN,
});

export const getRoomsSuccess = ({ rooms }) => ({
  type: GET_ROOMS_SUCCESS,
  payload: { rooms },
});

export const getRoomsFailure = (error) => ({
  type: GET_ROOMS_FAILURE,
  payload: { error },
});

export const addRoomBegin = () => ({
  type: ADD_ROOM_BEGIN,
});

export const addRoomSuccess = (room) => ({
  type: ADD_ROOM_SUCCESS,
  payload: { room },
});

export const addRoomFailure = (error) => ({
  type: ADD_ROOM_FAILURE,
  payload: { error },
});

export const leaveRoomBegin = () => ({
  type: LEAVE_ROOM_BEGIN,
});

export const leaveRoomSuccess = (roomId) => ({
  type: LEAVE_ROOM_SUCCESS,
  payload: { roomId },
});

export const leaveRoomFailure = (error) => ({
  type: LEAVE_ROOM_FAILURE,
  payload: { error },
});

export const deleteRoomBegin = () => ({
  type: DELETE_ROOM_BEGIN,
});

export const deleteRoomSuccess = (roomId) => ({
  type: DELETE_ROOM_SUCCESS,
  payload: { roomId },
});

export const deleteRoomFailure = (error) => ({
  type: DELETE_ROOM_FAILURE,
  payload: { error },
});

export const sortRooms = (messages, unseenMessageCounts) => ({
  type: SORT_ROOMS,
  payload: { messages, unseenMessageCounts },
});
