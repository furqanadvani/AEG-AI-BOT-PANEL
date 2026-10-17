import * as Yup from "yup";
import { CrudPage } from "../../components";
import actions from "../../store/actions/Visas.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { renderActive } from "../../utils/Methods";
import { money, useCurrencyOptions } from "./useCurrencyOptions";

const VisaRates = () => {
  const currencyOptions = useCurrencyOptions();

  const fields = [
    { name: "visaName", label: "Visa name", required: true, placeholder: "e.g. UAE 30 days single entry", span: 2 },
    { name: "visaType", label: "Visa type", required: true, placeholder: "Tourist" },
    { name: "rate", label: "Rate", type: "number", min: 0, required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOptions, required: true, allowClear: false, hint: currencyOptions.length ? undefined : "Add a currency first" },
  ];

  const columns = [
    { title: "Visa", dataIndex: "visaName", render: (v) => <span className="font-semibold">{v}</span> },
    { title: "Type", dataIndex: "visaType" },
    { title: "Rate", dataIndex: "rate", align: "right", render: (v, r) => money(v, r.currency) },
    { title: "Status", dataIndex: "isActive", render: renderActive },
  ];

  return (
    <CrudPage
      title="Visa rates"
      subtitle="Visa prices for internal reference."
      entity="visa rate"
      storeKey="visas"
      actions={actions}
      module={ACL_MODULES.VISA}
      columns={columns}
      fields={fields}
      serverPaging={false}
      schema={Yup.object({ visaName: Yup.string().trim().required("Required"), visaType: Yup.string().trim().required("Required"), rate: Yup.number().min(0).required("Required"), currency: Yup.string().required("Select a currency") })}
      defaultValues={{ visaName: "", visaType: "", rate: null, currency: undefined }}
      toForm={(r) => ({ visaName: r.visaName, visaType: r.visaType, rate: r.rate, currency: r.currency?._id || r.currency })}
    />
  );
};

export default VisaRates;
