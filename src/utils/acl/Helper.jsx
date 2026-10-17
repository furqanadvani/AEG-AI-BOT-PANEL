import { ACL_ACCESS_LIST, ACL_ALL } from "./Index";

export const getPermissions = (user) => (Array.isArray(user?.role?.permissions) ? user.role.permissions : []);

export const hasPermission = (permissions = [], moduleKey, action) => {
  if (permissions.some((p) => p.key === ACL_ALL && p.access?.includes(ACL_ALL))) return true;
  const mod = permissions.find((p) => p.key === moduleKey);
  return !!(mod?.access?.includes(action) || mod?.access?.includes(ACL_ALL));
};

export const canUser = (user, moduleKey, action = ACL_ACCESS_LIST.VIEW) => {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return hasPermission(getPermissions(user), moduleKey, action);
};

/** Route config se sirf woh routes jin ki ijazat hai (route.acl = { key, action }) */
export const getAllowedRoutes = (routes = [], user) =>
  routes.filter((route) => !route.acl || canUser(user, route.acl.key, route.acl.action || ACL_ACCESS_LIST.VIEW));
