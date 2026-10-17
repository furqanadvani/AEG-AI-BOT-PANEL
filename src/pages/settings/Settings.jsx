import { useEffect, useMemo, useState } from "react";
import { Button, ConfigProvider, Empty, Input, InputNumber, Popconfirm, Select, Skeleton, Switch, Tabs, Tooltip } from "antd";
import { DeleteOutlined, PlusOutlined, UndoOutlined } from "@ant-design/icons";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { ContainerWrapper } from "../../containers";
import { FormModal } from "../../components";
import { deleteSetting, getSettings, saveSetting, seedDefaultSettings, setSettingValues } from "../../store/actions/Settings.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { readableText, toList } from "../../utils/Methods";
import "./Settings.css";

const YES = /^(yes|y|true|1|on)$/i;
const GROUP_LABELS = { business: "Business", bot: "Bot behaviour", ai: "AI", ai_limits: "AI limits", system: "System", custom: "Custom" };
const GROUP_ORDER = ["business", "bot", "ai", "ai_limits", "system", "custom"];

const SettingControl = ({ setting, value, onChange }) => {
  switch (setting.type) {
    case "boolean":
      return <Switch checked={YES.test(String(value))} onChange={(v) => onChange(v ? "yes" : "no")} aria-label={setting.key} />;
    case "number":
      return <InputNumber style={{ width: 180 }} value={value === "" ? null : Number(value)} onChange={(v) => onChange(v === null ? "" : String(v))} aria-label={setting.key} />;
    case "list":
      return <Select mode="tags" style={{ width: "100%" }} value={toList(value)} open={false} suffixIcon={null} tokenSeparators={[",", "|"]} onChange={(v) => onChange(v.join("|"))} aria-label={setting.key} />;
    case "json":
      return <Input.TextArea className="mono" autoSize={{ minRows: 2, maxRows: 10 }} value={value} onChange={(e) => onChange(e.target.value)} aria-label={setting.key} />;
    default:
      return String(value || "").length > 80 || /Prompt|Tone|Message/.test(setting.key)
        ? <Input.TextArea autoSize={{ minRows: 2, maxRows: 8 }} value={value} onChange={(e) => onChange(e.target.value)} aria-label={setting.key} />
        : <Input value={value} onChange={(e) => onChange(e.target.value)} aria-label={setting.key} />;
  }
};

const newSettingFields = [
  { name: "key", label: "Key", required: true, placeholder: "e.g. WhatsAppGreeting", hint: "Letters and numbers only, no spaces" },
  { name: "type", label: "Type", type: "select", allowClear: false, options: ["string", "number", "boolean", "list", "json"].map((t) => ({ value: t, label: t })) },
  { name: "label", label: "Label", span: 2 },
  { name: "value", label: "Value", type: "textarea", rows: 2 },
  { name: "description", label: "Description", type: "textarea", rows: 2 },
];

const Settings = () => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const { list, listLoading, setValuesLoading, seedLoading, saveLoading } = useSelector(({ settings }) => settings);
  const [draft, setDraft] = useState({});
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  const canUpdate = can(ACL_MODULES.SETTINGS, ACL_ACCESS_LIST.UPDATE);
  const load = () => dispatch(getSettings({ limit: 200, sort: "group key" }));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const s = search.toLowerCase();
    const rows = list.filter((x) => !s || `${x.key} ${x.label} ${x.description}`.toLowerCase().includes(s));
    const by = {};
    for (const r of rows) (by[r.group || "custom"] ||= []).push(r);
    return Object.keys(by).sort((a, b) => (GROUP_ORDER.indexOf(a) + 99) % 99 - (GROUP_ORDER.indexOf(b) + 99) % 99).map((g) => ({ key: g, rows: by[g] }));
  }, [list, search]);

  const changed = Object.keys(draft).filter((k) => draft[k] !== (list.find((x) => x.key === k)?.value ?? ""));
  const valueOf = (s) => (s.key in draft ? draft[s.key] : s.value ?? "");

  const save = () => dispatch(setSettingValues(Object.fromEntries(changed.map((k) => [k, draft[k]])), () => { setDraft({}); load(); }));

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: "Settings",
        subtitle: "Business details and bot behaviour. The bot uses new values as soon as you save.",
        actions: (
          <>
            {can(ACL_MODULES.SETTINGS, ACL_ACCESS_LIST.CREATE) && (
              <>
                <Tooltip title="Adds any missing default settings. Existing values are not changed">
                  <Button icon={<UndoOutlined />} loading={seedLoading} onClick={() => dispatch(seedDefaultSettings(load))}>Restore missing defaults</Button>
                </Tooltip>
                <Button icon={<PlusOutlined />} onClick={() => setAdding(true)}>Add setting</Button>
              </>
            )}
            {canUpdate && (
              <Button type="primary" disabled={!changed.length} loading={setValuesLoading} onClick={save}>
                {changed.length ? `Save ${changed.length} change${changed.length > 1 ? "s" : ""}` : "Save changes"}
              </Button>
            )}
          </>
        ),
      }}
    >
      <Input.Search allowClear placeholder="Search settings" className="margin-bottom-16" style={{ maxWidth: 320 }} value={search} onChange={(e) => setSearch(e.target.value)} />

      {listLoading && !list.length ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : !groups.length ? (
        <Empty description={list.length ? "No settings match your search" : "No settings yet. Click 'Restore missing defaults'"} />
      ) : (
        <ConfigProvider componentDisabled={!canUpdate}>
          <Tabs
            items={groups.map((g) => ({
              key: g.key,
              label: `${GROUP_LABELS[g.key] || readableText(g.key)} (${g.rows.length})`,
              children: (
                <div className="section-card">
                  {g.rows.map((s) => (
                    <div key={s._id} className={`setting-row ${s.key in draft && changed.includes(s.key) ? "is-changed" : ""}`}>
                      <div className="setting-info">
                        <div className="font-semibold">{s.label || readableText(s.key.replace(/([A-Z])/g, " $1"))}</div>
                        <div className="mono text-gray">{s.key}</div>
                        {s.description && <div className="text-gray text-small">{s.description}</div>}
                      </div>
                      <div className="setting-control">
                        <SettingControl setting={s} value={valueOf(s)} onChange={(v) => setDraft((d) => ({ ...d, [s.key]: v }))} />
                      </div>
                      {can(ACL_MODULES.SETTINGS, ACL_ACCESS_LIST.DELETE) && g.key === "custom" && (
                        <Popconfirm title="Delete this setting?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => dispatch(deleteSetting(s._id, load))}>
                          <Button size="small" shape="circle" danger icon={<DeleteOutlined />} aria-label="Delete setting" />
                        </Popconfirm>
                      )}
                    </div>
                  ))}
                </div>
              ),
            }))}
          />
        </ConfigProvider>
      )}

      <FormModal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add setting"
        initialValues={{ key: "", type: "string", label: "", value: "", description: "", group: "custom" }}
        validationSchema={Yup.object({ key: Yup.string().matches(/^[A-Za-z][A-Za-z0-9_]*$/, "Letters and numbers only, no spaces").required("Key is required") })}
        fields={newSettingFields}
        loading={saveLoading}
        submitText="Add setting"
        onSubmit={(v) => dispatch(saveSetting(v, () => { setAdding(false); load(); }))}
      />
    </ContainerWrapper>
  );
};

export default Settings;
