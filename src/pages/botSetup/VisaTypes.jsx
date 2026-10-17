import * as Yup from "yup";
import { CrudPage } from "../../components";
import actions from "../../store/actions/VisaTypes.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { VISA_ACTION_COLORS, VISA_ACTIONS } from "../../utils/Constants";
import { renderActive, renderList, renderTag } from "../../utils/Methods";
import { scopeLabel, useScopeOptions } from "./useCountryOptions";

const ACTION_HINT = { Apply: "bot takes the application", Refuse: "bot politely declines", Forward: "bot forwards to the team" };

const VisaTypes = () => {
  const { countryOptions } = useScopeOptions();

  const fields = [
    { name: "name", label: "Visa type", required: true, placeholder: "e.g. Tourist" },
    { name: "country", label: "Country", type: "select", options: countryOptions, allowClear: false, hint: "All = every country" },
    { name: "action", label: "Bot action", type: "select", allowClear: false, options: VISA_ACTIONS.map((a) => ({ value: a, label: `${a}: ${ACTION_HINT[a]}` })) },
    { name: "isActive", label: "Active", type: "switch" },
    { name: "aliases", label: "Other ways customers write it", type: "tags", span: 2, hint: "e.g. visit, ghoomna, holiday" },
    { name: "customerMessage", label: "Message to customer", type: "textarea", rows: 2, hint: "Shown on Refuse / Forward" },
  ];

  const columns = [
    { title: "Visa type", dataIndex: "name", render: (v) => <span className="font-semibold">{v}</span> },
    { title: "Country", dataIndex: "country", render: (v) => scopeLabel(v, "All countries") },
    { title: "Bot action", dataIndex: "action", render: (v) => renderTag(v, VISA_ACTION_COLORS) },
    { title: "Aliases", dataIndex: "aliases", render: renderList },
    { title: "Message", dataIndex: "customerMessage", width: 260, render: (v) => v || "-" },
    { title: "Status", dataIndex: "isActive", render: renderActive },
  ];

  return (
    <CrudPage
      title="Visa types"
      subtitle="How customer wording maps to visa types, and what the bot does for each."
      entity="visa type"
      storeKey="visaTypes"
      actions={actions}
      module={ACL_MODULES.VISA_TYPES}
      columns={columns}
      fields={fields}
      schema={Yup.object({ name: Yup.string().trim().required("Name is required"), action: Yup.string().required() })}
      defaultValues={{ name: "", country: "ALL", action: "Apply", isActive: true, aliases: [], customerMessage: "" }}
      toForm={(r) => ({ name: r.name, country: r.country || "ALL", action: r.action, isActive: r.isActive, aliases: r.aliases || [], customerMessage: r.customerMessage || "" })}
      filters={[
        { name: "action", placeholder: "Action", options: VISA_ACTIONS.map((a) => ({ value: a, label: a })) },
        { name: "country", placeholder: "Country", options: countryOptions },
      ]}
    />
  );
};

export default VisaTypes;
