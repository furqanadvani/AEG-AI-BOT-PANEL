import { useEffect } from "react";
import { Alert, Button, ConfigProvider, Skeleton, Switch, Tooltip } from "antd";
import { ExperimentOutlined, ReloadOutlined } from "@ant-design/icons";
import { Form, Formik } from "formik";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { ContainerWrapper } from "../../containers";
import { FormBuilder } from "../../components";
import { getAiSettings, getAiStatus, getAiUsage, testAi, updateAiSettings } from "../../store/actions/Ai.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { readableText, toList } from "../../utils/Methods";
import AiMeter from "./AiMeter";
import "./AiControl.css";

const YES = /^(yes|true|1|on)$/i;
const fmt = (n) => Number(n || 0).toLocaleString();

const SWITCHES = [
  { key: "AiEnabled", title: "AI master switch", hint: "Off = the whole bot runs in normal (rule-based) mode" },
  { key: "AiUnderstandEnabled", title: "AI #1 Understand", hint: "Understands customer messages" },
  { key: "AiReplyEnabled", title: "AI #2 Reply", hint: "Writes replies in the customer's language" },
];

const NUMBER_KEYS = ["AiDailyTokenLimit", "AiMonthlyTokenLimit", "AiDailyRequestLimit", "AiMaxCallsPerSession", "AiWarnAtPercent", "ReplyTemperature", "AiTimeoutMs", "AiUnderstandMaxTokens", "AiReplyMaxTokens"];

const fields = [
  { section: "Limits (0 = unlimited)" },
  { name: "AiDailyTokenLimit", label: "Daily tokens", type: "number", min: 0 },
  { name: "AiMonthlyTokenLimit", label: "Monthly tokens", type: "number", min: 0 },
  { name: "AiDailyRequestLimit", label: "Daily AI requests", type: "number", min: 0 },
  { name: "AiMaxCallsPerSession", label: "Max AI calls per conversation", type: "number", min: 0, hint: "Stops one customer from running up the AI bill" },
  { name: "AiWarnAtPercent", label: "Warning at (%)", type: "number", min: 1, max: 99 },
  { name: "AiLimitNotifyEmails", label: "Notify by email", type: "tags", placeholder: "owner@company.com", hint: "Notified when a limit or warning is hit" },
  { section: "Models" },
  { name: "UnderstandModel", label: "AI #1 model", placeholder: "openai/gpt-oss-120b" },
  { name: "ReplyModel", label: "AI #2 model", placeholder: "openai/gpt-oss-120b" },
  { name: "ReplyTemperature", label: "Reply temperature", type: "number", min: 0, max: 2, step: 0.1, hint: "Lower = consistent, higher = more varied" },
  { name: "AiTimeoutMs", label: "Timeout (ms)", type: "number", min: 2000 },
  { name: "AiUnderstandMaxTokens", label: "AI #1 max output tokens", type: "number", min: 50 },
  { name: "AiReplyMaxTokens", label: "AI #2 max output tokens", type: "number", min: 50 },
  { section: "Extra instructions" },
  { name: "UnderstandPromptAppend", label: "For AI #1 (Understand)", type: "textarea", rows: 3, placeholder: "e.g. Treat 'Hajj' as an Umrah visa" },
  { name: "ReplyPromptAppend", label: "For AI #2 (Reply)", type: "textarea", rows: 3, placeholder: "e.g. Never quote fees; ask the customer to contact the team" },
];

const toForm = (s = {}) => {
  const out = {};
  for (const f of fields) {
    if (!f.name) continue;
    const v = s[f.name] ?? "";
    out[f.name] = NUMBER_KEYS.includes(f.name) ? (v === "" ? null : Number(v)) : f.type === "tags" ? toList(v) : v;
  }
  return out;
};

const toValues = (v) =>
  Object.fromEntries(
    Object.entries(v).map(([k, val]) => [k, Array.isArray(val) ? val.join(", ") : val === null || val === undefined ? "" : String(val)])
  );

const AiControl = () => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const { status, statusLoading, usage, settings, settingsLoading, updateLoading, testResult, testLoading } = useSelector(({ ai }) => ai);
  const canUpdate = can(ACL_MODULES.AI_CONTROL, ACL_ACCESS_LIST.UPDATE);

  const load = () => {
    dispatch(getAiStatus());
    dispatch(getAiSettings());
    dispatch(getAiUsage("day", 14));
  };
  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isNormal = status?.mode === "normal";
  const maxTokens = Math.max(1, ...usage.map((u) => u.totalTokens || 0));
  const days = [...usage].reverse();

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: "AI control",
        subtitle: "Control when and how much AI is used. When a limit is reached the bot keeps running in normal mode and you get notified.",
        actions: (
          <>
            <Button icon={<ReloadOutlined />} onClick={load} loading={statusLoading}>Refresh</Button>
            {canUpdate && <Button type="primary" icon={<ExperimentOutlined />} loading={testLoading} onClick={() => dispatch(testAi())}>Test AI</Button>}
          </>
        ),
      }}
    >
      {testResult && (
        <Alert
          className="margin-bottom-16"
          closable
          type={testResult.ok ? "success" : "error"}
          showIcon
          title={testResult.ok ? `AI is working: "${testResult.reply}"` : `AI test failed: ${testResult.limited ? readableText(testResult.reason) : testResult.error || readableText(testResult.reason)}`}
          description={testResult.ok ? `Used ${testResult.usage?.total_tokens || 0} tokens.` : "Check the API key and base URL in Integrations > AI."}
        />
      )}

      {!status ? (
        <Skeleton active />
      ) : (
        <>
          <section className="section-card ai-mode">
            <div>
              <div className="ai-mode-label">
                <span className="ai-mode-dot" style={{ background: isNormal ? "#D97706" : "#16A34A" }} />
                {isNormal ? "Normal mode" : "AI mode"}
              </div>
              <p className="text-gray" style={{ marginTop: 4 }}>
                {isNormal ? `AI calls are paused (${readableText(status.reason)}). The bot still collects details and creates leads in rule-based mode.` : "The bot uses AI to understand customers and write replies."}
              </p>
            </div>
          </section>

          <div className="ai-switches">
            {SWITCHES.map((s) => (
              <div key={s.key} className="section-card ai-switch">
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-gray text-small">{s.hint}</div>
                </div>
                <Switch
                  checked={YES.test(String(settings[s.key] ?? "yes"))}
                  disabled={!canUpdate || settingsLoading}
                  loading={updateLoading}
                  onChange={(v) => dispatch(updateAiSettings({ [s.key]: v ? "yes" : "no" }))}
                  aria-label={s.title}
                />
              </div>
            ))}
          </div>

          <div className="ai-grid">
            <section className="section-card ai-panel">
              <h2 className="section-title">Usage</h2>
              <AiMeter label="Tokens today" used={status.usage.today.totalTokens} limit={status.limits.dailyTokens} percent={status.usage.today.tokenPercent} />
              <AiMeter label="Requests today" used={status.usage.today.requests} limit={status.limits.dailyRequests} percent={status.usage.today.requestPercent} />
              <AiMeter label="Tokens this month" used={status.usage.month.totalTokens} limit={status.limits.monthlyTokens} percent={status.usage.month.tokenPercent} />
              <p className="text-gray text-small margin-top_16">
                Today: {fmt(status.usage.today.blocked)} calls blocked by limits, {fmt(status.usage.today.failures)} failed.
              </p>
            </section>

            <section className="section-card ai-panel">
              <h2 className="section-title">Last 14 days (tokens)</h2>
              {days.length ? (
                <div className="usage-chart" role="img" aria-label="Daily token usage">
                  {days.map((d) => (
                    <Tooltip key={d.key} title={`${dayjs(d.key).format("D MMM")}: ${fmt(d.totalTokens)} tokens, ${fmt(d.requests)} requests${d.blocked ? `, ${d.blocked} blocked` : ""}`}>
                      <div className="usage-col">
                        <div className={`usage-bar ${d.blocked ? "is-blocked" : ""}`} style={{ height: `${Math.max(2, ((d.totalTokens || 0) / maxTokens) * 110)}px` }} />
                        <span className="usage-day">{dayjs(d.key).format("D")}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              ) : (
                <p className="text-gray">No AI usage yet</p>
              )}
              <p className="text-gray text-small margin-top_16">Orange bars mark days when some calls were blocked by a limit.</p>
            </section>
          </div>
        </>
      )}

      <section className="section-card ai-panel margin-top_16">
        <h2 className="section-title">Limits, models and instructions</h2>
        {settingsLoading && !Object.keys(settings).length ? (
          <Skeleton active />
        ) : (
          <Formik initialValues={toForm(settings)} enableReinitialize onSubmit={(v) => dispatch(updateAiSettings(toValues(v)))}>
            {({ dirty, resetForm }) => (
              <Form>
                <ConfigProvider componentDisabled={!canUpdate}>
                  <FormBuilder fields={fields} />
                </ConfigProvider>
                {canUpdate && (
                  <div className="flex-end gap-10">
                    <Button disabled={!dirty} onClick={() => resetForm()}>Discard</Button>
                    <Button type="primary" htmlType="submit" loading={updateLoading} disabled={!dirty}>Save AI settings</Button>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        )}
      </section>
    </ContainerWrapper>
  );
};

export default AiControl;
