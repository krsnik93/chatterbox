import {
  getRoomsBegin,
  getRoomsFailure,
  getRoomsSuccess,
  addRoomBegin,
  addRoomSuccess,
  addRoomFailure,
  leaveRoomBegin,
  leaveRoomSuccess,
  leaveRoomFailure,
  deleteRoomBegin,
  deleteRoomSuccess,
  deleteRoomFailure,
} from "../actions/room";

import { api } from "../../axios";

export function getRooms(userId) {
  return (dispatch) => {
    dispatch(getRoomsBegin());
    return api
      .get(`/users/${userId}/rooms`)
      .then((response) => {
        const { rooms } = response.data;
        dispatch(getRoomsSuccess(rooms));
        return { rooms };
      })
      .catch((error) => {
        dispatch(getRoomsFailure(error));
      });
  };
}

export function addRoom(room) {
  return (dispatch) => {
    dispatch(addRoomBegin());
    try {
      dispatch(addRoomSuccess(room));
    } catch (error) {
      dispatch(addRoomFailure(error));
    }
  };
}

export function leaveRoom(userId, roomId) {
  return (dispatch) => {
    dispatch(leaveRoomBegin());
    return api
      .delete(`/users/${userId}/rooms/${roomId}/memberships`)
      .then((response) => {
        const { status } = response;
        if (status === 200) {
          const { room_id } = response.data;
          dispatch(leaveRoomSuccess(room_id));
        } else {
          dispatch(leaveRoomFailure(response));
        }
      })
      .catch((error) => {
        dispatch(leaveRoomFailure(error));
      });
  };
}

export function deleteRoom(userId, roomId) {
  return (dispatch) => {
    dispatch(deleteRoomBegin());
    return api
      .delete(`/users/${userId}/rooms/${roomId}`)
      .then((response) => {
        const { status } = response;
        if (status === 200) {
          const { room_id } = response.data;
          dispatch(deleteRoomSuccess(room_id));
        } else {
          dispatch(deleteRoomFailure(response));
        }
      })
      .catch((error) => {
        dispatch(deleteRoomFailure(error));
      });
  };
}
