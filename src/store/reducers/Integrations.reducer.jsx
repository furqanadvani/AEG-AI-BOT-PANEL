import INTEGRATIONS from "../constant/Integrations.constant";

const initialState = {
  list: [],
  listLoading: false,

  savingType: null,
  testingType: null,
  testResults: {},
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case INTEGRATIONS.LIST:
      return { ...state, listLoading: action.loading, ...(action.data && { list: action.data }) };
    case INTEGRATIONS.SAVE:
      return {
        ...state,
        savingType: action.loading ? action.integrationType : null,
        ...(action.data && { list: state.list.map((i) => (i.type === action.integrationType ? action.data : i)) }),
      };
    case INTEGRATIONS.TEST:
      return {
        ...state,
        testingType: action.loading ? action.integrationType : null,
        ...(action.data && { testResults: { ...state.testResults, [action.integrationType]: action.data } }),
      };
    default:
      return state;
  }
};
