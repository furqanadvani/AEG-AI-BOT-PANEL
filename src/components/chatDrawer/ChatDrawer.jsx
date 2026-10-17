import { useEffect } from "react";
import { Alert, Button, Drawer, Popconfirm, Skeleton, Switch, Tabs, Tag } from "antd";
import { TbArrowUpRight, TbRefresh, TbX } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ChatThread from "../chatThread/ChatThread";
import UserAvatar from "../userAvatar/UserAvatar";
import { getSessionDetail, getSessionTranscript, resetSession, setTakeover } from "../../store/actions/Sessions.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { LANGUAGES } from "../../utils/Constants";
import { fromNow, readableText, renderDate } from "../../utils/Methods";
import "../../pages/leads/LeadDetails.css";
import "./ChatDrawer.css";

const STAGE_COLORS = { submitted: "green", confirming: "blue", collecting: "default" };
const FIELD_LABELS = { whatsapp: "WhatsApp", fullName: "Full name", visaType: "Visa type", cityToStay: "City to stay", homeCity: "Home city", travelDate: "Travel date", bankStatement: "Bank statement" };
const fieldLabel = (key) => FIELD_LABELS[key] || readableText(key.replace(/([A-Z])/g, " $1"));

/** Bot ki memory (state.data) readable list */
export const MemoryList = ({ session }) => {
  const data = session?.state?.data || {};
  const rows = [
    ["Stage", readableText(session?.stage)],
    ["Language", LANGUAGES[session?.language] || session?.language],
    ["Currently asking", session?.state?.lastAsked && fieldLabel(session.state.lastAsked)],
    ["Lead", session?.state?.leadId],
    ["AI calls", session?.aiCalls],
    ...Object.entries(data)
      .filter(([, v]) => v !== "" && v !== null && typeof v !== "object")
      .map(([key, v]) => [fieldLabel(key), String(v)]),
  ].filter(([, v]) => v !== undefined && v !== null && v !== "");
  return (
    <dl className="kv-list">
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
};

export const transcriptNotice = (t) =>
  t && !t.complete
    ? t.source === "logs"
      ? "This conversation started before full transcripts were saved. Messages are rebuilt from the turn log and long ones may be shortened."
      : "This conversation was imported or started before full transcripts were saved. Only the most recent messages are available."
    : null;

/**
 * Poori chat side drawer mein. session = list row (foran header dikhane ke liye), id = session _id
 */
const ChatDrawer = ({ id, session: rowSession, open, onClose, onChanged }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useACL();
  const { detail, transcript, transcriptFor, transcriptLoading, takeoverLoading, resetLoading } = useSelector(({ sessions }) => sessions);
  const canUpdate = can(ACL_MODULES.SESSIONS, ACL_ACCESS_LIST.UPDATE);

  useEffect(() => {
    if (!open || !id) return;
    dispatch(getSessionDetail(id));
    dispatch(getSessionTranscript(id));
  }, [open, id, dispatch]);

  const s = detail?._id === id ? detail : rowSession;
  const name = s?.customer?.name || s?.state?.data?.fullName || "Unknown visitor";
  const phone = s?.customer?.phone || s?.state?.data?.whatsapp;
  const t = transcriptFor === id ? transcript : null;
  const notice = transcriptNotice(t);

  const refresh = () => {
    dispatch(getSessionTranscript(id));
    onChanged?.();
  };

  return (
    <Drawer open={open} onClose={onClose} size={620} className="chat-drawer" title={null} closable={false} destroyOnHidden>
      {!s ? (
        <div style={{ padding: 20 }}><Skeleton active avatar paragraph={{ rows: 8 }} /></div>
      ) : (
        <>
          <div className="chat-drawer-head">
            <UserAvatar name={name} size={44} />
            <div className="flex-1">
              <div className="chat-drawer-name">{name}</div>
              <div className="chat-drawer-sub">{[phone, `Last message ${fromNow(s.lastMessageAt)}`].filter(Boolean).join(", ")}</div>
            </div>
            <Button type="text" icon={<TbRefresh size={18} />} onClick={refresh} loading={transcriptLoading} aria-label="Refresh chat" />
            <Button type="text" icon={<TbX size={18} />} onClick={onClose} aria-label="Close" />
          </div>

          <div className="chat-drawer-tags">
            <Tag>{readableText(s.channel)}</Tag>
            <Tag color={STAGE_COLORS[s.stage]}>{s.stage === "submitted" ? "Lead created" : readableText(s.stage)}</Tag>
            {s.language && <Tag>{LANGUAGES[s.language] || s.language}</Tag>}
            <Tag>{s.messagesCount || 0} messages</Tag>
            {s.state?.leadId && <Tag color="green">Lead {s.state.leadId}</Tag>}
            {s.humanTakeover && <Tag color="volcano">Agent handling</Tag>}
          </div>

          {canUpdate && (
            <div className="chat-drawer-bar">
              <span>
                <strong>Agent takeover</strong>
                <span className="text-gray d-flex text-small">The bot stays silent while this is on</span>
              </span>
              <Switch checked={!!s.humanTakeover} loading={takeoverLoading} onChange={(v) => dispatch(setTakeover(s._id, v, refresh))} aria-label="Agent takeover" />
            </div>
          )}

          <Tabs
            className="chat-drawer-tabs"
            items={[
              {
                key: "chat",
                label: `Chat${t ? ` (${t.messages.length})` : ""}`,
                children: transcriptLoading && !t ? (
                  <div style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 8 }} /></div>
                ) : (
                  <div className="chat-drawer-pane">
                    {notice && <Alert type="info" showIcon banner title={notice} />}
                    <ChatThread className="chat-drawer-thread" messages={t?.messages || []} userLabel={name} botLabel="AEG assistant" emptyText="No messages in this conversation" />
                  </div>
                ),
              },
              {
                key: "details",
                label: "Details",
                children: (
                  <div className="chat-drawer-details">
                    <h3 className="section-title">What the bot knows</h3>
                    <MemoryList session={s} />
                    <h3 className="section-title margin-top_16">Session</h3>
                    <dl className="kv-list">
                      <dt>Session ID</dt>
                      <dd className="mono">{s.sessionId}</dd>
                      <dt>Started</dt>
                      <dd>{renderDate(s.createdAt, true)}</dd>
                      <dt>Last message</dt>
                      <dd>{renderDate(s.lastMessageAt, true)}</dd>
                    </dl>
                  </div>
                ),
              },
            ]}
          />

          <div className="chat-drawer-foot">
            {canUpdate ? (
              <Popconfirm title="Reset the bot's memory?" description="The next message will start a fresh conversation." okText="Reset" onConfirm={() => dispatch(resetSession(s._id, refresh))}>
                <Button loading={resetLoading}>Reset memory</Button>
              </Popconfirm>
            ) : (
              <span />
            )}
            <div className="d-flex gap-10">
              {s.customer?._id && can(ACL_MODULES.CUSTOMERS, ACL_ACCESS_LIST.VIEW) && (
                <Button onClick={() => navigate(`/customers/${s.customer._id}`)}>Customer profile</Button>
              )}
              <Button type="primary" onClick={() => navigate(`/conversations/${s._id}`)}>
                Open full page <TbArrowUpRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
};

export default ChatDrawer;
