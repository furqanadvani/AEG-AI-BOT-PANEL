import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Select, Tooltip } from "antd";
import { CheckCircleOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { ActionButtons, FormModal } from "../../components";
import { CTable } from "../../uiComponents";
import { answerQuery, deleteQuery, getQueries } from "../../store/actions/Queries.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { QUERY_STATUS_COLORS, QUERY_STATUSES, QUERY_TYPE_COLORS, QUERY_TYPES } from "../../utils/Constants";
import { fromNow, readableText, renderDate, renderTag, tablePagination } from "../../utils/Methods";

const TYPE_HINTS = {
  UNANSWERED: "The bot could not answer",
  HUMAN: "Customer asked for a person",
  LOST: "Customer cancelled the application",
};

const answerSchema = Yup.object({
  answer: Yup.string().trim().when("addToKnowledge", { is: true, then: (s) => s.required("Write an answer to add it to Knowledge") }),
  status: Yup.string().required(),
});

const answerFields = [
  { name: "answer", label: "Answer", type: "textarea", rows: 4, placeholder: "What was / should be told to the customer" },
  { name: "status", label: "Status", type: "select", options: QUERY_STATUSES.map((s) => ({ value: s, label: s })), allowClear: false },
  { name: "addToKnowledge", label: "Teach the bot", type: "switch", onText: "Add this answer to Knowledge so the bot can answer next time" },
  { name: "topic", label: "Knowledge topic", placeholder: "Leave empty to use the question as the topic", show: (v) => v.addToKnowledge, span: 2 },
];

const Queries = () => {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { can } = useACL();
  const { list, pagination, listLoading, answerLoading, actionLoading, actionId } = useSelector(({ queries }) => queries);
  const [answering, setAnswering] = useState(null);
  const [search, setSearch] = useState(params.get("search") || "");

  const query = useMemo(() => Object.fromEntries([...params.entries()].filter(([, v]) => v)), [params]);
  const setQuery = (patch) => {
    const next = { ...query, ...patch };
    if (!("page" in patch)) delete next.page;
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)), { replace: true });
  };

  const fetchList = useCallback(() => dispatch(getQueries({ limit: 20, sort: "-createdAt", ...query })), [dispatch, query]);
  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => {
    const t = setTimeout(() => (search !== (query.search || "") ? setQuery({ search }) : null), 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const canUpdate = can(ACL_MODULES.QUERIES, ACL_ACCESS_LIST.UPDATE);
  const canDelete = can(ACL_MODULES.QUERIES, ACL_ACCESS_LIST.DELETE);

  const columns = [
    { title: "Type", dataIndex: "type", render: (v) => <Tooltip title={TYPE_HINTS[v]}>{renderTag(readableText(v), { [readableText(v)]: QUERY_TYPE_COLORS[v] })}</Tooltip> },
    {
      title: "Question",
      dataIndex: "question",
      width: 380,
      render: (v, r) => (
        <div>
          <div className="pre-wrap">{v}</div>
          {r.answer && <div className="text-gray text-small pre-wrap" style={{ marginTop: 4 }}>Answer: {r.answer}</div>}
        </div>
      ),
    },
    { title: "Customer", key: "c", render: (_, r) => <div><div>{r.fullName || "-"}</div><div className="text-gray text-small">{r.whatsapp}</div></div> },
    { title: "Visa", key: "v", render: (_, r) => [r.country, r.visaType].filter(Boolean).join(" ") || "-" },
    { title: "Status", dataIndex: "status", render: (v) => renderTag(v, QUERY_STATUS_COLORS) },
    { title: "Created", dataIndex: "createdAt", render: (v) => <Tooltip title={renderDate(v, true)}>{fromNow(v)}</Tooltip> },
    ...(canUpdate || canDelete
      ? [{
          title: "",
          key: "actions",
          fixed: "right",
          render: (_, r) => (
            <ActionButtons
              record={r}
              loading={actionLoading && actionId === r._id}
              extra={canUpdate && <Button size="small" icon={<CheckCircleOutlined />} onClick={() => setAnswering(r)}>{r.status === "Answered" ? "Edit answer" : "Answer"}</Button>}
              onDelete={canDelete ? (rec) => dispatch(deleteQuery(rec._id, fetchList)) : undefined}
            />
          ),
        }]
      : []),
  ];

  return (
    <ContainerWrapper pageHeaderProps={{ title: "Queries", subtitle: "Unanswered questions, requests for a person, and cancelled applications." }}>
      <div className="filters-bar">
        <Input className="filters-search" allowClear prefix={<SearchOutlined />} placeholder="Search question, name, number" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select allowClear placeholder="Type" value={query.type} options={QUERY_TYPES.map((t) => ({ value: t, label: readableText(t) }))} onChange={(v) => setQuery({ type: v })} />
        <Select allowClear placeholder="Status" value={query.status} options={QUERY_STATUSES.map((s) => ({ value: s, label: s }))} onChange={(v) => setQuery({ status: v })} />
        <Button icon={<ReloadOutlined />} aria-label="Refresh" onClick={fetchList} />
      </div>

      <CTable columns={columns} dataSource={list} loading={listLoading} emptyText="No queries. Everything has been answered." pagination={tablePagination(pagination, (page, limit) => setQuery({ page, limit }))} />

      <FormModal
        open={!!answering}
        onClose={() => setAnswering(null)}
        title="Answer query"
        subtitle={answering?.question}
        initialValues={{ answer: answering?.answer || "", status: "Answered", addToKnowledge: false, topic: "" }}
        validationSchema={answerSchema}
        fields={answerFields}
        loading={answerLoading}
        submitText="Save answer"
        onSubmit={(v) => dispatch(answerQuery(answering._id, { ...v, topic: v.topic || undefined }, () => { setAnswering(null); fetchList(); }))}
      />
    </ContainerWrapper>
  );
};

export default Queries;
