import CHAT from "../constant/Chat.constant";

const newId = () => `admin-test-${Date.now().toString(36)}`;

const initialState = {
  sessionId: newId(),
  messages: [],
  sending: false,
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case CHAT.SEND:
      return {
        ...state,
        sending: action.loading,
        ...(action.message && { messages: [...state.messages, action.message] }),
      };
    case CHAT.NEW_SESSION:
      return { ...initialState, sessionId: newId() };
    default:
      return state;
  }
};
