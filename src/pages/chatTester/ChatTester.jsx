import { useMemo, useState } from "react";
import { Alert, Button, Empty, Input, Tag, Tooltip } from "antd";
import { CopyOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { ChatThread } from "../../components";
import { newChatSession, sendChatMessage } from "../../store/actions/Chat.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { LANGUAGES } from "../../utils/Constants";
import { copyText, readableText } from "../../utils/Methods";
import logo from "../../assets/Logo.svg";
import { QUICK_PROMPTS, STEP_TEXT } from "./Helper";
import "./ChatTester.css";

const ChatTester = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useACL();
  const { sessionId, messages, sending } = useSelector(({ chat }) => chat);
  const [text, setText] = useState("");

  const send = (value = text) => {
    const v = String(value).trim();
    if (!v || sending) return;
    dispatch(sendChatMessage(v));
    setText("");
  };

  const botTurns = useMemo(() => messages.filter((m) => m.role === "assistant"), [messages]);
  const last = botTurns[botTurns.length - 1]?.meta;
  const stats = useMemo(
    () => ({
      turns: botTurns.length,
      tokens: botTurns.reduce((s, m) => s + (Number(m.meta?.tokens) || 0), 0),
      aiReplies: botTurns.filter((m) => m.meta?.replyAI === "ok").length,
      normal: botTurns.filter((m) => m.meta?.aiLimited).length,
    }),
    [botTurns]
  );
  const leadId = [...botTurns].reverse().find((m) => m.meta?.leadId)?.meta?.leadId;
  const step = last?.next ? STEP_TEXT[last.next] || [readableText(last.next), ""] : null;

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: "Test the bot",
        subtitle: "Chat with the bot as a customer. Each reply shows what the bot decided. This runs on the live system, so leads and queries are real.",
      }}
    >
      <div className="tester">
        <section className="tester-phone" aria-label="Bot conversation">
          <div className="tester-phone-head">
            <img src={logo} alt="" />
            <div>
              <div className="tester-phone-title">AEG Visa assistant</div>
              <div className="tester-phone-sub">{sending ? "typing..." : "Test conversation"}</div>
            </div>
            <Button ghost size="small" icon={<PlusOutlined />} onClick={() => dispatch(newChatSession())} disabled={sending}>
              New conversation
            </Button>
          </div>

          <ChatThread className="tester-thread" messages={messages} typing={sending} emptyText="Pick a suggestion below or type a message" />

          <div className="tester-prompts">
            {QUICK_PROMPTS.map((p) => (
              <Button key={p} size="small" onClick={() => send(p)} disabled={sending}>{p}</Button>
            ))}
          </div>

          <div className="tester-composer">
            <Input.TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              autoSize={{ minRows: 1, maxRows: 5 }}
              placeholder="Type a message (Enter to send, Shift+Enter for a new line)"
              aria-label="Message"
              maxLength={1500}
            />
            <Button type="primary" shape="circle" size="large" icon={<SendOutlined />} onClick={() => send()} loading={sending} disabled={!text.trim()} aria-label="Send" />
          </div>
        </section>

        <aside className="tester-side">
          <section className="section-card tester-panel">
            <h2 className="section-title">What the bot did</h2>
            {!step ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Send a message to start" />
            ) : (
              <>
                <div className="tester-step">{step[0]}</div>
                {step[1] && <p className="text-gray margin-bottom-16">{step[1]}</p>}
                <div className="d-flex gap-5 flex-wrap">
                  {last.language && <Tag>{LANGUAGES[last.language] || last.language}</Tag>}
                  {last.intent && <Tag>Intent: {readableText(last.intent)}</Tag>}
                  {last.stage && <Tag>Stage: {readableText(last.stage)}</Tag>}
                  {last.sideEffect && last.sideEffect !== "none" && <Tag color="purple">{readableText(last.sideEffect)}</Tag>}
                </div>
                {last.aiLimited && (
                  <Alert className="margin-top_16" type="warning" showIcon title="Normal mode" description={`No AI call (${readableText(last.aiReason)}). The bot used rule-based mode.`} />
                )}
              </>
            )}
          </section>

          <section className="section-card tester-panel">
            <h2 className="section-title">This conversation</h2>
            <div className="tester-stats">
              <div className="tester-stat"><strong>{stats.turns}</strong><span>Bot replies</span></div>
              <div className="tester-stat"><strong>{stats.tokens.toLocaleString()}</strong><span>Tokens</span></div>
              <div className="tester-stat"><strong>{stats.aiReplies}</strong><span>AI written</span></div>
              <div className="tester-stat"><strong>{stats.normal}</strong><span>Normal mode</span></div>
            </div>
            {leadId && (
              <Alert
                className="margin-top_16"
                type="success"
                showIcon
                title={`Lead ${leadId} created`}
                action={can(ACL_MODULES.LEADS, ACL_ACCESS_LIST.VIEW) && <Button size="small" onClick={() => navigate(`/leads?search=${leadId}`)}>Open</Button>}
              />
            )}
          </section>

          <section className="section-card tester-panel">
            <h2 className="section-title">Session</h2>
            <div className="d-flex align-item-center gap-5">
              <span className="mono flex-1" style={{ wordBreak: "break-all" }}>{sessionId}</span>
              <Tooltip title="Copy">
                <Button size="small" type="text" icon={<CopyOutlined />} aria-label="Copy session id" onClick={() => copyText(sessionId, "Session id copied")} />
              </Tooltip>
            </div>
            {messages.length > 0 && can(ACL_MODULES.SESSIONS, ACL_ACCESS_LIST.VIEW) && (
              <Link className="d-flex margin-top_16" to={`/conversations?search=${sessionId}`}>View in Conversations</Link>
            )}
            <p className="text-gray text-small margin-top_16">
              Bot behaviour comes from Countries, Questions, Knowledge and AI control. Start a new conversation after making changes.
            </p>
          </section>
        </aside>
      </div>
    </ContainerWrapper>
  );
};

export default ChatTester;
