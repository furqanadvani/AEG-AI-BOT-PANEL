import VISAS from "../constant/Visas.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(VISAS, "/visas", { label: "Visa rate" });

export const {
  getList: getVisas,
  getDetail: getVisaDetail,
  save: saveVisa,
  setStatus: setVisaStatus,
  remove: deleteVisa,
  bulk: bulkVisas,
} = actions;

export default actions;
