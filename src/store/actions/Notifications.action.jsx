import NOTIFICATIONS from "../constant/Notifications.constant";
import { get, patch } from "../../utils/ApiMethods";
import { apiRequest } from "../../utils/ReduxHelpers";

export const getNotifications = (params = { limit: 30 }) => (dispatch) =>
  apiRequest({
    dispatch,
    type: NOTIFICATIONS.LIST,
    call: () => get("notifications", params),
    map: (d) => ({ data: d.data, unreadCount: d.meta?.unreadCount || 0 }),
    silent: true,
  });

/** id = notification id ya "all" */
export const markNotificationRead = (id) => (dispatch) =>
  apiRequest({ dispatch, type: NOTIFICATIONS.MARK_READ, call: () => patch(`notifications/${id}/read`, {}), extra: { id }, silent: true });
