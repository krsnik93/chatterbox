import {
  getRoomsBegin,
  getRoomsFailure,
  getRoomsSuccess,
  createRoomBegin,
  createRoomSuccess,
  createRoomFailure,
} from "../actions/room";
import { createMemberships } from "../middleware/membership";

import { api } from "../../utils";

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

export function createRoom(roomName, userId, usernames) {
  return (dispatch) => {
    dispatch(createRoomBegin());
    return api
      .post(`/users/${userId}/rooms`, {
        name: roomName,
        created_by: userId,
      })
      .then((response) => {
        const { room } = response.data;
        if (usernames.length > 0) {
          dispatch(createMemberships(userId, room.id, usernames));
        }
        dispatch(createRoomSuccess(room));
      })
      .catch((error) => {
        dispatch(createRoomFailure(error));
      });
  };
}
