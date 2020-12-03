import queryString from "query-string";

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

export function getRooms({ userId, idsToFetch = [], idsToSkip = [] } = {}) {
  return (dispatch) => {
    dispatch(getRoomsBegin());

    const queryStr = queryString.stringify(
      { ids_to_fetch: idsToFetch, ids_to_skip: idsToSkip },
      { arrayFormat: "none" }
    );

    return api
      .get(`/users/${userId}/rooms?${queryStr}`)
      .then((response) => {
        const { data } = response;
        dispatch(getRoomsSuccess(data));
        return { data };
      })
      .catch((error) => {
        dispatch(getRoomsFailure(error.toString()));
      });
  };
}

export function addRoom(room) {
  return (dispatch) => {
    dispatch(addRoomBegin());
    try {
      dispatch(addRoomSuccess(room));
      return Promise.resolve(room);
    } catch (error) {
      dispatch(addRoomFailure(error));
      return Promise.resolve(false);
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
          return Promise.resolve(true);
        } else {
          dispatch(leaveRoomFailure(response));
          return Promise.resolve(false);
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
          return Promise.resolve(true);
        } else {
          dispatch(deleteRoomFailure(response));
          return Promise.resolve(false);
        }
      })
      .catch((error) => {
        dispatch(deleteRoomFailure(error));
      });
  };
}
