import NOTIFICATIONS from "../constant/Notifications.constant";

const initialState = {
  list: [],
  unreadCount: 0,
  listLoading: false,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case NOTIFICATIONS.LIST:
      return {
        ...state,
        listLoading: action.loading,
        ...(action.data && { list: action.data, unreadCount: action.unreadCount }),
      };
    case NOTIFICATIONS.MARK_READ: {
      if (action.loading || action.failed) return state;
      const all = action.id === "all";
      const list = state.list.map((n) => (all || n._id === action.id ? { ...n, isRead: true } : n));
      return { ...state, list, unreadCount: list.filter((n) => !n.isRead).length };
    }
    default:
      return state;
  }
};
