import SETTINGS from "../constant/Settings.constant";
import { post, put } from "../../utils/ApiMethods";
import { apiRequest, createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(SETTINGS, "/settings", { label: "Setting" });

export const { getList: getSettings, save: saveSetting, setStatus: setSettingStatus, remove: deleteSetting } = crud;

/** { Key: "Value" } ek saath */
export const setSettingValues = (values, CB) => (dispatch) =>
  apiRequest({ dispatch, type: SETTINGS.SET_VALUES, call: () => put("settings", { values }), success: true, CB });

export const seedDefaultSettings = (CB) => (dispatch) =>
  apiRequest({ dispatch, type: SETTINGS.SEED, call: () => post("settings/seed-defaults", {}), success: true, CB });
