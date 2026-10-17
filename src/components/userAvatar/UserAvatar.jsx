import { Avatar } from "antd";
import { getColorFromName, getInitials } from "../../utils/Methods";

const UserAvatar = ({ name, size = 36, className = "" }) => (
  <Avatar size={size} className={className} style={{ background: getColorFromName(name), fontWeight: 600, flexShrink: 0 }}>
    {getInitials(name)}
  </Avatar>
);

export default UserAvatar;
