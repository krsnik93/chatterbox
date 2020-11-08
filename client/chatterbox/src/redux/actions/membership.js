export const CREATE_MEMBERSHIPS_BEGIN = "CREATE_MEMBERSHIPS_BEGIN";
export const CREATE_MEMBERSHIPS_SUCCESS = "CREATE_MEMBERSHIPS_SUCCESS";
export const CREATE_MEMBERSHIPS_FAILURE = "CREATE_MEMBERSHIPS_FAILURE";

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
