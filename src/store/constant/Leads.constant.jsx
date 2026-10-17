import { createConstants } from "../../utils/ReduxHelpers";

const LEADS = createConstants("LEADS", ["STATUSES", "UPDATE_STATUS", "ASSIGN", "ADD_NOTE", "CRM_SYNC"]);

export default LEADS;
