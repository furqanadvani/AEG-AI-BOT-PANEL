import * as Yup from "yup";
import { Tag } from "antd";
import { CrudPage } from "../../components";
import actions from "../../store/actions/Countries.action";
import { ACL_MODULES } from "../../utils/acl/Index";
import { renderList } from "../../utils/Methods";

const fields = [
  { name: "name", label: "Country", required: true, placeholder: "e.g. UAE" },
  { name: "isActive", label: "Bot serves this country", type: "switch", onText: "Off = the bot politely declines" },
  { name: "aliases", label: "Other ways customers write it", type: "tags", span: 2, hint: "e.g. Dubai, Emirates. Press Enter or use commas" },
  { name: "cities", label: "Cities", type: "tags", span: 2, hint: "The bot recognises the country from a city name" },
  { name: "notes", label: "Notes", type: "textarea", rows: 2 },
];

const schema = Yup.object({ name: Yup.string().trim().required("Country name is required") });

const columns = [
  { title: "Country", dataIndex: "name", render: (v) => <span className="font-semibold">{v}</span> },
  { title: "Bot", dataIndex: "isActive", render: (v) => <Tag color={v ? "green" : "red"} className="status-tag">{v ? "Serving" : "Refused"}</Tag> },
  { title: "Also known as", dataIndex: "aliases", render: renderList },
  { title: "Cities", dataIndex: "cities", render: renderList },
  { title: "Notes", dataIndex: "notes", render: (v) => v || "-" },
];

const Countries = () => (
  <CrudPage
    title="Countries"
    subtitle="Countries the bot serves. Turn one off and the bot will politely decline it."
    entity="country"
    storeKey="countries"
    actions={actions}
    module={ACL_MODULES.COUNTRIES}
    columns={columns}
    fields={fields}
    schema={schema}
    defaultValues={{ name: "", isActive: true, aliases: [], cities: [], notes: "" }}
    toForm={(r) => ({ name: r.name, isActive: r.isActive, aliases: r.aliases || [], cities: r.cities || [], notes: r.notes || "" })}
    searchPlaceholder="Search country, alias, city"
    filters={[{ name: "isActive", placeholder: "Status", options: [{ value: "true", label: "Serving" }, { value: "false", label: "Refused" }] }]}
  />
);

export default Countries;
