import { useEffect, useState } from "react";
import { Alert, Button, Empty, Input, Popconfirm, Select, Skeleton, Tag } from "antd";
import { CloudSyncOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { FormModal, UserAvatar } from "../../components";
import { addLeadNote, assignLead, deleteLead, getLeadDetail, getLeadStatuses, saveLead, syncLeadCrm, updateLeadStatus } from "../../store/actions/Leads.action";
import { getAgents } from "../../store/actions/Agents.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { LANGUAGES } from "../../utils/Constants";
import { fromNow, readableText, renderDate } from "../../utils/Methods";
import { leadFields, leadSchema, leadToForm, LEAD_DEFAULTS } from "./LeadForm";
import "./LeadDetails.css";

const KV = ({ items }) => {
  const rows = items.filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (!rows.length) return null;
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

const LeadDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useACL();
  const { detail: lead, detailLoading, statuses, updateStatusLoading, assignLoading, addNoteLoading, crmSyncLoading, saveLoading } = useSelector(({ leads }) => leads);
  const agents = useSelector(({ agents }) => agents.list);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);

  const canUpdate = can(ACL_MODULES.LEADS, ACL_ACCESS_LIST.UPDATE);

  useEffect(() => {
    dispatch(getLeadDetail(id));
    dispatch(getLeadStatuses());
    if (can(ACL_MODULES.AGENTS, ACL_ACCESS_LIST.VIEW)) dispatch(getAgents({ limit: 200, isActive: true }));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (detailLoading && lead?._id !== id) {
    return (
      <ContainerWrapper pageHeaderProps={{ title: "Lead", renderBack: true, backTo: "/leads", hideTabs: true }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </ContainerWrapper>
    );
  }

  if (!lead || lead._id !== id) {
    return (
      <ContainerWrapper pageHeaderProps={{ title: "Lead", renderBack: true, backTo: "/leads", hideTabs: true }}>
        <Empty description="Lead not found" />
      </ContainerWrapper>
    );
  }

  const botData = Object.entries(lead.data || {}).filter(([, v]) => v !== "" && v !== null && typeof v !== "object");
  const crm = lead.crmSync || {};

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: lead.leadId,
        subtitle: `${[lead.country, lead.visaType].filter(Boolean).join(" ")} visa, ${fromNow(lead.createdAt)} via ${lead.channel || "web"}`,
        renderBack: true,
        backTo: "/leads",
        hideTabs: true,
        actions: (
          <>
            <Select
              style={{ minWidth: 190 }}
              value={lead.status}
              disabled={!canUpdate}
              loading={updateStatusLoading}
              options={(statuses.length ? statuses : [lead.status]).map((s) => ({ value: s, label: s }))}
              onChange={(s) => dispatch(updateLeadStatus(lead._id, s))}
              aria-label="Lead status"
            />
            {canUpdate && <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>Edit</Button>}
            {can(ACL_MODULES.LEADS, ACL_ACCESS_LIST.DELETE) && (
              <Popconfirm title="Delete this lead?" okText="Delete" okButtonProps={{ danger: true }} onConfirm={() => dispatch(deleteLead(lead._id, () => navigate("/leads")))}>
                <Button danger icon={<DeleteOutlined />} aria-label="Delete lead" />
              </Popconfirm>
            )}
          </>
        ),
      }}
    >
      <div className="detail-grid">
        <div>
          <section className="section-card detail-panel">
            <h2 className="section-title">Application</h2>
            <KV
              items={[
                ["Country", lead.country],
                ["Visa type", lead.visaType],
                ["Travel date", lead.travelDate],
                ["Duration", lead.duration],
                ["Travellers", lead.travellers],
                ["Relationship", lead.relationship],
                ["City to stay", lead.cityToStay],
                ["Bank statement", lead.bankStatement],
                ["Other details", lead.otherDetails],
                ["Language", LANGUAGES[lead.language] || lead.language],
              ]}
            />
            {lead.openQuestions && <Alert className="margin-top_16" type="info" showIcon title="Questions the team needs to answer" description={lead.openQuestions} />}
          </section>

          {botData.length > 0 && (
            <section className="section-card detail-panel">
              <h2 className="section-title">Collected by the bot</h2>
              <KV items={botData.map(([k, v]) => [readableText(k.replace(/([A-Z])/g, " $1")), String(v)])} />
            </section>
          )}

          <section className="section-card detail-panel">
            <h2 className="section-title">Notes</h2>
            {(lead.notes || []).length === 0 && <p className="text-gray margin-bottom-16">No notes yet. Add call or follow-up notes here.</p>}
            {[...(lead.notes || [])].reverse().map((n) => (
              <div key={n._id} className="note-item">
                <div className="pre-wrap">{n.text}</div>
                <div className="text-gray text-small" style={{ marginTop: 4 }}>{renderDate(n.at, true)}</div>
              </div>
            ))}
            {canUpdate && (
              <div className="margin-top_16">
                <Input.TextArea value={note} onChange={(e) => setNote(e.target.value)} autoSize={{ minRows: 2, maxRows: 6 }} placeholder="Write a note" maxLength={2000} />
                <div className="flex-end margin-top_16">
                  <Button type="primary" disabled={!note.trim()} loading={addNoteLoading} onClick={() => dispatch(addLeadNote(lead._id, note.trim(), () => setNote("")))}>
                    Add note
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="detail-side">
          <section className="section-card detail-panel">
            <h2 className="section-title">Customer</h2>
            <div className="d-flex gap-10 align-item-center margin-bottom-16">
              <UserAvatar name={lead.customer?.name || lead.fullName} size={44} />
              <div className="flex-1">
                <div className="font-semibold">{lead.customer?.name || lead.fullName || "-"}</div>
                <div className="text-gray">{lead.customer?.phone || lead.whatsapp}</div>
                {lead.customer?.email && <div className="text-gray text-small">{lead.customer.email}</div>}
              </div>
            </div>
            {lead.customer?._id && can(ACL_MODULES.CUSTOMERS, ACL_ACCESS_LIST.VIEW) && (
              <Link to={`/customers/${lead.customer._id}`}>Open customer profile</Link>
            )}
          </section>

          <section className="section-card detail-panel">
            <h2 className="section-title">Assigned agent</h2>
            <Select
              className="full-width"
              placeholder="Select an agent"
              value={lead.agent?._id}
              disabled={!canUpdate || !agents.length}
              loading={assignLoading}
              options={agents.map((a) => ({ value: a._id, label: `${a.name} (${a.country})` }))}
              onChange={(agentId) => dispatch(assignLead(lead._id, agentId))}
              showSearch={{ optionFilterProp: "label" }}
              notFoundContent="Add agents first in Bot > Agents"
            />
            {!lead.agent && <p className="text-gray text-small" style={{ marginTop: 6 }}>Assigned by bot: {lead.assignedAgent || "Unassigned"}</p>}
          </section>

          <section className="section-card detail-panel">
            <div className="d-flex justify-between align-item-center margin-bottom-16">
              <h2 className="section-title" style={{ marginBottom: 0 }}>CRM sync</h2>
              <Tag className="status-tag" color={{ synced: "green", failed: "red", pending: "blue" }[crm.status] || "default"}>{crm.status || "skipped"}</Tag>
            </div>
            <KV items={[["CRM id", crm.crmId], ["Synced", crm.syncedAt && renderDate(crm.syncedAt, true)], ["Error", crm.error]]} />
            {canUpdate && (
              <Button className={crm.crmId || crm.error ? "margin-top_16" : ""} block icon={<CloudSyncOutlined />} loading={crmSyncLoading} onClick={() => dispatch(syncLeadCrm(lead._id, () => dispatch(getLeadDetail(id))))}>
                Sync to CRM now
              </Button>
            )}
            <p className="text-gray text-small" style={{ marginTop: 8 }}>Sync is skipped while the CRM integration is off.</p>
          </section>

          <section className="section-card detail-panel">
            <h2 className="section-title">Record</h2>
            <KV items={[["Session", lead.sessionId && <span className="mono">{lead.sessionId}</span>], ["Created", renderDate(lead.createdAt, true)], ["Updated", renderDate(lead.updatedAt, true)]]} />
          </section>
        </aside>
      </div>

      <FormModal
        open={editing}
        onClose={() => setEditing(false)}
        title={`Edit ${lead.leadId}`}
        initialValues={{ ...LEAD_DEFAULTS, ...leadToForm(lead) }}
        validationSchema={leadSchema}
        fields={leadFields([], [])
          .map((f) => (["country", "visaType"].includes(f.name) ? { ...f, type: "text", options: undefined } : f))}
        loading={saveLoading}
        submitText="Save changes"
        onSubmit={(values) => dispatch(saveLead({ ...values, _id: lead._id }, () => { setEditing(false); dispatch(getLeadDetail(id)); }))}
      />
    </ContainerWrapper>
  );
};

export default LeadDetails;
