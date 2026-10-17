import { Badge, Button, Drawer, Empty, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { markNotificationRead } from "../../store/actions/Notifications.action";
import { fromNow } from "../../utils/Methods";
import "./Notifications.css";

const LEVEL_COLORS = { info: "#2563EB", success: "#16A34A", warning: "#D97706", error: "#DC2626" };

// Notification type -> kahan le jana hai
const linkFor = (n) => {
  if (n.type === "NEW_LEAD" && n.meta?._id) return `/leads/${n.meta._id}`;
  if (n.type === "HUMAN_REQUEST") return "/queries?type=HUMAN";
  if (String(n.type).startsWith("AI_")) return "/ai-control";
  if (n.type === "INTEGRATION_ERROR") return "/integrations";
  return null;
};

const NotificationDrawer = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, unreadCount, listLoading } = useSelector(({ notifications }) => notifications);

  const openItem = (n) => {
    if (!n.isRead) dispatch(markNotificationRead(n._id));
    const to = linkFor(n);
    if (to) {
      onClose();
      navigate(to);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size={420}
      title={
        <span className="d-flex align-item-center gap-10">
          Notifications <Badge count={unreadCount} />
        </span>
      }
      extra={unreadCount > 0 && <Button size="small" onClick={() => dispatch(markNotificationRead("all"))}>Mark all read</Button>}
    >
      <Spin spinning={listLoading && !list.length}>
        {!list.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="You're all caught up" />}
        {list.map((n) => (
          <button type="button" key={n._id} className={`notif-item ${n.isRead ? "is-read" : ""}`} onClick={() => openItem(n)}>
            <span className="notif-dot" style={{ background: n.isRead ? "#D1D5DB" : LEVEL_COLORS[n.level] || LEVEL_COLORS.info }} />
            <span className="flex-1">
              <div className="notif-title">{n.title}</div>
              {n.message && <div className="notif-message">{n.message}</div>}
              <div className="notif-time">{fromNow(n.createdAt)}</div>
            </span>
          </button>
        ))}
      </Spin>
    </Drawer>
  );
};

export default NotificationDrawer;
