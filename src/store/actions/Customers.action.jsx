import CUSTOMERS from "../constant/Customers.constant";
import { get } from "../../utils/ApiMethods";
import { apiRequest, createCrudActions } from "../../utils/ReduxHelpers";

const crud = createCrudActions(CUSTOMERS, "/customers", { label: "Customer" });

export const { getList: getCustomers, save: saveCustomer, setStatus: setCustomerStatus, remove: deleteCustomer } = crud;

export default crud;

export const getCustomerProfile = (id) => (dispatch) =>
  apiRequest({ dispatch, type: CUSTOMERS.PROFILE, call: () => get(`customers/${id}/profile`), map: (d) => ({ data: d.data }) });
