import { useEffect, useState } from "react";
import { Alert, Button, Modal, Popconfirm, Tag, Tooltip, Typography } from "antd";
import { CopyOutlined, KeyOutlined, PlusOutlined, SyncOutlined } from "@ant-design/icons";
import * as Yup from "yup";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { ContainerWrapper } from "../../containers";
import { ActionButtons, FormModal, PermissionMatrix } from "../../components";
import { CField, CTable } from "../../uiComponents";
import { clearRevealedKey, deleteApiKey, getApiKeys, regenerateApiKey, saveApiKey, setApiKeyStatus } from "../../store/actions/ApiKeys.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { API_URL } from "../../utils/Constants";
import { copyText, fromNow, renderActive, renderDate, tablePagination } from "../../utils/Methods";

const fields = [
  { name: "name", label: "Name", required: true, placeholder: "e.g. n8n workflow, Website chat, CRM" },
  { name: "expiresAt", label: "Expires", type: "date", hint: "Empty = never expires" },
  { name: "description", label: "What it's for", type: "textarea", rows: 2 },
  { name: "ipAllowlist", label: "Allowed IPs", type: "tags", span: 2, placeholder: "e.g. 203.0.113.10", hint: "Empty = any IP" },
];

const schema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  permissions: Yup.array().min(1, "Select at least one scope"),
});

const DEFAULTS = { name: "", description: "", expiresAt: null, ipAllowlist: [], permissions: [{ key: ACL_MODULES.CHAT, access: [ACL_ACCESS_LIST.CREATE, ACL_ACCESS_LIST.VIEW] }] };

const ApiKeys = () => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const { list, pagination, listLoading, saveLoading, actionLoading, actionId, revealed, regenerateLoading } = useSelector(({ apiKeys }) => apiKeys);
  const [query, setQuery] = useState({ page: 1, limit: 20 });
  const [editing, setEditing] = useState(null);

  const allow = {
    create: can(ACL_MODULES.API_KEYS, ACL_ACCESS_LIST.CREATE),
    update: can(ACL_MODULES.API_KEYS, ACL_ACCESS_LIST.UPDATE),
    disable: can(ACL_MODULES.API_KEYS, ACL_ACCESS_LIST.DISABLE),
    remove: can(ACL_MODULES.API_KEYS, ACL_ACCESS_LIST.DELETE),
  };

  const fetchList = () => dispatch(getApiKeys(query));
  useEffect(() => { fetchList(); }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const columns = [
    { title: "Key", dataIndex: "name", render: (v, r) => <div><div className="font-semibold">{v}</div><div className="mono text-gray">{r.prefix}...</div></div> },
    {
      title: "Scopes",
      dataIndex: "permissions",
      width: 280,
      render: (p = []) => (
        <div className="d-flex gap-5 flex-wrap">
          {p.slice(0, 4).map((x) => <Tooltip key={x.key} title={x.access.join(", ")}><Tag>{x.key}</Tag></Tooltip>)}
          {p.length > 4 && <Tag>+{p.length - 4}</Tag>}
        </div>
      ),
    },
    { title: "Last used", dataIndex: "lastUsedAt", render: (v, r) => (v ? <Tooltip title={r.lastUsedIp}>{fromNow(v)}</Tooltip> : <span className="text-gray">Never</span>) },
    { title: "Calls", dataIndex: "usageCount", align: "right" },
    { title: "Expires", dataIndex: "expiresAt", render: (v) => (v ? <span style={{ color: dayjs(v).isBefore(dayjs()) ? "#DC2626" : undefined }}>{renderDate(v)}</span> : "Never") },
    { title: "Status", dataIndex: "isActive", render: renderActive },
    {
      title: "",
      key: "actions",
      fixed: "right",
      render: (_, r) => (
        <ActionButtons
          record={r}
          loading={(actionLoading || regenerateLoading) && actionId === r._id}
          extra={
            allow.update && (
              <Popconfirm title="Generate a new key?" description="The current key will stop working immediately." okText="Regenerate" onConfirm={() => dispatch(regenerateApiKey(r._id, fetchList))}>
                <Tooltip title="Regenerate">
                  <Button size="small" shape="circle" icon={<SyncOutlined />} aria-label="Regenerate key" />
                </Tooltip>
              </Popconfirm>
            )
          }
          onEdit={allow.update ? setEditing : undefined}
          onToggle={allow.disable ? (rec, v) => dispatch(setApiKeyStatus(rec._id, v, fetchList)) : undefined}
          onDelete={allow.remove ? (rec) => dispatch(deleteApiKey(rec._id, fetchList)) : undefined}
          deleteTitle="Delete this key?"
        />
      ),
    },
  ];

  const submit = (v) => {
    const payload = { ...v, expiresAt: v.expiresAt || null, ...(editing?._id && { _id: editing._id }) };
    dispatch(saveApiKey(payload, () => { setEditing(null); fetchList(); }));
  };

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: "API keys",
        subtitle: "Secure access for n8n, website chat, your CRM or an AI agent. Give each key only the access it needs.",
        actions: allow.create && <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>Create key</Button>,
      }}
    >
      <Alert
        className="margin-bottom-16"
        type="info"
        showIcon
        icon={<KeyOutlined />}
        title="How to use"
        description={<span>Send <span className="mono">x-api-key: aeg_...</span> in the request header. Example, chat with the bot: <span className="mono">POST {API_URL}/chat/message</span> (scope: Chat, create).</span>}
      />

      <CTable columns={columns} dataSource={list} loading={listLoading} emptyText="No API keys yet" pagination={tablePagination(pagination, (page, limit) => setQuery({ page, limit }))} />

      <FormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._id ? `Edit ${editing.name}` : "Create API key"}
        initialValues={editing?._id ? { name: editing.name, description: editing.description || "", expiresAt: editing.expiresAt, ipAllowlist: editing.ipAllowlist || [], permissions: editing.permissions || [] } : DEFAULTS}
        validationSchema={schema}
        fields={fields}
        onSubmit={submit}
        loading={saveLoading}
        submitText={editing?._id ? "Save changes" : "Create key"}
        width={860}
      >
        {({ values, errors, submitCount, setFieldValue }) => (
          <CField label="Scopes (what this key can do)" error={submitCount ? errors.permissions : undefined}>
            <PermissionMatrix value={values.permissions} onChange={(p) => setFieldValue("permissions", p)} />
          </CField>
        )}
      </FormModal>

      <Modal open={!!revealed} onCancel={() => dispatch(clearRevealedKey())} title="Copy your key now" footer={<Button type="primary" onClick={() => dispatch(clearRevealedKey())}>I've saved it</Button>} destroyOnHidden>
        <Alert className="margin-bottom-16" type="warning" showIcon title="This key will not be shown again" description="Only a hash is stored. If you lose it, regenerate the key." />
        <div className="section-card d-flex align-item-center gap-10" style={{ padding: "10px 12px" }}>
          <Typography.Text className="mono flex-1" style={{ wordBreak: "break-all" }}>{revealed?.key}</Typography.Text>
          <Button icon={<CopyOutlined />} onClick={() => copyText(revealed?.key, "API key copied")}>Copy</Button>
        </div>
      </Modal>
    </ContainerWrapper>
  );
};

export default ApiKeys;
