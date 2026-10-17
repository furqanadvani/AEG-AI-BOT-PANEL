import AI from "../constant/Ai.constant";

const initialState = {
  status: null,
  statusLoading: false,

  usage: [],
  usageLoading: false,

  settings: {},
  settingsLoading: false,
  updateLoading: false,

  testResult: null,
  testLoading: false,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case AI.GET_STATUS:
      return { ...state, statusLoading: action.loading, ...(action.data && { status: action.data }) };
    case AI.GET_USAGE:
      return { ...state, usageLoading: action.loading, ...(action.data && { usage: action.data }) };
    case AI.GET_SETTINGS:
      return { ...state, settingsLoading: action.loading, ...(action.data && { settings: action.data }) };
    case AI.UPDATE_SETTINGS:
      return { ...state, updateLoading: action.loading };
    case AI.TEST:
      return { ...state, testLoading: action.loading, ...(action.data && { testResult: action.data }) };
    default:
      return state;
  }
};
