export const SET_COUNTS_BEGIN = "SET_COUNTS_BEGIN";
export const SET_COUNTS_SUCCESS = "SET_COUNTS_SUCCESS";
export const SET_COUNTS_FAILURE = "SET_COUNTS_FAILURE";

export const setCountsBegin = () => ({
  type: SET_COUNTS_BEGIN,
});

export const setCountsSuccess = ({ unseen_messages }) => ({
  type: SET_COUNTS_SUCCESS,
  payload: { unseen_messages },
});

export const setCountsFailure = (error) => ({
  type: SET_COUNTS_FAILURE,
  payload: { error },
});
