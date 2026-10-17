import { useEffect, useState } from "react";
import { Button, Empty, Skeleton, Tabs, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { CountCards, FormModal, UserAvatar } from "../../components";
import { CTable } from "../../uiComponents";
import { getCustomerProfile, saveCustomer } from "../../store/actions/Customers.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { LANGUAGES, LEAD_STATUS_COLORS, QUERY_STATUS_COLORS, QUERY_TYPE_COLORS } from "../../utils/Constants";
import { fromNow, readableText, renderDate, renderTag } from "../../utils/Methods";
import { CUSTOMER_DEFAULTS, customerFields, customerSchema, customerToForm, customerToPayload } from "./CustomerForm";
import "../leads/LeadDetails.css";

const CustomerProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useACL();
  const { profile, profileLoading, saveLoading } = useSelector(({ customers }) => customers);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    dispatch(getCustomerProfile(id));
  }, [dispatch, id]);

  const c = profile?.customer;
  if (profileLoading && c?._id !== id) {
    return (
      <ContainerWrapper pageHeaderProps={{ title: "Customer", renderBack: true, backTo: "/customers", hideTabs: true }}>
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </ContainerWrapper>
    );
  }
  if (!c || c._id !== id) {
    return (
      <ContainerWrapper pageHeaderProps={{ title: "Customer", renderBack: true, backTo: "/customers", hideTabs: true }}>
        <Empty description="Customer not found" />
      </ContainerWrapper>
    );
  }

  const { leads = [], queries = [], sessions = [] } = profile;

  const tabs = [
    {
      key: "leads",
      label: `Leads (${leads.length})`,
      children: (
        <CTable
          rowKey="_id"
          dataSource={leads}
          pagination={false}
          onRowClick={can(ACL_MODULES.LEADS, ACL_ACCESS_LIST.VIEW) ? (r) => navigate(`/leads/${r._id}`) : undefined}
          emptyText="No applications yet"
          columns={[
            { title: "Reference", dataIndex: "leadId", render: (v) => <span className="mono">{v}</span> },
            { title: "Visa", key: "v", render: (_, r) => [r.country, r.visaType].filter(Boolean).join(" ") },
            { title: "Status", dataIndex: "status", render: (v) => renderTag(v, LEAD_STATUS_COLORS) },
            { title: "Agent", dataIndex: "assignedAgent" },
            { title: "Created", dataIndex: "createdAt", render: (v) => renderDate(v) },
          ]}
        />
      ),
    },
    {
      key: "queries",
      label: `Queries (${queries.length})`,
      children: (
        <CTable
          dataSource={queries}
          pagination={false}
          emptyText="No queries"
          columns={[
            { title: "Type", dataIndex: "type", render: (v) => renderTag(v, QUERY_TYPE_COLORS) },
            { title: "Question", dataIndex: "question", render: (v) => <span className="pre-wrap">{v}</span> },
            { title: "Status", dataIndex: "status", render: (v) => renderTag(v, QUERY_STATUS_COLORS) },
            { title: "Created", dataIndex: "createdAt", render: (v) => fromNow(v) },
          ]}
        />
      ),
    },
    {
      key: "sessions",
      label: `Conversations (${sessions.length})`,
      children: (
        <CTable
          dataSource={sessions}
          pagination={false}
          emptyText="No conversations"
          onRowClick={can(ACL_MODULES.SESSIONS, ACL_ACCESS_LIST.VIEW) ? (r) => navigate(`/conversations/${r._id}`) : undefined}
          columns={[
            { title: "Session", dataIndex: "sessionId", render: (v) => <span className="mono">{v}</span> },
            { title: "Channel", dataIndex: "channel", render: (v) => <Tag>{v}</Tag> },
            { title: "Stage", dataIndex: "stage", render: (v) => readableText(v) },
            { title: "Messages", dataIndex: "messagesCount", align: "center" },
            { title: "Last message", dataIndex: "lastMessageAt", render: (v) => fromNow(v) },
          ]}
        />
      ),
    },
  ];

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: c.name,
        subtitle: `Customer since ${renderDate(c.createdAt)}, source: ${readableText(c.source)}`,
        renderBack: true,
        backTo: "/customers",
        hideTabs: true,
        actions: can(ACL_MODULES.CUSTOMERS, ACL_ACCESS_LIST.UPDATE) && <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>Edit profile</Button>,
      }}
    >
      <div className="detail-grid">
        <div>
          <CountCards
            items={[
              { key: "l", label: "Applications", value: leads.length, primary: true },
              { key: "q", label: "Queries", value: queries.length },
              { key: "s", label: "Conversations", value: sessions.length },
            ]}
          />
          <div className="margin-top_16">
            <Tabs items={tabs} />
          </div>
        </div>

        <aside className="detail-side">
          <section className="section-card detail-panel">
            <div className="d-flex gap-10 align-item-center margin-bottom-16">
              <UserAvatar name={c.name} size={52} />
              <div>
                <div className="font-semibold" style={{ fontSize: 16 }}>{c.name}</div>
                <div className="text-gray">{c.phone}</div>
              </div>
            </div>
            <dl className="kv-list">
              {[
                ["Email", c.email],
                ["WhatsApp", c.whatsapp],
                ["City", c.city],
                ["Language", LANGUAGES[c.preferredLanguage] || c.preferredLanguage],
                ["CNIC", c.cnic],
                ["Passport", c.passportNumber],
                ["Last seen", fromNow(c.lastSeenAt)],
                ["CRM id", c.crmId],
              ]
                .filter(([, v]) => v && v !== "-")
                .map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            {c.tags?.length > 0 && (
              <div className="d-flex gap-5 flex-wrap margin-top_16">
                {c.tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            )}
            {c.notes && <p className="pre-wrap margin-top_16">{c.notes}</p>}
          </section>
        </aside>
      </div>

      <FormModal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit customer"
        initialValues={{ ...CUSTOMER_DEFAULTS, ...customerToForm(c) }}
        validationSchema={customerSchema}
        fields={customerFields}
        loading={saveLoading}
        submitText="Save changes"
        onSubmit={(v) => dispatch(saveCustomer({ ...customerToPayload(v), _id: c._id }, () => { setEditing(false); dispatch(getCustomerProfile(id)); }))}
      />
    </ContainerWrapper>
  );
};

export default CustomerProfile;
