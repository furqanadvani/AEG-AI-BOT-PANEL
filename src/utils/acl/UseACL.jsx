import { useSelector } from "react-redux";
import { canUser, getPermissions } from "./Helper";

export const useACL = () => {
  const user = useSelector((state) => state.auth.user);
  const can = (moduleKey, action) => canUser(user, moduleKey, action);
  return { can, permissions: getPermissions(user), isSuperAdmin: !!user?.isSuperAdmin };
};
