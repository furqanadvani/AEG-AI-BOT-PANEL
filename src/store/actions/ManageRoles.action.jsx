import MANAGE_ROLES from "../constant/ManageRoles.constant";
import { get } from "../../utils/ApiMethods";
import { apiRequest, createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(MANAGE_ROLES, "/roles", { label: "Role" });

export const { getList: getRoles, getDetail: getRoleDetail, save: saveRole, setStatus: setRoleStatus } = crud;

/** ACL modules + permissions (role editor / API key scopes) */
export const getAclModules = () => (dispatch, getState) => {
  if (getState().manageRoles.modules.length) return null;
  return apiRequest({ dispatch, type: MANAGE_ROLES.MODULES, call: () => get("roles/modules"), map: (d) => ({ data: d.data }), silent: true });
};
