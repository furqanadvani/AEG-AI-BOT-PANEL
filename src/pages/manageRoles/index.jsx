import { useEffect } from "react";
import { Button, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ContainerWrapper } from "../../containers";
import { ActionButtons } from "../../components";
import { CTable } from "../../uiComponents";
import { getRoles, setRoleStatus } from "../../store/actions/ManageRoles.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { renderActive, renderDate } from "../../utils/Methods";

const ManageRoles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useACL();
  const { list, listLoading, actionLoading, actionId } = useSelector(({ manageRoles }) => manageRoles);

  const canCreate = can(ACL_MODULES.MANAGE_ROLES, ACL_ACCESS_LIST.CREATE);
  const canEdit = can(ACL_MODULES.MANAGE_ROLES, ACL_ACCESS_LIST.UPDATE);
  const canToggle = can(ACL_MODULES.MANAGE_ROLES, ACL_ACCESS_LIST.DISABLE);

  useEffect(() => {
    dispatch(getRoles());
  }, [dispatch]);

  const columns = [
    { title: "Role", dataIndex: "name", render: (v) => <span className="font-semibold">{v}</span> },
    { title: "Description", dataIndex: "description", width: 340 },
    {
      title: "Access",
      dataIndex: "permissions",
      render: (p = []) => (
        <Tooltip title={p.map((x) => x.key).join(", ")}>
          <span>{p.some((x) => x.key === "ALL") ? "Full access" : `${p.length} modules`}</span>
        </Tooltip>
      ),
    },
    { title: "Status", dataIndex: "isActive", render: renderActive },
    { title: "Created", dataIndex: "createdAt", render: (v) => renderDate(v) },
    ...(canEdit || canToggle
      ? [{
          title: "",
          key: "actions",
          fixed: "right",
          render: (_, r) => (
            <ActionButtons
              record={r}
              loading={actionLoading && actionId === r._id}
              onEdit={canEdit ? () => navigate(`/manage-roles/${r._id}`) : undefined}
              onToggle={canToggle ? (rec, v) => dispatch(setRoleStatus(rec._id, v, () => dispatch(getRoles()))) : undefined}
            />
          ),
        }]
      : []),
  ];

  return (
    <ContainerWrapper
      pageHeaderProps={{
        title: "Roles",
        subtitle: "A role defines what members can do in each module: view, create, update, delete, disable.",
        actions: canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/manage-roles/add")}>Add role</Button>,
      }}
    >
      <CTable columns={columns} dataSource={list} loading={listLoading} onRowClick={canEdit ? (r) => navigate(`/manage-roles/${r._id}`) : undefined} emptyText="No roles yet" pagination={{ pageSize: 20 }} />
    </ContainerWrapper>
  );
};

export default ManageRoles;
