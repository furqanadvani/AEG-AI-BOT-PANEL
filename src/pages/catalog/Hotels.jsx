import * as Yup from "yup";
import { CrudPage } from "../../components";
import actions from "../../store/actions/Hotels.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { OCCUPANCY } from "../../utils/Constants";
import { readableText, renderActive } from "../../utils/Methods";
import { money, useCurrencyOptions } from "./useCurrencyOptions";

// Form mein har occupancy ek column; backend { categoryName, rates: [{ occupancy, rate }] } chahta hai
const toRows = (cats = []) => cats.map((c) => ({ categoryName: c.categoryName, ...Object.fromEntries((c.rates || []).map((r) => [r.occupancy, r.rate])) }));
const fromRows = (rows = []) => rows.map((r) => ({ categoryName: r.categoryName, rates: OCCUPANCY.filter((o) => r[o] !== null && r[o] !== undefined && r[o] !== "").map((o) => ({ occupancy: o, rate: Number(r[o]) })) }));

const Hotels = () => {
  const currencyOptions = useCurrencyOptions();

  const fields = [
    { name: "hotelName", label: "Hotel", required: true, span: 2 },
    { name: "city", label: "City", required: true },
    { name: "country", label: "Country", required: true },
    { name: "currency", label: "Currency", type: "select", options: currencyOptions, required: true, allowClear: false },
    {
      name: "roomCategories",
      label: "Room categories (rate per night)",
      type: "list",
      addLabel: "Add category",
      newItem: { categoryName: "" },
      fields: [{ name: "categoryName", label: "Category", placeholder: "Standard" }, ...OCCUPANCY.map((o) => ({ name: o, label: readableText(o), type: "number", min: 0 }))],
    },
  ];

  const columns = [
    { title: "Hotel", dataIndex: "hotelName", render: (v, r) => <div><div className="font-semibold">{v}</div><div className="text-gray text-small">{[r.city, r.country].filter(Boolean).join(", ")}</div></div> },
    {
      title: "Rooms",
      dataIndex: "roomCategories",
      render: (cats = [], r) =>
        cats.length
          ? cats.map((c) => <div key={c._id || c.categoryName}><span className="font-medium">{c.categoryName}</span>: {(c.rates || []).map((x) => `${readableText(x.occupancy)} ${money(x.rate, r.currency)}`).join(", ") || "-"}</div>)
          : "-",
    },
    { title: "Status", dataIndex: "isActive", render: renderActive },
  ];

  return (
    <CrudPage
      title="Hotels"
      subtitle="Hotels and room rates by occupancy."
      entity="hotel"
      storeKey="hotels"
      actions={actions}
      module={ACL_MODULES.HOTEL}
      columns={columns}
      fields={fields}
      serverPaging={false}
      modalWidth={900}
      schema={Yup.object({
        hotelName: Yup.string().trim().required("Required"),
        city: Yup.string().trim().required("Required"),
        country: Yup.string().trim().required("Required"),
        currency: Yup.string().required("Select a currency"),
        roomCategories: Yup.array().of(Yup.object({ categoryName: Yup.string().trim().required("Required") })),
      })}
      defaultValues={{ hotelName: "", city: "", country: "", currency: undefined, roomCategories: [] }}
      toForm={(r) => ({ hotelName: r.hotelName, city: r.city, country: r.country, currency: r.currency?._id || r.currency, roomCategories: toRows(r.roomCategories) })}
      toPayload={(v) => ({ ...v, roomCategories: fromRows(v.roomCategories) })}
    />
  );
};

export default Hotels;
