import * as Yup from "yup";
import { Tag, Tooltip } from "antd";
import { CrudPage } from "../../components";
import actions from "../../store/actions/Questions.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { QUESTION_TYPES } from "../../utils/Constants";
import { renderActive } from "../../utils/Methods";
import { scopeLabel, useScopeOptions } from "./useCountryOptions";

const TYPE_HINT = {
  text: "Any text",
  country: "Matched against Countries",
  visatype: "Matched against Visa types",
  name: "Checks it looks like a name",
  phone: "Pakistani or international number",
  number: "Range in Options, e.g. 1-20",
  choice: "Options, e.g. Yes | No",
  date: "Travel date (year is inferred)",
  duration: "e.g. 10 days, 2 weeks",
};

const Questions = () => {
  const { countryOptions, visaTypeOptions } = useScopeOptions({ withVisaTypes: true });

  const fields = [
    { section: "Question" },
    { name: "field", label: "Field key", required: true, placeholder: "e.g. travellers", hint: "Saved on the lead under this key. country, visaType, fullName and whatsapp are core fields" },
    { name: "label", label: "Label", placeholder: "e.g. Number of travellers" },
    { name: "whatToAsk", label: "What to ask", type: "textarea", rows: 2, hint: "The AI phrases this in the customer's language" },
    { name: "whyWeAsk", label: "Why we ask", type: "textarea", rows: 2, hint: "Shared if the customer asks why" },
    { section: "Answer type" },
    { name: "type", label: "Type", type: "select", allowClear: false, options: QUESTION_TYPES.map((t) => ({ value: t, label: `${t}: ${TYPE_HINT[t]}` })) },
    { name: "options", label: "Options", placeholder: "Yes | No  ya  1-20", show: (v) => ["choice", "number"].includes(v.type) },
    { section: "When to ask" },
    { name: "country", label: "Country", type: "select", options: countryOptions, allowClear: false },
    { name: "visaType", label: "Visa type", type: "select", options: visaTypeOptions, allowClear: false },
    { name: "askWhen", label: "Only ask when", placeholder: "e.g. travellers > 1", hint: "Empty = always" },
    { name: "order", label: "Order", type: "number", min: 1, hint: "Lower numbers are asked first" },
    { name: "required", label: "Required", type: "switch", onText: "Off = the bot will not ask" },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  const columns = [
    { title: "#", dataIndex: "order", width: 60 },
    { title: "Field", dataIndex: "field", render: (v, r) => <div><div className="font-semibold">{r.label || v}</div><div className="mono text-gray">{v}</div></div> },
    { title: "What to ask", dataIndex: "whatToAsk", width: 300, render: (v) => v || "-" },
    { title: "Type", dataIndex: "type", render: (v, r) => <Tooltip title={r.options || TYPE_HINT[v]}><Tag>{v}</Tag></Tooltip> },
    { title: "Scope", key: "scope", render: (_, r) => <div>{scopeLabel(r.country, "All countries")}<div className="text-small">{scopeLabel(r.visaType, "All visa types")}</div></div> },
    { title: "Required", dataIndex: "required", render: (v) => (v ? <Tag color="blue">Required</Tag> : <Tag>Optional</Tag>) },
    { title: "Condition", dataIndex: "askWhen", render: (v) => (v ? <span className="mono">{v}</span> : "-") },
    { title: "Status", dataIndex: "isActive", render: renderActive },
  ];

  return (
    <CrudPage
      title="Questions"
      subtitle="What the bot asks for an application, and in what order. Questions can differ by country or visa type."
      entity="question"
      storeKey="questions"
      actions={actions}
      module={ACL_MODULES.QUESTIONS}
      columns={columns}
      fields={fields}
      modalWidth={720}
      schema={Yup.object({
        field: Yup.string().trim().matches(/^[A-Za-z][A-Za-z0-9_]*$/, "Letters and numbers only, no spaces").required("Field key is required"),
        order: Yup.number().nullable(),
      })}
      defaultValues={{ field: "", label: "", whatToAsk: "", whyWeAsk: "", type: "text", options: "", country: "ALL", visaType: "ALL", askWhen: "", order: 10, required: true, isActive: true }}
      toForm={(r) => ({ ...r, options: r.options || "", askWhen: r.askWhen || "", whyWeAsk: r.whyWeAsk || "", whatToAsk: r.whatToAsk || "" })}
      toPayload={({ field, label, whatToAsk, whyWeAsk, type, options, country, visaType, askWhen, order, required, isActive }) => ({ field, label, whatToAsk, whyWeAsk, type, options, country, visaType, askWhen, order, required, isActive })}
      filters={[
        { name: "country", placeholder: "Country", options: countryOptions },
        { name: "type", placeholder: "Type", options: QUESTION_TYPES.map((t) => ({ value: t, label: t })) },
      ]}
    />
  );
};

export default Questions;
