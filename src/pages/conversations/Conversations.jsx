import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Segmented, Select, Tag, Tooltip } from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { TbEye } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { ChatDrawer, UserAvatar } from "../../components";
import { CTable } from "../../uiComponents";
import { getSessions } from "../../store/actions/Sessions.action";
import { LANGUAGES } from "../../utils/Constants";
import { fromNow, readableText, renderDate, tablePagination } from "../../utils/Methods";
import "./Conversations.css";

const VIEWS = [
  { value: "all", label: "All" },
  { value: "collecting", label: "In progress" },
  { value: "confirming", label: "Confirming" },
  { value: "submitted", label: "Lead created" },
  { value: "agent", label: "Agent handling" },
];
const STAGE_COLORS = { submitted: "green", confirming: "blue", collecting: "default" };

const Conversations = () => {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { list, pagination, listLoading } = useSelector(({ sessions }) => sessions);
  const [search, setSearch] = useState(params.get("search") || "");

  // Filters + khuli chat URL mein (?view=<id>): refresh / link share par wahi chat khulti hai
  const query = useMemo(() => Object.fromEntries([...params.entries()].filter(([, v]) => v)), [params]);
  const setQuery = (patch) => {
    const next = { ...query, ...patch };
    if (!("page" in patch) && !("view" in patch)) delete next.page;
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined && v !== "")), { replace: true });
  };

  const tab = query.humanTakeover === "true" ? "agent" : query.stage || "all";
  const apiQuery = useMemo(() => {
    const { view, ...rest } = query;
    return rest;
  }, [query]);

  const fetchList = useCallback(() => dispatch(getSessions({ limit: 20, ...apiQuery })), [dispatch, apiQuery]);
  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => {
    const t = setTimeout(() => (search !== (query.search || "") ? setQuery({ search }) : null), 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const openChat = (r) => setQuery({ view: r._id });
  const viewing = list.find((r) => r._id === query.view);

  const columns = [
    {
      title: "Customer",
      key: "who",
      fixed: "left",
      render: (_, r) => {
        const name = r.customer?.name || r.state?.data?.fullName;
        return (
          <div className="d-flex gap-10 align-item-center">
            <UserAvatar name={name || r.sessionId} size={36} />
            <div>
              <div className="font-medium">{name || "Unknown visitor"}</div>
              <div className="text-gray text-small">{r.customer?.phone || r.state?.data?.whatsapp || "No number yet"}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Last message",
      key: "last",
      width: 340,
      render: (_, r) => {
        const last = (r.history || []).slice(-1)[0];
        if (!last) return <span className="text-gray">-</span>;
        return (
          <span className="conv-preview">
            {last.role === "assistant" && <span className="conv-preview-who">Bot: </span>}
            <bdi dir="auto">{last.text}</bdi>
          </span>
        );
      },
    },
    { title: "Channel", dataIndex: "channel", render: (v) => <Tag>{readableText(v)}</Tag> },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <div className="d-flex gap-5 flex-wrap">
          <Tag color={STAGE_COLORS[r.stage]} className="status-tag">{r.stage === "submitted" ? "Lead created" : readableText(r.stage)}</Tag>
          {r.humanTakeover && <Tag color="volcano" className="status-tag">Agent</Tag>}
        </div>
      ),
    },
    { title: "Language", dataIndex: "language", render: (v) => LANGUAGES[v] || v || "-" },
    { title: "Messages", dataIndex: "messagesCount", align: "center" },
    { title: "Last activity", dataIndex: "lastMessageAt", render: (v) => <Tooltip title={renderDate(v, true)}>{fromNow(v)}</Tooltip> },
    {
      title: "",
      key: "view",
      fixed: "right",
      width: 64,
      render: (_, r) => (
        <Tooltip title="View chat">
          <Button className="conv-eye" shape="circle" icon={<TbEye size={17} />} aria-label="View chat" onClick={() => openChat(r)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <ContainerWrapper pageHeaderProps={{ title: "Conversations", subtitle: "Every conversation customers had with the bot. Click the eye icon to read the full chat." }}>
      <div className="conv-toolbar">
        <Segmented
          value={tab}
          options={VIEWS}
          onChange={(v) => setQuery(v === "agent" ? { humanTakeover: "true", stage: undefined } : { stage: v === "all" ? undefined : v, humanTakeover: undefined })}
        />
        <div className="filters-bar" style={{ marginBottom: 0 }}>
          <Input className="filters-search" allowClear prefix={<SearchOutlined />} placeholder="Search name, number or session" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select allowClear placeholder="Channel" value={query.channel} options={["web", "whatsapp", "api", "test"].map((c) => ({ value: c, label: readableText(c) }))} onChange={(v) => setQuery({ channel: v })} />
          <Button icon={<ReloadOutlined />} aria-label="Refresh" onClick={fetchList} />
        </div>
      </div>

      <CTable
        columns={columns}
        dataSource={list}
        loading={listLoading}
        onRowClick={openChat}
        rowClassName={(r) => (r._id === query.view ? "is-clickable conv-row-active" : "is-clickable")}
        emptyText="No conversations yet"
        pagination={tablePagination(pagination, (page, limit) => setQuery({ page, limit }))}
      />

      <ChatDrawer id={query.view} session={viewing} open={!!query.view} onClose={() => setQuery({ view: undefined })} onChanged={fetchList} />
    </ContainerWrapper>
  );
};

export default Conversations;
