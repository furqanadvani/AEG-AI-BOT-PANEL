import * as Yup from "yup";
import { CrudPage } from "../../components";
import actions from "../../store/actions/Knowledge.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { renderActive } from "../../utils/Methods";
import { scopeLabel, useScopeOptions } from "./useCountryOptions";

const Knowledge = () => {
  const { countryOptions, visaTypeOptions } = useScopeOptions({ withVisaTypes: true });

  const fields = [
    { name: "topic", label: "Topic", required: true, placeholder: "e.g. Processing time", span: 2 },
    { name: "info", label: "Information", type: "textarea", rows: 5, required: true, maxLength: 4000, hint: "The bot only uses these facts (prices, documents, timelines). Anything not here, it will not say" },
    { name: "country", label: "Country", type: "select", options: countryOptions, allowClear: false },
    { name: "visaType", label: "Visa type", type: "select", options: visaTypeOptions, allowClear: false },
    { name: "isActive", label: "Active", type: "switch" },
  ];

  const columns = [
    { title: "Topic", dataIndex: "topic", render: (v) => <span className="font-semibold">{v}</span> },
    { title: "Information", dataIndex: "info", width: 440, render: (v) => <span className="pre-wrap">{String(v).slice(0, 220)}{String(v).length > 220 ? "..." : ""}</span> },
    { title: "Country", dataIndex: "country", render: (v) => scopeLabel(v, "All") },
    { title: "Visa type", dataIndex: "visaType", render: (v) => scopeLabel(v, "All") },
    { title: "Status", dataIndex: "isActive", render: renderActive },
  ];

  return (
    <CrudPage
      title="Knowledge"
      subtitle="The bot answers customer questions from here. Answers from Queries can be added here too."
      entity="knowledge"
      storeKey="knowledge"
      actions={actions}
      module={ACL_MODULES.KNOWLEDGE}
      columns={columns}
      fields={fields}
      modalWidth={720}
      schema={Yup.object({ topic: Yup.string().trim().required("Topic is required"), info: Yup.string().trim().required("Information is required") })}
      defaultValues={{ topic: "", info: "", country: "ALL", visaType: "ALL", isActive: true }}
      toForm={(r) => ({ topic: r.topic, info: r.info, country: r.country || "ALL", visaType: r.visaType || "ALL", isActive: r.isActive })}
      searchPlaceholder="Search topic or information"
      filters={[{ name: "country", placeholder: "Country", options: countryOptions }]}
    />
  );
};

export default Knowledge;
