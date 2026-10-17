import { createConstants } from "../../utils/ReduxHelpers";

const SESSIONS = createConstants("SESSIONS", ["RESET", "TAKEOVER", "LOGS", "TRANSCRIPT"]);

export default SESSIONS;
