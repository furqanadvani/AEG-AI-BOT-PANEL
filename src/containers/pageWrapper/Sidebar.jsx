import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "antd";
import { TbChevronDown, TbLock, TbLogout, TbUserCircle } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BrandLogo from "../../components/brandLogo/BrandLogo";
import UserAvatar from "../../components/userAvatar/UserAvatar";
import { logout } from "../../store/actions/Auth.action";
import { findActiveNav, getSidebarSections } from "../../routes/RouteConfig";
import { getFullName } from "../../utils/Methods";

const STORE_KEY = "AEG_SIDEBAR_COLLAPSED";

const readCollapsed = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
};

/** Sidebar: logo, sections (Bot / Administration / Catalog band ho sakte hain), neeche user */
const Sidebar = ({ onNavigate }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useSelector(({ auth }) => auth.user);
  const sections = useMemo(() => getSidebarSections(user), [user]);
  const active = findActiveNav(pathname);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  // Active page wala section hamesha khula dikhe
  const activeSection = sections.find((s) => s.items.some((i) => i.path === active?.path))?.key;

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(collapsed));
    } catch {
      /* storage band ho to bhi chale */
    }
  }, [collapsed]);

  const go = (path) => {
    navigate(path);
    onNavigate?.();
  };

  const fullName = getFullName(user);
  const userMenu = {
    items: [
      { key: "profile", icon: <TbUserCircle />, label: "My profile", onClick: () => go("/profile") },
      { key: "password", icon: <TbLock />, label: "Change password", onClick: () => go("/profile?tab=password") },
      { type: "divider" },
      { key: "logout", icon: <TbLogout />, label: "Sign out", danger: true, onClick: () => dispatch(logout()) },
    ],
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <button type="button" className="sidebar-logo-btn" onClick={() => go("/")} aria-label="Go to dashboard">
          <BrandLogo />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {sections.map((sec) => {
          const isCollapsed = sec.collapsible && collapsed[sec.key] && sec.key !== activeSection;
          return (
            <div className="sidebar-section" key={sec.key}>
              {sec.title && (
                <button
                  type="button"
                  className="sidebar-section-title"
                  aria-expanded={!isCollapsed}
                  onClick={() => sec.collapsible && setCollapsed((c) => ({ ...c, [sec.key]: !c[sec.key] }))}
                >
                  {sec.title}
                  {sec.collapsible && <TbChevronDown className={`sidebar-chevron ${isCollapsed ? "is-collapsed" : ""}`} />}
                </button>
              )}
              {!isCollapsed &&
                sec.items.map((item) => {
                  const isActive = active?.path === item.path;
                  return (
                    <button key={item.path} type="button" className={`sidebar-item ${isActive ? "is-active" : ""}`} aria-current={isActive ? "page" : undefined} onClick={() => go(item.path)}>
                      <span className="sidebar-item-icon">{item.icon}</span>
                      <span className="sidebar-item-label">{item.nav}</span>
                    </button>
                  );
                })}
            </div>
          );
        })}
      </nav>

      <Dropdown menu={userMenu} trigger={["click"]} placement="topLeft">
        <button type="button" className="sidebar-user" aria-label="Account menu">
          <UserAvatar name={fullName} size={36} />
          <span className="sidebar-user-meta">
            <span className="sidebar-user-name">{fullName}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </span>
          <TbChevronDown className="sidebar-user-chevron" />
        </button>
      </Dropdown>
    </div>
  );
};

export default Sidebar;
