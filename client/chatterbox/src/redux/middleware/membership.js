import {
  getMembershipsBegin,
  getMembershipsSuccess,
  getMembershipsFailure,
  createMembershipsBegin,
  createMembershipsSuccess,
  createMembershipsFailure,
} from "../actions/membership";
import { api } from "../../axios";

export function getMemberships(userId) {
  return (dispatch) => {
    dispatch(getMembershipsBegin());
    return api
      .get(`/users/${userId}/memberships`)
      .then((response) => {
        const { memberships } = response.data;
        dispatch(getMembershipsSuccess(memberships));
      })
      .catch((error) => {
        dispatch(getMembershipsFailure(error));
      });
  };
}

export function createMemberships(userId, roomId, usernames) {
  return (dispatch) => {
    dispatch(createMembershipsBegin(roomId));
    return api
      .post(`/users/${userId}/rooms/${roomId}/memberships`, { usernames })
      .then((response) => {
        dispatch(createMembershipsSuccess());
      })
      .catch((error) => {
        dispatch(createMembershipsFailure(error));
      });
  };
}
