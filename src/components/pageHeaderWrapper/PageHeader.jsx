import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../notifications/NotificationBell";
import "./PageHeader.css";

/** Title (left) + actions + notification bell (right), neeche patli line */
const PageHeader = ({ title, subtitle, renderBack = false, backTo, actions, extra }) => {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="page-header-row">
        <div className="page-header-left">
          {renderBack && (
            <Button className="page-header-back" shape="circle" icon={<ArrowLeftOutlined />} aria-label="Go back" onClick={() => (backTo ? navigate(backTo) : navigate(-1))} />
          )}
          <div className="flex-1">
            <h1 className="page-header-title">{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="page-header-actions">
          {actions}
          <span className="page-header-bell">
            <NotificationBell />
          </span>
        </div>
      </div>
      {extra}
    </div>
  );
};

export default PageHeader;
