import AI from "../constant/Ai.constant";
import { get, post, put } from "../../utils/ApiMethods";
import { apiRequest } from "../../utils/ReduxHelpers";

const dataMap = (d) => ({ data: d.data });

export const getAiStatus = () => (dispatch) => apiRequest({ dispatch, type: AI.GET_STATUS, call: () => get("ai/status"), map: dataMap });

export const getAiUsage = (period = "day", limit = 14) => (dispatch) =>
  apiRequest({ dispatch, type: AI.GET_USAGE, call: () => get("ai/usage", { period, limit }), map: dataMap, silent: true });

export const getAiSettings = () => (dispatch) => apiRequest({ dispatch, type: AI.GET_SETTINGS, call: () => get("ai/settings"), map: dataMap });

/** Response mein naya status aata hai */
export const updateAiSettings = (values, CB) => (dispatch) =>
  apiRequest({
    dispatch,
    type: AI.UPDATE_SETTINGS,
    call: () => put("ai/settings", { values }),
    map: dataMap,
    success: true,
    CB: (status) => {
      dispatch({ type: AI.GET_STATUS, loading: false, data: status });
      dispatch(getAiSettings());
      CB && CB();
    },
  });

export const testAi = () => (dispatch) => apiRequest({ dispatch, type: AI.TEST, call: () => post("ai/test", {}), map: dataMap });
