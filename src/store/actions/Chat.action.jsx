import CHAT from "../constant/Chat.constant";
import { post } from "../../utils/ApiMethods";
import { getErrorMessage } from "../../utils/Methods";

/** Bot tester: message bhejo, reply + debug info thread mein */
export const sendChatMessage = (text) => async (dispatch, getState) => {
  const { sessionId } = getState().chat;
  const userMsg = { id: `u-${Date.now()}`, role: "user", text, at: new Date().toISOString() };
  dispatch({ type: CHAT.SEND, loading: true, message: userMsg });
  const started = Date.now();
  try {
    const { data } = await post("chat/message?debug=true", { sessionId, text, channel: "test" });
    const r = data?.data || {};
    dispatch({
      type: CHAT.SEND,
      loading: false,
      message: {
        id: `b-${Date.now()}`,
        role: "assistant",
        text: r.replyPlain || r.reply || "",
        silent: r.reply === null,
        at: new Date().toISOString(),
        meta: { next: r.next, language: r.language, leadId: r.leadId, aiLimited: r.aiLimited, aiReason: r.aiReason, roundTripMs: Date.now() - started, ...(r.debug || {}), humanTakeover: r.humanTakeover, botDisabled: r.botDisabled },
      },
    });
  } catch (error) {
    dispatch({
      type: CHAT.SEND,
      loading: false,
      message: { id: `e-${Date.now()}`, role: "error", text: getErrorMessage(error), at: new Date().toISOString() },
    });
  }
};

export const newChatSession = () => ({ type: CHAT.NEW_SESSION });
