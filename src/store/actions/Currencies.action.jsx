import CURRENCIES from "../constant/Currencies.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(CURRENCIES, "/currencies", { label: "Currency", updateMethod: "patch" });

export const {
  getList: getCurrencies,
  getDetail: getCurrencyDetail,
  save: saveCurrency,
  setStatus: setCurrencyStatus,
  remove: deleteCurrency,
  bulk: bulkCurrencies,
} = actions;

export default actions;
