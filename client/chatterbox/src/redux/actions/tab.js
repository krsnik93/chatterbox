export const SET_ACTIVE_ROOM_ID = "SET_ACTIVE_ROOM_ID";
export const CLEAR_ACTIVE_ROOM_ID = "CLEAR_ACTIVE_ROOM_ID";

export const setActiveRoomId = (roomId) => ({
  type: SET_ACTIVE_ROOM_ID,
  payload: { roomId },
});

export const clearActiveRoomId = () => ({
  type: CLEAR_ACTIVE_ROOM_ID,
});
