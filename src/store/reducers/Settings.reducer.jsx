import SETTINGS from "../constant/Settings.constant";
import { createCrudReducer } from "../../utils/ReduxHelpers";

export default createCrudReducer(SETTINGS, {
  initial: { setValuesLoading: false, seedLoading: false },
  cases: {
    [SETTINGS.SET_VALUES]: (state, action) => ({ ...state, setValuesLoading: action.loading }),
    [SETTINGS.SEED]: (state, action) => ({ ...state, seedLoading: action.loading }),
  },
});
