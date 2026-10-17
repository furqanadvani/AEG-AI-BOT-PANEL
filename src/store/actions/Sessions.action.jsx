import SESSIONS from "../constant/Sessions.constant";
import { get, patch, post } from "../../utils/ApiMethods";
import { apiRequest, createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(SESSIONS, "/sessions", { label: "Conversation" });

export const { getList: getSessions, getDetail: getSessionDetail, remove: deleteSession } = crud;

export const resetSession = (id, CB) => (dispatch) =>
  apiRequest({ dispatch, type: SESSIONS.RESET, call: () => post(`sessions/${id}/reset`, {}), map: (d) => ({ data: d.data }), success: true, CB });

export const setTakeover = (id, humanTakeover, CB) => (dispatch) =>
  apiRequest({ dispatch, type: SESSIONS.TAKEOVER, call: () => patch(`sessions/${id}/takeover`, { humanTakeover }), map: (d) => ({ data: d.data }), success: true, CB });

export const getSessionLogs = (sessionId) => (dispatch) =>
  apiRequest({ dispatch, type: SESSIONS.LOGS, call: () => get("chat-logs", { sessionId, sort: "createdAt", limit: 200 }), map: (d) => ({ data: d.data }), silent: true });

/** Poori chat (transcript; purane sessions mein logs ya short history) */
export const getSessionTranscript = (id) => (dispatch) =>
  apiRequest({ dispatch, type: SESSIONS.TRANSCRIPT, call: () => get(`sessions/${id}/transcript`), map: (d) => ({ data: d.data }), extra: { id } });
