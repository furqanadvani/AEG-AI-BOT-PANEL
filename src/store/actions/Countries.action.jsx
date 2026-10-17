import COUNTRIES from "../constant/Countries.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(COUNTRIES, "/countries", { label: "Country" });

export const {
  getList: getCountries,
  getDetail: getCountryDetail,
  save: saveCountry,
  setStatus: setCountryStatus,
  remove: deleteCountry,
  bulk: bulkCountries,
} = actions;

export default actions;
