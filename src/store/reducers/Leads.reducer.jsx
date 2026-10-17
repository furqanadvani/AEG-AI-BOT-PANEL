import LEADS from "../constant/Leads.constant";
import { createCrudReducer } from "../../utils/ReduxHelpers";

// status / assign / note ke baad backend updated lead deta hai: detail wahin update
const withDetail = (key) => (state, action) => ({ ...state, [key]: action.loading, ...(action.data && { detail: action.data }) });

export default createCrudReducer(LEADS, {
  initial: { statuses: [], updateStatusLoading: false, assignLoading: false, addNoteLoading: false, crmSyncLoading: false },
  cases: {
    [LEADS.STATUSES]: (state, action) => ({ ...state, ...(action.data && { statuses: action.data }) }),
    [LEADS.UPDATE_STATUS]: withDetail("updateStatusLoading"),
    [LEADS.ASSIGN]: withDetail("assignLoading"),
    [LEADS.ADD_NOTE]: withDetail("addNoteLoading"),
    [LEADS.CRM_SYNC]: (state, action) => ({ ...state, crmSyncLoading: action.loading }),
  },
});
