export const GET_COUNTS_BEGIN = "GET_COUNTS_BEGIN";
export const GET_COUNTS_SUCCESS = "GET_COUNTS_SUCCESS";
export const GET_COUNTS_FAILURE = "GET_COUNTS_FAILURE";

export const getCountsBegin = () => ({
  type: GET_COUNTS_BEGIN,
});

export const getCountsSuccess = ({ unseen_counts_by_room, operation }) => ({
  type: GET_COUNTS_SUCCESS,
  payload: { unseen_counts_by_room, operation },
});

export const getCountsFailure = (error) => ({
  type: GET_COUNTS_FAILURE,
  payload: { error },
});
