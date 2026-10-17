import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Select, Tag, Tooltip } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { FormModal } from "../../components";
import { CTable } from "../../uiComponents";
import { getLeads, getLeadStatuses, saveLead } from "../../store/actions/Leads.action";
import { getCountries } from "../../store/actions/Countries.action";
import { getVisaTypes } from "../../store/actions/VisaTypes.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { LEAD_STATUS_COLORS } from "../../utils/Constants";
import { fromNow, renderDate, renderTag, tablePagination } from "../../utils/Methods";
import { LEAD_DEFAULTS, leadFields, leadSchema } from "./LeadForm";

const CRM_COLORS = { synced: "green", failed: "red", pending: "blue", skipped: "default" };

const Leads = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { can } = useACL();
  const { list, pagination, listLoading, saveLoading, statuses } = useSelector(({ leads }) => leads);
  const countries = useSelector(({ countries }) => countries.list);
  const visaTypes = useSelector(({ visaTypes }) => visaTypes.list);

  const [search, setSearch] = useState(params.get("search") || "");
  const [adding, setAdding] = useState(false);

  // Filters URL mein: refresh / share par wahi list
  const query = useMemo(() => Object.fromEntries([...params.entries()].filter(([, v]) => v)), [params]);
  const setQuery = (patch) => {
    const next = { ...query, ...patch };
    if (!("page" in patch)) delete next.page;
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v !== undefined && v !== null && v !== "")), { replace: true });
  };

  const fetchList = useCallback(() => dispatch(getLeads({ limit: 20, sort: "-createdAt", ...query })), [dispatch, query]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    dispatch(getLeadStatuses());
    if (can(ACL_MODULES.COUNTRIES, ACL_ACCESS_LIST.VIEW)) dispatch(getCountries({ limit: 200, sort: "name" }));
    if (can(ACL_MODULES.VISA_TYPES, ACL_ACCESS_LIST.VIEW)) dispatch(getVisaTypes({ limit: 200 }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => (search !== (query.search || "") ? setQuery({ search }) : null), 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const countryOptions = countries.map((c) => ({ value: c.name, label: c.name }));
  const visaOptions = [...new Set(visaTypes.map((v) => v.name))].map((n) => ({ value: n, label: n }));

  const columns = [
    { title: "Reference", dataIndex: "leadId", fixed: "left", render: (v) => <span className="mono font-semibold">{v}</span> },
    {
      title: "Customer",
      key: "customer",
      render: (_, r) => (
        <div>
          <div className="font-medium">{r.fullName || "-"}</div>
          <div className="text-gray text-small">{r.whatsapp}</div>
        </div>
      ),
    },
    { title: "Visa", key: "visa", render: (_, r) => [r.country, r.visaType].filter(Boolean).join(" ") || "-" },
    { title: "Travellers", dataIndex: "travellers", render: (v) => v || "-" },
    { title: "Travel date", dataIndex: "travelDate", render: (v) => v || "-" },
    { title: "Agent", dataIndex: "assignedAgent", render: (v) => v || "Unassigned" },
    { title: "Status", dataIndex: "status", render: (v) => renderTag(v, LEAD_STATUS_COLORS) },
    {
      title: "CRM",
      key: "crm",
      render: (_, r) => (
        <Tooltip title={r.crmSync?.error || undefined}>
          <Tag color={CRM_COLORS[r.crmSync?.status] || "default"} className="status-tag">{r.crmSync?.status || "skipped"}</Tag>
        </Tooltip>
      ),
    },
    { title: "Created", dataIndex: "createdAt", render: (v) => <Tooltip title={renderDate(v, true)}>{fromNow(v)}</Tooltip> },
  ];

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: "Leads",
        subtitle: "All applications created by the bot and your team. Click a row to see details.",
        actions: can(ACL_MODULES.LEADS, ACL_ACCESS_LIST.CREATE) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAdding(true)}>Add lead</Button>
        ),
      }}
    >
      <div className="filters-bar">
        <Input className="filters-search" allowClear prefix={<SearchOutlined />} placeholder="Search reference, name, number" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select allowClear placeholder="Status" value={query.status} options={statuses.map((s) => ({ value: s, label: s }))} onChange={(v) => setQuery({ status: v })} />
        <Select allowClear placeholder="Country" value={query.country} options={countryOptions} showSearch={{ optionFilterProp: "label" }} onChange={(v) => setQuery({ country: v })} />
        <Select allowClear placeholder="Channel" value={query.channel} options={["web", "whatsapp", "api", "test"].map((c) => ({ value: c, label: c }))} onChange={(v) => setQuery({ channel: v })} />
        <Button icon={<ReloadOutlined />} aria-label="Refresh" onClick={fetchList} />
      </div>

      <CTable
        columns={columns}
        dataSource={list}
        loading={listLoading}
        onRowClick={(r) => navigate(`/leads/${r._id}`)}
        emptyText={Object.keys(query).length ? "No leads match these filters" : "No leads yet. Try a test conversation with the bot."}
        pagination={tablePagination(pagination, (page, limit) => setQuery({ page, limit }))}
      />

      <FormModal
        open={adding}
        onClose={() => setAdding(false)}
        title="Add lead"
        subtitle="For walk-in or phone customers. If a customer with this WhatsApp number exists, the lead is linked to that profile."
        initialValues={LEAD_DEFAULTS}
        validationSchema={leadSchema}
        fields={leadFields(countryOptions, visaOptions)}
        loading={saveLoading}
        submitText="Add lead"
        onSubmit={(values) => dispatch(saveLead(values, (lead) => { setAdding(false); navigate(`/leads/${lead._id}`); }))}
      />
    </ContainerWrapper>
  );
};

export default Leads;
