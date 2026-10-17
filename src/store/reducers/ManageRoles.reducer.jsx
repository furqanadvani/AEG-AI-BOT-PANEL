import MANAGE_ROLES from "../constant/ManageRoles.constant";
import { createCrudReducer } from "../../utils/ReduxHelpers";

export default createCrudReducer(MANAGE_ROLES, {
  initial: { modules: [], permissionTypes: [] },
  cases: {
    [MANAGE_ROLES.MODULES]: (state, action) => ({
      ...state,
      ...(action.data && { modules: action.data.modules || [], permissionTypes: action.data.permissions || [] }),
    }),
  },
});
