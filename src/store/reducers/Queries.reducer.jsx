import QUERIES from "../constant/Queries.constant";
import { createCrudReducer } from "../../utils/ReduxHelpers";

export default createCrudReducer(QUERIES, {
  initial: { answerLoading: false },
  cases: {
    [QUERIES.ANSWER]: (state, action) => ({ ...state, answerLoading: action.loading }),
  },
});
