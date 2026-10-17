import DASHBOARD from "../constant/Dashboard.constant";
import { get } from "../../utils/ApiMethods";
import { apiRequest } from "../../utils/ReduxHelpers";

export const getDashboardStats = (range = "30d") => (dispatch) =>
  apiRequest({ dispatch, type: DASHBOARD.GET_STATS, call: () => get("dashboard/stats", { range }), map: (d) => ({ data: d.data }) });

export const getRecentLeads = () => (dispatch) =>
  apiRequest({ dispatch, type: DASHBOARD.GET_RECENT_LEADS, call: () => get("leads", { limit: 6, sort: "-createdAt" }), map: (d) => ({ data: d.data }), silent: true });
