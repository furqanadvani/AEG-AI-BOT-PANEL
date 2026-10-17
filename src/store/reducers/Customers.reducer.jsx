import CUSTOMERS from "../constant/Customers.constant";
import { createCrudReducer } from "../../utils/ReduxHelpers";

export default createCrudReducer(CUSTOMERS, {
  initial: { profile: null, profileLoading: false },
  cases: {
    [CUSTOMERS.PROFILE]: (state, action) => ({ ...state, profileLoading: action.loading, ...(action.data && { profile: action.data }) }),
  },
});
