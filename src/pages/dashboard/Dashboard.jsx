import { useEffect, useState } from "react";
import { Alert, Button, Select, Skeleton, Tag, Tooltip } from "antd";
import { MessageOutlined, ReloadOutlined } from "@ant-design/icons";
import { TbArrowUpRight, TbInfoCircle } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ContainerWrapper } from "../../containers";
import { BarChart, ProgressList, Sparkline, UserAvatar } from "../../components";
import { CTable } from "../../uiComponents";
import { getDashboardStats, getRecentLeads } from "../../store/actions/Dashboard.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { LEAD_STATUS_COLORS } from "../../utils/Constants";
import { fromNow, readableText, renderTag } from "../../utils/Methods";
import AiMeter from "../aiControl/AiMeter";
import "./Dashboard.css";

const fmt = (n) => Number(n || 0).toLocaleString();

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

const STATUS_TONE = { Approved: "green", Rejected: "orange", Cancelled: "orange", Closed: "violet" };
const MEDALS = ["#FDE68A", "#E5E7EB", "#FED7AA"];

const Kpi = ({ label, value, total, hint, trend, color, onClick, info }) => {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper type={onClick ? "button" : undefined} className="section-card dash-kpi" onClick={onClick}>
      <span className="dash-kpi-label">
        {label}
        {info && (
          <Tooltip title={info}>
            <TbInfoCircle aria-label={info} />
          </Tooltip>
        )}
      </span>
      <span className="dash-kpi-value">
        {value}
        {total !== undefined && <small>/{total}</small>}
      </span>
      {trend ? <Sparkline values={trend} color={color} /> : <span className="dash-kpi-foot">{hint}</span>}
    </Wrapper>
  );
};

const Leaderboard = ({ items = [], subtitle, emptyText }) =>
  items.length ? (
    <div className="leaderboard">
      {items.map((item, i) => (
        <div className="leader-row" key={item.name}>
          <UserAvatar name={item.name} size={36} />
          <div>
            <div className="leader-name">{item.name}</div>
            <div className="leader-sub">{subtitle(item)}</div>
          </div>
          <div className="leader-rank">
            {i < 3 ? (
              <span className="leader-medal" style={{ background: MEDALS[i] }}>{i + 1}</span>
            ) : (
              <span className="text-gray">{i + 1}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray">{emptyText}</p>
  );

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useACL();
  const { stats, statsLoading, recentLeads, recentLeadsLoading } = useSelector(({ dashboard }) => dashboard);
  const [range, setRange] = useState("30d");
  const [activityOf, setActivityOf] = useState("leads");

  const canLeads = can(ACL_MODULES.LEADS, ACL_ACCESS_LIST.VIEW);
  const canChat = can(ACL_MODULES.CHAT, ACL_ACCESS_LIST.CREATE);

  const load = () => {
    dispatch(getDashboardStats(range));
    if (canLeads) dispatch(getRecentLeads());
  };
  useEffect(load, [range]); // eslint-disable-line react-hooks/exhaustive-deps

  const k = stats?.kpis || {};
  const ai = stats?.ai;
  const trends = stats?.trends || {};
  const rangeLabel = RANGES.find((r) => r.value === range)?.label.toLowerCase();

  const pipeline = Object.entries(stats?.leads?.byStatus || {})
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ key: name, name, value, tone: STATUS_TONE[name] || "blue", badge: name.slice(0, 2).toUpperCase() }));
  const pipelineTotal = pipeline.reduce((s, x) => s + x.value, 0);

  const countries = (stats?.top?.countries || []).map((c) => ({ key: c.name, name: c.name, value: c.count, approved: c.approved, tone: "green" }));
  const countryTotal = countries.reduce((s, x) => s + x.value, 0);

  const activity = (stats?.activity?.[activityOf] || []).map((m) => ({
    label: dayjs(`${m.key}-01`).format("MMM"),
    value: m.count,
    tooltip: `${dayjs(`${m.key}-01`).format("MMMM YYYY")}: ${fmt(m.count)} ${activityOf}`,
  }));

  const openByType = stats?.queries?.openByType || {};

  const leadColumns = [
    { title: "Reference", dataIndex: "leadId", render: (v) => <span className="mono font-semibold">{v}</span> },
    { title: "Customer", dataIndex: "fullName", render: (v, r) => v || r.whatsapp || "-" },
    { title: "Visa", key: "visa", render: (_, r) => [r.country, r.visaType].filter(Boolean).join(" ") || "-" },
    { title: "Agent", dataIndex: "assignedAgent", render: (v) => v || "Unassigned" },
    { title: "Status", dataIndex: "status", render: (v) => renderTag(v, LEAD_STATUS_COLORS) },
    { title: "Created", dataIndex: "createdAt", render: (v) => fromNow(v) },
  ];

  const loading = statsLoading && !stats;

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: "Dashboard",
        subtitle: dayjs().format("dddd, D MMMM YYYY"),
        actions: (
          <>
            <Button icon={<ReloadOutlined />} onClick={load} loading={statsLoading}>Refresh</Button>
            {canChat && <Button type="primary" icon={<MessageOutlined />} onClick={() => navigate("/chat-tester")}>Test the bot</Button>}
          </>
        ),
      }}
    >
      <div className="dash-filters">
        <Select value={range} onChange={setRange} options={RANGES} prefix={<span className="text-gray">Timeframe:</span>} aria-label="Timeframe" />
        <span className="dash-filter-note">Leads, conversations, pipeline and leaderboards follow the timeframe. Open queries and totals are always current.</span>
      </div>

      {ai?.mode === "normal" && (
        <Alert
          className="margin-bottom-16"
          type="warning"
          showIcon
          title={`AI is paused: ${readableText(ai.reason)}`}
          description="The bot is running in normal (rule-based) mode. It still collects details and creates leads, but answers without AI."
          action={can(ACL_MODULES.AI_CONTROL, ACL_ACCESS_LIST.VIEW) && <Button size="small" onClick={() => navigate("/ai-control")}>Open AI control</Button>}
        />
      )}

      <div className="dash-top">
        {loading ? (
          <div className="section-card dash-card"><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : (
          <div className="dash-kpis">
            <Kpi label="New leads" value={fmt(k.leads)} trend={trends.leads?.map((d) => d.count)} onClick={canLeads ? () => navigate("/leads") : undefined} info={`Leads created ${rangeLabel}`} />
            <Kpi label="Conversations" value={fmt(k.conversations)} trend={trends.conversations?.map((d) => d.count)} color="#7C3AED" onClick={() => navigate("/conversations")} />
            <Kpi label="Messages" value={fmt(k.messages)} trend={trends.messages?.map((d) => d.count)} color="#0EA5E9" />
            <Kpi label="Conversion" value={`${k.conversion || 0}%`} hint="Conversations that became a lead" info="Leads divided by conversations in this timeframe" />
            <Kpi label="New customers" value={fmt(k.newCustomers)} total={fmt(k.customers)} hint="New profiles / all customers" onClick={() => navigate("/customers")} />
            <Kpi label="Open queries" value={fmt(k.openQueries)} hint="Waiting for your team" onClick={() => navigate("/queries?status=Open")} />
          </div>
        )}

        <section className="section-card dash-card dash-activity">
          <div className="dash-card-head">
            <div>
              <div className="dash-card-title">Activity</div>
              <div className="dash-card-sub">Last 12 months</div>
            </div>
            <Select
              size="small"
              variant="borderless"
              value={activityOf}
              onChange={setActivityOf}
              options={[{ value: "leads", label: "Leads" }, { value: "conversations", label: "Conversations" }]}
              aria-label="Activity metric"
              style={{ minWidth: 130, fontWeight: 600 }}
            />
          </div>
          {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : <BarChart data={activity} />}
        </section>
      </div>

      <div className="dash-row">
        <section className="section-card dash-card">
          <div className="dash-card-head">
            <div>
              <div className="dash-card-title">Lead pipeline</div>
              <div className="dash-card-sub">{fmt(pipelineTotal)} leads {rangeLabel}</div>
            </div>
            {canLeads && <Button type="link" size="small" onClick={() => navigate("/leads")}>View leads <TbArrowUpRight /></Button>}
          </div>
          {loading ? (
            <Skeleton active />
          ) : (
            <ProgressList
              items={pipeline}
              emptyText="No leads in this timeframe"
              formatValue={(item) => <>{fmt(item.value)} <span>{pipelineTotal ? Math.round((item.value / pipelineTotal) * 100) : 0}%</span></>}
            />
          )}
        </section>

        <section className="section-card dash-card">
          <div className="dash-card-head">
            <div>
              <div className="dash-card-title">Top destinations</div>
              <div className="dash-card-sub">Share of leads by country</div>
            </div>
          </div>
          {loading ? (
            <Skeleton active />
          ) : (
            <ProgressList
              items={countries.map((c) => ({ ...c, max: countryTotal }))}
              tone="green"
              emptyText="No destinations yet"
              formatValue={(item, pct) => <>{pct}% <span>({fmt(item.value)})</span></>}
            />
          )}
        </section>
      </div>

      <div className="dash-row">
        <section className="section-card dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">Agent leaderboard</div>
          </div>
          {loading ? (
            <Skeleton active avatar />
          ) : (
            <Leaderboard
              items={stats?.top?.agents || []}
              emptyText="No assigned leads in this timeframe"
              subtitle={(a) => `${fmt(a.count)} leads, ${fmt(a.approved)} approved`}
            />
          )}
        </section>

        <section className="section-card dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">Top visa types</div>
          </div>
          {loading ? (
            <Skeleton active avatar />
          ) : (
            <Leaderboard
              items={stats?.top?.visaTypes || []}
              emptyText="No leads in this timeframe"
              subtitle={(v) => `${fmt(v.count)} leads${v.count ? `, ${Math.round((v.approved / v.count) * 100)}% approved` : ""}`}
            />
          )}
        </section>
      </div>

      <div className="dash-row">
        <section className="section-card dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">Needs attention</div>
          </div>
          <div className="attention-list">
            {[
              { key: "HUMAN", label: "Customers asking for a person", to: "/queries?type=HUMAN&status=Open" },
              { key: "UNANSWERED", label: "Questions the bot couldn't answer", to: "/queries?type=UNANSWERED&status=Open" },
              { key: "COMPLAINT", label: "Complaints", to: "/queries?type=COMPLAINT&status=Open" },
            ].map((a) => (
              <button key={a.key} type="button" className="attention-item" onClick={() => navigate(a.to)}>
                <span>{a.label}</span>
                <span className="attention-count">{fmt(openByType[a.key])}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section-card dash-card">
          <div className="dash-card-head">
            <div className="dash-card-title">AI usage</div>
            {ai && <Tag color={ai.mode === "ai" ? "green" : "orange"} className="status-tag">{ai.mode === "ai" ? "AI mode" : "Normal mode"}</Tag>}
          </div>
          {!ai ? (
            <Skeleton active />
          ) : (
            <>
              <AiMeter label="Tokens today" used={ai.usage.today.totalTokens} limit={ai.limits.dailyTokens} percent={ai.usage.today.tokenPercent} />
              <AiMeter label="Requests today" used={ai.usage.today.requests} limit={ai.limits.dailyRequests} percent={ai.usage.today.requestPercent} />
              <AiMeter label="Tokens this month" used={ai.usage.month.totalTokens} limit={ai.limits.monthlyTokens} percent={ai.usage.month.tokenPercent} />
            </>
          )}
        </section>
      </div>

      {canLeads && (
        <section className="margin-top_16">
          <div className="dash-card-head" style={{ marginTop: 8 }}>
            <div className="dash-card-title">Latest leads</div>
            <Button type="link" onClick={() => navigate("/leads")}>View all leads</Button>
          </div>
          <CTable columns={leadColumns} dataSource={recentLeads} loading={recentLeadsLoading} pagination={false} onRowClick={(r) => navigate(`/leads/${r._id}`)} emptyText="No leads yet" />
        </section>
      )}
    </ContainerWrapper>
  );
};

export default Dashboard;
