import VISA_TYPES from "../constant/VisaTypes.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(VISA_TYPES, "/visa-types", { label: "Visa type" });

export const {
  getList: getVisaTypes,
  getDetail: getVisaTypeDetail,
  save: saveVisaType,
  setStatus: setVisaTypeStatus,
  remove: deleteVisaType,
  bulk: bulkVisaTypes,
} = actions;

export default actions;
