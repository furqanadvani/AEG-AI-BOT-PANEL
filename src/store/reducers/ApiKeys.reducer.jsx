import API_KEYS from "../constant/ApiKeys.constant";
import { createCrudReducer } from "../../utils/ReduxHelpers";

export default createCrudReducer(API_KEYS, {
  initial: { revealed: null, regenerateLoading: false },
  cases: {
    [API_KEYS.REGENERATE]: (state, action) => ({
      ...state,
      regenerateLoading: action.loading,
      ...(action.data?.key && { revealed: action.data }),
    }),
    [API_KEYS.CLEAR_REVEALED]: (state) => ({ ...state, revealed: null }),
  },
});
