import SESSIONS from "../constant/Sessions.constant";
import { createCrudReducer } from "../../utils/ReduxHelpers";

// reset / takeover ka jawab populated customer ke baghair aata hai: purana customer rakho
const mergeDetail = (key) => (state, action) => ({
  ...state,
  [key]: action.loading,
  ...(action.data && { detail: { ...state.detail, ...action.data, customer: state.detail?.customer } }),
});

export default createCrudReducer(SESSIONS, {
  initial: { logs: [], logsLoading: false, resetLoading: false, takeoverLoading: false, transcript: null, transcriptFor: null, transcriptLoading: false },
  cases: {
    [SESSIONS.RESET]: mergeDetail("resetLoading"),
    [SESSIONS.TAKEOVER]: mergeDetail("takeoverLoading"),
    [SESSIONS.TRANSCRIPT]: (state, action) => ({
      ...state,
      transcriptLoading: action.loading,
      ...(action.loading && action.id !== state.transcriptFor && { transcript: null }),
      transcriptFor: action.id,
      ...(action.data && { transcript: action.data }),
    }),
    [SESSIONS.LOGS]: (state, action) => ({ ...state, logsLoading: action.loading, ...(action.data && { logs: action.data }) }),
  },
});
