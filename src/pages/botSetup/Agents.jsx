import * as Yup from "yup";
import { CrudPage, UserAvatar } from "../../components";
import actions from "../../store/actions/Agents.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { renderActive } from "../../utils/Methods";
import { scopeLabel, useScopeOptions } from "./useCountryOptions";

const Agents = () => {
  const { countryOptions } = useScopeOptions();

  const fields = [
    { name: "name", label: "Name", required: true },
    { name: "email", label: "Email", type: "email", required: true, hint: "New lead emails go here" },
    { name: "phone", label: "Phone" },
    { name: "country", label: "Country", type: "select", options: countryOptions, allowClear: false, hint: "All = fallback when no other agent matches" },
    { name: "priority", label: "Priority", type: "number", min: 0, hint: "Higher priority is chosen first" },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  const columns = [
    { title: "Agent", dataIndex: "name", render: (v, r) => <div className="d-flex gap-10 align-item-center"><UserAvatar name={v} size={32} /><div><div className="font-medium">{v}</div><div className="text-gray text-small">{r.email}</div></div></div> },
    { title: "Country", dataIndex: "country", render: (v) => scopeLabel(v, "All countries (fallback)") },
    { title: "Phone", dataIndex: "phone", render: (v) => v || "-" },
    { title: "Priority", dataIndex: "priority", align: "center" },
    { title: "Status", dataIndex: "isActive", render: renderActive },
  ];

  return (
    <CrudPage
      title="Agents"
      subtitle="Leads are assigned to an agent by country, and the agent gets an email."
      entity="agent"
      storeKey="agents"
      actions={actions}
      module={ACL_MODULES.AGENTS}
      columns={columns}
      fields={fields}
      schema={Yup.object({ name: Yup.string().trim().required("Name is required"), email: Yup.string().trim().email("Enter a valid email").required("Email is required") })}
      defaultValues={{ name: "", email: "", phone: "", country: "ALL", priority: 0, isActive: true }}
      toForm={(r) => ({ name: r.name, email: r.email, phone: r.phone || "", country: r.country || "ALL", priority: r.priority || 0, isActive: r.isActive })}
      filters={[{ name: "country", placeholder: "Country", options: countryOptions }]}
    />
  );
};

export default Agents;
