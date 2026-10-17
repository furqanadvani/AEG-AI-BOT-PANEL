import LEADS from "../constant/Leads.constant";
import { get, patch, post } from "../../utils/ApiMethods";
import { apiRequest, createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(LEADS, "/leads", { label: "Lead" });

export const { getList: getLeads, getDetail: getLeadDetail, save: saveLead, remove: deleteLead } = crud;

export const getLeadStatuses = () => (dispatch) =>
  apiRequest({ dispatch, type: LEADS.STATUSES, call: () => get("leads/statuses"), map: (d) => ({ data: d.data }), silent: true });

export const updateLeadStatus = (id, status, CB) => (dispatch) =>
  apiRequest({ dispatch, type: LEADS.UPDATE_STATUS, call: () => patch(`leads/${id}/status`, { status }), map: (d) => ({ data: d.data }), success: true, CB });

export const assignLead = (id, agentId, CB) => (dispatch) =>
  apiRequest({ dispatch, type: LEADS.ASSIGN, call: () => patch(`leads/${id}/assign`, { agentId }), map: (d) => ({ data: d.data }), success: true, CB });

export const addLeadNote = (id, text, CB) => (dispatch) =>
  apiRequest({ dispatch, type: LEADS.ADD_NOTE, call: () => post(`leads/${id}/notes`, { text }), map: (d) => ({ data: d.data }), success: "Note added", CB });

export const syncLeadCrm = (id, CB) => (dispatch) =>
  apiRequest({ dispatch, type: LEADS.CRM_SYNC, call: () => post(`leads/${id}/crm-sync`, {}), success: true, CB });
