import KNOWLEDGE from "../constant/Knowledge.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(KNOWLEDGE, "/knowledge", { label: "Knowledge" });

export const {
  getList: getKnowledge,
  getDetail: getKnowledgeDetail,
  save: saveKnowledge,
  setStatus: setKnowledgeStatus,
  remove: deleteKnowledge,
  bulk: bulkKnowledge,
} = actions;

export default actions;
