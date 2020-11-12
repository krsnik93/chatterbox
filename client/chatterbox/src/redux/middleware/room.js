import {
  getRoomsBegin,
  getRoomsFailure,
  getRoomsSuccess,
  addRoomBegin,
  addRoomSuccess,
  addRoomFailure,
} from "../actions/room";
import { createMemberships } from "../middleware/membership";

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
