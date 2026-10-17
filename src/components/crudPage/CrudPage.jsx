import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Select } from "antd";
import { PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { ContainerWrapper } from "../../containers";
import { CTable } from "../../uiComponents";
import ActionButtons from "../actionButtons/ActionButtons";
import FormModal from "../formBuilder/FormModal";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST } from "../../utils/acl/Index";
import { tablePagination } from "../../utils/Methods";

/**
 * Generic list + add/edit modal (Countries, Visa types, Questions, Knowledge, Agents, Catalog...).
 * Har page sirf apne columns / fields / schema deta hai.
 */
const CrudPage = ({
  title,
  subtitle,
  entity = "record",
  storeKey,
  actions,
  module,
  columns = [],
  fields = [],
  schema,
  defaultValues = {},
  toForm = (r) => r,
  toPayload = (v) => v,
  filters = [],
  searchPlaceholder = "Search",
  serverPaging = true,
  canToggle = true,
  canDelete = true,
  modalWidth = 640,
  extraRowActions,
  headerActions,
  onRowClick,
}) => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const { list, pagination, listLoading, saveLoading, actionLoading, actionId } = useSelector((s) => s[storeKey]);

  const [query, setQuery] = useState({ page: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = band, {} = naya, record = edit

  const allow = {
    create: can(module, ACL_ACCESS_LIST.CREATE),
    update: can(module, ACL_ACCESS_LIST.UPDATE),
    disable: canToggle && can(module, ACL_ACCESS_LIST.DISABLE),
    remove: canDelete && can(module, ACL_ACCESS_LIST.DELETE),
  };

  const fetchList = useCallback(() => {
    const params = serverPaging ? query : { ...query, page: undefined, limit: undefined, search: undefined };
    dispatch(actions.getList(Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))));
    }, [dispatch, actions, serverPaging ? query : JSON.stringify({ ...query, search: undefined, page: undefined, limit: undefined })]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Search: type rukne ke 400ms baad
  useEffect(() => {
    const t = setTimeout(() => setQuery((q) => (q.search === search ? q : { ...q, search, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [search]);

  const rows = useMemo(() => {
    if (serverPaging || !query.search) return list;
    const s = query.search.toLowerCase();
    return list.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [list, query.search, serverPaging]);

  const handleSubmit = (values) => {
    const payload = toPayload(values, editing);
    if (editing?._id) payload._id = editing._id;
    dispatch(actions.save(payload, () => {
      setEditing(null);
      fetchList();
    }));
  };

  const tableColumns = [
    ...columns,
    ...(allow.update || allow.disable || allow.remove || extraRowActions
      ? [{
          title: "",
          key: "actions",
          fixed: "right",
          width: 120,
          render: (_, record) => (
            <ActionButtons
              record={record}
              loading={actionLoading && actionId === record._id}
              extra={extraRowActions?.(record)}
              onEdit={allow.update ? (r) => setEditing(r) : undefined}
              onToggle={allow.disable ? (r, v) => dispatch(actions.setStatus(r._id, v, fetchList)) : undefined}
              onDelete={allow.remove ? (r) => dispatch(actions.remove(r._id, fetchList)) : undefined}
            />
          ),
        }]
      : []),
  ];

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title,
        subtitle,
        actions: (
          <>
            {headerActions}
            {allow.create && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({})}>
                Add {entity}
              </Button>
            )}
          </>
        ),
      }}
    >
      <div className="filters-bar">
        <Input className="filters-search" allowClear prefix={<SearchOutlined />} placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        {filters.map((f) => (
          <Select
            key={f.name}
            allowClear
            placeholder={f.placeholder}
            options={f.options}
            value={query[f.name]}
            onChange={(v) => setQuery((q) => ({ ...q, [f.name]: v, page: 1 }))}
            showSearch={{ optionFilterProp: "label" }}
          />
        ))}
        <Button icon={<ReloadOutlined />} onClick={fetchList} aria-label="Refresh" />
      </div>

      <CTable
        columns={tableColumns}
        dataSource={rows}
        loading={listLoading}
        onRowClick={onRowClick}
        emptyText={allow.create ? `No ${entity} yet. Click "Add ${entity}" to create one.` : `No ${entity} found`}
        pagination={
          serverPaging
            ? tablePagination(pagination, (page, limit) => setQuery((q) => ({ ...q, page, limit })))
            : { pageSize: 20, showSizeChanger: true, showTotal: (t) => `${t} records` }
        }
      />

      <FormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._id ? `Edit ${entity}` : `Add ${entity}`}
        initialValues={editing?._id ? { ...defaultValues, ...toForm(editing) } : defaultValues}
        validationSchema={schema}
        fields={fields}
        onSubmit={handleSubmit}
        loading={saveLoading}
        submitText={editing?._id ? "Save changes" : `Add ${entity}`}
        width={modalWidth}
      />
    </ContainerWrapper>
  );
};

export default CrudPage;
