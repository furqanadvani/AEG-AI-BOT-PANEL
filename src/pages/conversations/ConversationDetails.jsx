import { useEffect } from "react";
import { Alert, Button, Empty, Popconfirm, Skeleton, Switch, Tabs, Tag } from "antd";
import { ClearOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { ChatThread } from "../../components";
import { MemoryList, transcriptNotice } from "../../components/chatDrawer/ChatDrawer";
import { CTable } from "../../uiComponents";
import { deleteSession, getSessionDetail, getSessionLogs, getSessionTranscript, resetSession, setTakeover } from "../../store/actions/Sessions.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { fromNow, readableText, renderDate } from "../../utils/Methods";
import "../leads/LeadDetails.css";
import "./ConversationDetails.css";

const ConversationDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useACL();
  const { detail: s, detailLoading, logs, logsLoading, takeoverLoading, resetLoading, transcript, transcriptFor, transcriptLoading } = useSelector(({ sessions }) => sessions);

  const canUpdate = can(ACL_MODULES.SESSIONS, ACL_ACCESS_LIST.UPDATE);
  const canLogs = can(ACL_MODULES.CHAT_LOGS, ACL_ACCESS_LIST.VIEW);

  const loadChat = () => dispatch(getSessionTranscript(id));

  useEffect(() => {
    dispatch(getSessionDetail(id, (session) => canLogs && dispatch(getSessionLogs(session.sessionId))));
    loadChat();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const header = { title: "Conversation", renderBack: true, backTo: "/conversations" };
  if (detailLoading && s?._id !== id) return <ContainerWrapper pageHeaderProps={header}><Skeleton active paragraph={{ rows: 10 }} /></ContainerWrapper>;
  if (!s || s._id !== id) return <ContainerWrapper pageHeaderProps={header}><Empty description="Conversation not found" /></ContainerWrapper>;

  const name = s.customer?.name || s.state?.data?.fullName || "Unknown visitor";
  const t = transcriptFor === id ? transcript : null;
  const notice = transcriptNotice(t);

  const logColumns = [
    { title: "Time", dataIndex: "createdAt", render: (v) => renderDate(v, true) },
    { title: "Message", dataIndex: "message", width: 260, render: (v) => <span className="pre-wrap">{v}</span> },
    { title: "Intent", dataIndex: "intent", render: (v) => (v ? readableText(v) : "-") },
    { title: "Next step", dataIndex: "next", render: (v) => (v ? <Tag color="blue">{readableText(v)}</Tag> : "-") },
    { title: "Reply", dataIndex: "replyAI", render: (v, r) => <Tag color={r.aiLimited ? "orange" : v === "ok" ? "green" : "default"}>{r.aiLimited ? "Normal mode" : v === "ok" ? "AI" : readableText(v)}</Tag> },
    { title: "Tokens", dataIndex: "totalTokens", align: "right" },
    { title: "Latency", dataIndex: "latencyMs", align: "right", render: (v) => `${(Number(v || 0) / 1000).toFixed(1)}s` },
  ];

  return (
    <ContainerWrapper
      pageHeaderProps={{
        ...header,
        title: name,
        subtitle: `${readableText(s.channel)} conversation, ${s.messagesCount || 0} messages, last activity ${fromNow(s.lastMessageAt)}`,
        actions: (
          <>
            {canUpdate && (
              <Popconfirm title="Reset the bot's memory?" description="The next message will start a fresh conversation." okText="Reset" onConfirm={() => dispatch(resetSession(s._id, loadChat))}>
                <Button icon={<ClearOutlined />} loading={resetLoading}>Reset memory</Button>
              </Popconfirm>
            )}
            {can(ACL_MODULES.SESSIONS, ACL_ACCESS_LIST.DELETE) && (
              <Popconfirm title="Delete this conversation?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => dispatch(deleteSession(s._id, () => navigate("/conversations")))}>
                <Button danger icon={<DeleteOutlined />} aria-label="Delete conversation" />
              </Popconfirm>
            )}
          </>
        ),
      }}
    >
      {s.humanTakeover && <Alert className="margin-bottom-16" type="warning" showIcon title="An agent is handling this conversation" description="The bot will not reply until the takeover is turned off." />}

      <div className="detail-grid">
        <section className="section-card" style={{ overflow: "hidden" }}>
          <Tabs
            className="conversation-tabs"
            items={[
              {
                key: "chat",
                label: `Chat${t ? ` (${t.messages.length})` : ""}`,
                children: transcriptLoading && !t ? (
                  <div style={{ padding: 20 }}><Skeleton active paragraph={{ rows: 10 }} /></div>
                ) : (
                  <>
                    {notice && <Alert type="info" showIcon banner title={notice} />}
                    <ChatThread className="conversation-thread" messages={t?.messages || []} userLabel={name} botLabel="AEG assistant" emptyText="No messages in this conversation" />
                  </>
                ),
              },
              ...(canLogs
                ? [{ key: "logs", label: `Turn log (${logs.length})`, children: <div style={{ padding: 16 }}><CTable columns={logColumns} dataSource={logs} loading={logsLoading} pagination={{ pageSize: 20 }} emptyText="No turn logs for this conversation" /></div> }]
                : []),
            ]}
          />
        </section>

        <aside className="detail-side">
          {canUpdate && (
            <section className="section-card detail-panel">
              <div className="takeover-row">
                <div>
                  <div className="font-semibold">Agent takeover</div>
                  <div className="text-gray text-small">The bot stays silent while this is on</div>
                </div>
                <Switch checked={!!s.humanTakeover} loading={takeoverLoading} onChange={(v) => dispatch(setTakeover(s._id, v, loadChat))} aria-label="Agent takeover" />
              </div>
            </section>
          )}

          <section className="section-card detail-panel">
            <h2 className="section-title">What the bot knows</h2>
            <MemoryList session={s} />
          </section>

          <section className="section-card detail-panel">
            <h2 className="section-title">Session</h2>
            <p className="mono">{s.sessionId}</p>
            {s.customer?._id && can(ACL_MODULES.CUSTOMERS, ACL_ACCESS_LIST.VIEW) && (
              <Link className="d-flex margin-top_16" to={`/customers/${s.customer._id}`}>Open customer profile</Link>
            )}
            <p className="text-gray text-small margin-top_16">Started {renderDate(s.createdAt, true)}</p>
          </section>
        </aside>
      </div>
    </ContainerWrapper>
  );
};

export default ConversationDetails;
