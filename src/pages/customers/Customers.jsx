import { useNavigate } from "react-router-dom";
import { Tag } from "antd";
import { CrudPage, UserAvatar } from "../../components";
import customerActions from "../../store/actions/Customers.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { fromNow, readableText } from "../../utils/Methods";
import { CUSTOMER_DEFAULTS, customerFields, customerSchema, customerToForm, customerToPayload } from "./CustomerForm";
import { CUSTOMER_SOURCES } from "../../utils/Constants";

const Customers = () => {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Customer",
      dataIndex: "name",
      fixed: "left",
      render: (v, r) => (
        <div className="d-flex gap-10 align-item-center">
          <UserAvatar name={v} size={34} />
          <div>
            <div className="font-medium">{v}</div>
            <div className="text-gray text-small">{r.email || r.city || ""}</div>
          </div>
        </div>
      ),
    },
    { title: "Phone", dataIndex: "phone" },
    { title: "Source", dataIndex: "source", render: (v) => <Tag className="status-tag">{readableText(v)}</Tag> },
    { title: "Leads", dataIndex: "leadsCount", align: "center" },
    { title: "Queries", dataIndex: "queriesCount", align: "center" },
    { title: "Tags", dataIndex: "tags", render: (t) => (t?.length ? t.map((x) => <Tag key={x}>{x}</Tag>) : "-") },
    { title: "Last seen", dataIndex: "lastSeenAt", render: (v) => fromNow(v) },
  ];

  return (
    <CrudPage
      title="Customers"
      subtitle="One profile per customer, identified by phone. The bot creates it as soon as it has a name and number."
      entity="customer"
      storeKey="customers"
      actions={customerActions}
      module={ACL_MODULES.CUSTOMERS}
      columns={columns}
      fields={customerFields}
      schema={customerSchema}
      defaultValues={CUSTOMER_DEFAULTS}
      toForm={customerToForm}
      toPayload={customerToPayload}
      searchPlaceholder="Search name, phone, email, CNIC"
      filters={[{ name: "source", placeholder: "Source", options: CUSTOMER_SOURCES.map((s) => ({ value: s, label: readableText(s) })) }]}
      onRowClick={(r) => navigate(`/customers/${r._id}`)}
    />
  );
};

export default Customers;
