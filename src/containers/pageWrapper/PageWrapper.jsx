import { useEffect, useState } from "react";
import { Button, Drawer } from "antd";
import { TbMenu2 } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import BrandLogo from "../../components/brandLogo/BrandLogo";
import NotificationBell from "../../components/notifications/NotificationBell";
import { getNotifications } from "../../store/actions/Notifications.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import Sidebar from "./Sidebar";
import "./PageWrapper.css";

const POLL_MS = 60 * 1000;

const PageWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { can } = useACL();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canSeeNotifications = can(ACL_MODULES.NOTIFICATIONS, ACL_ACCESS_LIST.VIEW);

  // Notifications: har minute (AI limit, new lead, human request)
  useEffect(() => {
    if (!canSeeNotifications) return undefined;
    dispatch(getNotifications());
    const t = setInterval(() => dispatch(getNotifications()), POLL_MS);
    return () => clearInterval(t);
  }, [dispatch, canSeeNotifications]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      {/* Mobile: upar chhoti bar, menu drawer mein */}
      <header className="app-mobile-bar">
        <Button type="text" icon={<TbMenu2 size={20} />} aria-label="Open menu" onClick={() => setIsMenuOpen(true)} />
        <BrandLogo tagline={false} />
        <NotificationBell />
      </header>

      <Drawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} placement="left" size={272} closable={false} styles={{ body: { padding: 0 } }}>
        <Sidebar onNavigate={() => setIsMenuOpen(false)} />
      </Drawer>

      <main className="app-content">{children}</main>
    </div>
  );
};

export default PageWrapper;
