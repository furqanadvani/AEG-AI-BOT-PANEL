import * as Yup from "yup";
import { CrudPage } from "../../components";
import actions from "../../store/actions/Currencies.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { renderActive } from "../../utils/Methods";

const fields = [
  { name: "code", label: "Code", required: true, placeholder: "e.g. AED", disabled: (v) => !!v._isEdit },
  { name: "name", label: "Name", required: true, placeholder: "UAE Dirham" },
  { name: "symbol", label: "Symbol", required: true, placeholder: "د.إ" },
  { name: "decimalPlaces", label: "Decimal places", type: "number", min: 0, max: 6 },
  {
    name: "exchangeRates",
    label: "Exchange rates",
    type: "list",
    addLabel: "Add rate",
    newItem: { toCode: "", fromRate: 1, toRate: null },
    fields: [
      { name: "toCode", label: "To", placeholder: "PKR" },
      { name: "fromRate", label: "From rate", type: "number", min: 0 },
      { name: "toRate", label: "To rate", type: "number", min: 0 },
    ],
  },
];

const columns = [
  { title: "Code", dataIndex: "code", render: (v) => <span className="mono font-semibold">{v}</span> },
  { title: "Name", dataIndex: "name" },
  { title: "Symbol", dataIndex: "symbol" },
  { title: "Rates", dataIndex: "exchangeRates", render: (r = []) => (r.length ? r.map((x) => `1 = ${(x.toRate / (x.fromRate || 1)).toLocaleString()} ${x.toCode}`).join(", ") : "-") },
  { title: "Status", dataIndex: "isActive", render: renderActive },
];

const Currencies = () => (
  <CrudPage
    title="Currencies"
    subtitle="Currencies used for visa rates and hotel prices."
    entity="currency"
    storeKey="currencies"
    actions={actions}
    module={ACL_MODULES.CURRENCY}
    columns={columns}
    fields={fields}
    serverPaging={false}
    canDelete={false}
    modalWidth={720}
    schema={Yup.object({
      code: Yup.string().trim().length(3, "3 letters, e.g. AED").required("Code is required"),
      name: Yup.string().trim().required("Name is required"),
      symbol: Yup.string().trim().required("Symbol is required"),
      exchangeRates: Yup.array().of(Yup.object({ toCode: Yup.string().trim().length(3, "3 letters").required("Required"), fromRate: Yup.number().required("Required"), toRate: Yup.number().required("Required") })),
    })}
    defaultValues={{ code: "", name: "", symbol: "", decimalPlaces: 2, exchangeRates: [] }}
    toForm={(r) => ({ code: r.code, name: r.name, symbol: r.symbol, decimalPlaces: r.decimalPlaces, exchangeRates: (r.exchangeRates || []).map(({ toCode, fromRate, toRate }) => ({ toCode, fromRate, toRate })), _isEdit: true })}
    toPayload={({ _isEdit, ...v }) => ({ ...v, code: v.code.toUpperCase(), exchangeRates: v.exchangeRates.map((x) => ({ ...x, toCode: x.toCode.toUpperCase() })) })}
  />
);

export default Currencies;
