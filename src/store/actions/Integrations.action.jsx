import INTEGRATIONS from "../constant/Integrations.constant";
import { get, post, put } from "../../utils/ApiMethods";
import { apiRequest } from "../../utils/ReduxHelpers";

export const getIntegrations = () => (dispatch) =>
  apiRequest({ dispatch, type: INTEGRATIONS.LIST, call: () => get("integrations"), map: (d) => ({ data: d.data }) });

export const saveIntegration = (type, payload, CB) => (dispatch) =>
  apiRequest({
    dispatch,
    type: INTEGRATIONS.SAVE,
    call: () => put(`integrations/${type}`, payload),
    map: (d) => ({ data: d.data }),
    success: true,
    extra: { integrationType: type },
    CB,
  });

export const testIntegration = (type) => (dispatch) =>
  apiRequest({
    dispatch,
    type: INTEGRATIONS.TEST,
    call: () => post(`integrations/${type}/test`, {}),
    map: (d) => ({ data: d.data }),
    extra: { integrationType: type },
    CB: () => dispatch(getIntegrations()),
  });
