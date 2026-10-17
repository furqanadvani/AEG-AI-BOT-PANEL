import { createConstants } from "../../utils/ReduxHelpers";

const API_KEYS = createConstants("API_KEYS", ["REGENERATE", "CLEAR_REVEALED"]);

export default API_KEYS;
