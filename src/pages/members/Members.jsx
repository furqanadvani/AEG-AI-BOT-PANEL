import { useEffect } from "react";
import * as Yup from "yup";
import { Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { CrudPage, UserAvatar } from "../../components";
import { getMembers, saveMember, setMemberStatus } from "../../store/actions/Members.action";
import { getRoles } from "../../store/actions/ManageRoles.action";
import { useACL } from "../../utils/acl/UseACL";
import { ACL_ACCESS_LIST, ACL_MODULES } from "../../utils/acl/Index";
import { fromNow, getFullName, renderActive, renderDate } from "../../utils/Methods";

const actions = { getList: getMembers, save: saveMember, setStatus: setMemberStatus };

const Members = () => {
  const dispatch = useDispatch();
  const { can } = useACL();
  const roles = useSelector(({ manageRoles }) => manageRoles.list);

  useEffect(() => {
    if (can(ACL_MODULES.MANAGE_ROLES, ACL_ACCESS_LIST.VIEW)) dispatch(getRoles());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const roleOptions = roles.filter((r) => r.isActive).map((r) => ({ value: r._id, label: r.name }));

  const fields = [
    { name: "firstName", label: "First name", required: true },
    { name: "lastName", label: "Last name", required: true },
    { name: "email", label: "Email", type: "email", required: true, span: 2 },
    { name: "role", label: "Role", type: "select", options: roleOptions, required: true, hint: "You can only assign roles with permissions up to your own" },
    { name: "password", label: "Password", type: "password", hint: "Leave empty when editing to keep the current one. Minimum 8 characters" },
  ];

  const columns = [
    {
      title: "Member",
      key: "name",
      render: (_, r) => (
        <div className="d-flex gap-10 align-item-center">
          <UserAvatar name={getFullName(r)} size={34} />
          <div>
            <div className="font-medium">{getFullName(r)}</div>
            <div className="text-gray text-small">{r.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Role", dataIndex: "role", render: (r) => (r ? <Tag color={r.isActive ? "blue" : "default"}>{r.name}</Tag> : "-") },
    { title: "Status", dataIndex: "isActive", render: renderActive },
    { title: "Last login", dataIndex: "lastLoginAt", render: (v) => (v ? fromNow(v) : <span className="text-gray">Never</span>) },
    { title: "Added", dataIndex: "createdAt", render: (v) => renderDate(v) },
  ];

  return (
    <CrudPage
      title="Members"
      subtitle="People who sign in to this panel. Each member's role controls what they can see and change."
      entity="member"
      storeKey="members"
      actions={actions}
      module={ACL_MODULES.MEMBERS}
      columns={columns}
      fields={fields}
      serverPaging={false}
      canDelete={false}
      searchPlaceholder="Search name or email"
      schema={Yup.object({
        firstName: Yup.string().trim().required("First name is required"),
        lastName: Yup.string().trim().required("Last name is required"),
        email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
        role: Yup.string().required("Select a role"),
        password: Yup.string().when("isEdit", { is: true, then: (s) => s.min(8, "Minimum 8 characters"), otherwise: (s) => s.min(8, "Minimum 8 characters").required("Password is required") }),
      })}
      defaultValues={{ firstName: "", lastName: "", email: "", role: undefined, password: "", isEdit: false }}
      toForm={(r) => ({ firstName: r.firstName, lastName: r.lastName, email: r.email, role: r.role?._id, password: "", isEdit: true })}
      toPayload={({ isEdit, password, ...v }) => ({ ...v, ...(password ? { password } : {}) })}
    />
  );
};

export default Members;
