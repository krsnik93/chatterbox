export const GET_MEMBERSHIPS_BEGIN = "GET_MEMBERSHIPS_BEGIN";
export const GET_MEMBERSHIPS_SUCCESS = "GET_MEMBERSHIPS_SUCCESS";
export const GET_MEMBERSHIPS_FAILURE = "GET_MEMBERSHIPS_FAILURE";
export const CREATE_MEMBERSHIPS_BEGIN = "CREATE_MEMBERSHIPS_BEGIN";
export const CREATE_MEMBERSHIPS_SUCCESS = "CREATE_MEMBERSHIPS_SUCCESS";
export const CREATE_MEMBERSHIPS_FAILURE = "CREATE_MEMBERSHIPS_FAILURE";
export const DELETE_MEMBERSHIP = "DELETE_MEMBERSHIP";

export const getMembershipsBegin = (roomId) => ({
  type: GET_MEMBERSHIPS_BEGIN,
  payload: { roomId },
});

export const getMembershipsSuccess = (memberships) => ({
  type: GET_MEMBERSHIPS_SUCCESS,
  payload: { memberships },
});

export const getMembershipsFailure = (error) => ({
  type: GET_MEMBERSHIPS_FAILURE,
  payload: { error },
});

export const createMembershipsBegin = (roomId) => ({
  type: CREATE_MEMBERSHIPS_BEGIN,
  payload: { roomId },
});

export const createMembershipsSuccess = () => ({
  type: CREATE_MEMBERSHIPS_SUCCESS,
  payload: {},
});

export const createMembershipsFailure = (error) => ({
  type: CREATE_MEMBERSHIPS_FAILURE,
  payload: { error },
});

export const deleteMembership = (roomId) => ({
  type: DELETE_MEMBERSHIP,
  payload: { roomId },
});
