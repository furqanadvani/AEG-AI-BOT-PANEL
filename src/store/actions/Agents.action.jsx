import AGENTS from "../constant/Agents.constant";
import { createCrudActions } from "../../utils/ReduxHelpers";

const actions = createCrudActions(AGENTS, "/agents", { label: "Agent" });

export const {
  getList: getAgents,
  getDetail: getAgentDetail,
  save: saveAgent,
  setStatus: setAgentStatus,
  remove: deleteAgent,
  bulk: bulkAgents,
} = actions;

export default actions;
