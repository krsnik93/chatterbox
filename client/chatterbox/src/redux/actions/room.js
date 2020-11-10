export const GET_ROOMS_BEGIN = "GET_ROOMS_BEGIN";
export const GET_ROOMS_SUCCESS = "GET_ROOMS_SUCCESS";
export const GET_ROOMS_FAILURE = "GET_ROOMS_FAILURE";
export const ADD_ROOM_BEGIN = "ADD_ROOM_BEGIN";
export const ADD_ROOM_SUCCESS = "ADD_ROOM_SUCCESS";
export const ADD_ROOM_FAILURE = "ADD_ROOM_FAILURE";

export const getRoomsBegin = () => ({
  type: GET_ROOMS_BEGIN,
});

export const getRoomsSuccess = (rooms) => ({
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
