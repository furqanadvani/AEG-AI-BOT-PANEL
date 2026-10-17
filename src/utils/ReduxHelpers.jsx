/**
 * Reusable Redux helpers: har module ka constant / action / reducer isi pattern par hai
 * (reference repo jaisa: dispatch({ type, loading, data })), bas try/catch baar baar nahi likhna parta.
 */
import { del, get, patch, post, put } from "./ApiMethods";
import { getErrorMessage, handleError, handleSuccess } from "./Methods";

export const createConstants = (prefix, extra = []) => {
  const base = ["LIST", "DETAIL", "SAVE", "STATUS", "DELETE", "BULK", ...extra];
  return Object.fromEntries(base.map((k) => [k, `${prefix}_${k}`]));
};

/**
 * Ek API call: loading -> success/fail. Kabhi throw nahi karta.
 *   map(data) = reducer ko kya bhejna hai
 *   success   = true (backend message) | string | false
 */
export const apiRequest = async ({ dispatch, type, call, map, success = false, errorMessage, CB, extra = {}, silent = false }) => {
  dispatch({ type, loading: true, ...extra });
  try {
    const { data } = await call();
    if (data?.error) {
      const err = new Error(data.message);
      err.response = { data };
      throw err;
    }
    dispatch({ type, loading: false, ...extra, ...(map ? map(data) : {}) });
    if (success) handleSuccess(typeof success === "string" ? success : data?.message);
    if (CB) CB(data?.data, data);
    return data;
  } catch (error) {
    dispatch({ type, loading: false, failed: true, ...extra });
    if (!silent) handleError(getErrorMessage(error, errorMessage));
    return null;
  }
};

const listMap = (data) => ({ data: data?.data || [], pagination: data?.meta?.pagination || null });

/**
 * CRUD actions ek endpoint ke liye.
 *   updateMethod: "put" | "patch"
 *   statusBody:   status toggle ki body
 */
export const createCrudActions = (C, endpoint, { label = "Record", updateMethod = "put", statusBody = (isActive) => ({ isActive }) } = {}) => ({
  getList: (params = {}, CB) => (dispatch) =>
    apiRequest({ dispatch, type: C.LIST, call: () => get(endpoint, params), map: listMap, CB, errorMessage: `Could not load ${label} list` }),

  getDetail: (id, CB) => (dispatch) =>
    apiRequest({ dispatch, type: C.DETAIL, call: () => get(`${endpoint}/${id}`), map: (d) => ({ data: d.data }), CB }),

  save: (payload, CB) => (dispatch) => {
    const { _id, ...body } = payload;
    const call = _id ? () => (updateMethod === "patch" ? patch : put)(`${endpoint}/${_id}`, body) : () => post(endpoint, body);
    return apiRequest({ dispatch, type: C.SAVE, call, success: true, CB });
  },

  setStatus: (id, isActive, CB) => (dispatch) =>
    apiRequest({ dispatch, type: C.STATUS, call: () => patch(`${endpoint}/${id}/status`, statusBody(isActive)), success: true, CB, extra: { id } }),

  remove: (id, CB) => (dispatch) =>
    apiRequest({ dispatch, type: C.DELETE, call: () => del(`${endpoint}/${id}`), success: true, CB, extra: { id } }),

  bulk: (rows, CB) => (dispatch) =>
    apiRequest({ dispatch, type: C.BULK, call: () => post(`${endpoint}/bulk`, { rows }), success: true, CB }),
});

export const crudInitialState = {
  list: [],
  pagination: null,
  listLoading: false,

  detail: null,
  detailLoading: false,

  saveLoading: false,

  actionLoading: false,
  actionId: null,
};

/** Standard reducer + module ke extra cases */
export const createCrudReducer = (C, { initial = {}, cases = {} } = {}) => {
  const initialState = { ...crudInitialState, ...initial };
  return (state = initialState, action = {}) => {
    if (cases[action.type]) return cases[action.type](state, action);
    switch (action.type) {
      case C.LIST:
        return {
          ...state,
          listLoading: action.loading,
          ...(action.data && { list: action.data }),
          ...(action.pagination !== undefined && { pagination: action.pagination }),
        };
      case C.DETAIL:
        return { ...state, detailLoading: action.loading, ...(action.data !== undefined && { detail: action.data }) };
      case C.SAVE:
      case C.BULK:
        return { ...state, saveLoading: action.loading };
      case C.STATUS:
      case C.DELETE:
        return { ...state, actionLoading: action.loading, actionId: action.loading ? action.id : null };
      default:
        return state;
    }
  };
};
