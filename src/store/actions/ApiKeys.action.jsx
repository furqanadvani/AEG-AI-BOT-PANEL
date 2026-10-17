import API_KEYS from "../constant/ApiKeys.constant";
import { post } from "../../utils/ApiMethods";
import { apiRequest, createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(API_KEYS, "/api-keys", { label: "API key" });

export const { getList: getApiKeys, setStatus: setApiKeyStatus, remove: deleteApiKey } = crud;

/** Create par raw key sirf ek dafa aati hai: reducer mein `revealed` */
export const saveApiKey = (payload, CB) => (dispatch) =>
  crud.save(payload, (data) => {
    if (data?.key) dispatch({ type: API_KEYS.REGENERATE, loading: false, data });
    CB && CB(data);
  })(dispatch);

export const regenerateApiKey = (id, CB) => (dispatch) =>
  apiRequest({ dispatch, type: API_KEYS.REGENERATE, call: () => post(`api-keys/${id}/regenerate`, {}), map: (d) => ({ data: d.data }), success: true, CB, extra: { id } });

export const clearRevealedKey = () => ({ type: API_KEYS.CLEAR_REVEALED });
