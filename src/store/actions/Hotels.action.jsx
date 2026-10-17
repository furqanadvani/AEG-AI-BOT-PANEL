import HOTELS from "../constant/Hotels.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(HOTELS, "/hotels", { label: "Hotel" });

export const {
  getList: getHotels,
  getDetail: getHotelDetail,
  save: saveHotel,
  setStatus: setHotelStatus,
  remove: deleteHotel,
  bulk: bulkHotels,
} = actions;

export default actions;
