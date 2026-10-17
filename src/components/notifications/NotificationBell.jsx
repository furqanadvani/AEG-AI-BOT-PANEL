import { useState } from "react";
import { Badge, Button, Tooltip } from "antd";
import { TbBell } from "react-icons/tb";
import { useSelector } from "react-redux";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import NotificationDrawer from "./NotificationDrawer";

/** Bell + unread count + drawer (page header aur mobile bar dono mein) */
const NotificationBell = () => {
  const { can } = useACL();
  const unreadCount = useSelector(({ notifications }) => notifications.unreadCount);
  const [open, setOpen] = useState(false);
  if (!can(ACL_MODULES.NOTIFICATIONS, ACL_ACCESS_LIST.VIEW)) return null;

  return (
    <>
      <Tooltip title="Notifications">
        <Badge count={unreadCount} size="small" offset={[-4, 4]}>
          <Button className="notification-bell" icon={<TbBell size={18} />} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} onClick={() => setOpen(true)} />
        </Badge>
      </Tooltip>
      <NotificationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default NotificationBell;
