import DASHBOARD from "../constant/Dashboard.constant";

const initialState = {
  stats: null,
  statsLoading: false,

  recentLeads: [],
  recentLeadsLoading: false,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case DASHBOARD.GET_STATS:
      return { ...state, statsLoading: action.loading, ...(action.data && { stats: action.data }) };
    case DASHBOARD.GET_RECENT_LEADS:
      return { ...state, recentLeadsLoading: action.loading, ...(action.data && { recentLeads: action.data }) };
    default:
      return state;
  }
};
