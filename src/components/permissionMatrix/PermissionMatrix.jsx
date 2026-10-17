import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Input, Table, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { getAclModules } from "../../store/actions/ManageRoles.action";
import { useACL } from "../../utils/acl/UseACL";
import { hasPermission } from "../../utils/acl/Helper";
import { ACL_ACCESS_LIST } from "../../utils/acl/Index";
import "./PermissionMatrix.css";

const DEFAULT_TYPES = Object.values(ACL_ACCESS_LIST);

/**
 * Module x permission checkbox table (Roles aur API key scopes dono).
 * Rules: VIEW ke baghair baqi nahi; aur koi apne se zyada permission nahi de sakta (backend bhi rokta hai).
 */
const PermissionMatrix = ({ value = [], onChange, disabled = false }) => {
  const dispatch = useDispatch();
  const { modules, permissionTypes } = useSelector(({ manageRoles }) => manageRoles);
  const { permissions: myPermissions, isSuperAdmin } = useACL();
  const [search, setSearch] = useState("");
  const types = permissionTypes.length ? permissionTypes : DEFAULT_TYPES;

  useEffect(() => {
    dispatch(getAclModules());
  }, [dispatch]);

  const canGrant = (key, action) => isSuperAdmin || hasPermission(myPermissions, key, action);
  const accessOf = (key) => value.find((p) => p.key === key)?.access || [];

  const setAccess = (key, access) => {
    const rest = value.filter((p) => p.key !== key);
    onChange(access.length ? [...rest, { key, access }] : rest);
  };

  const toggle = (key, action, checked) => {
    let access = accessOf(key).filter((a) => a !== "ALL");
    if (checked) {
      access = [...new Set([...access, action, ACL_ACCESS_LIST.VIEW])];
    } else {
      access = action === ACL_ACCESS_LIST.VIEW ? [] : access.filter((a) => a !== action);
    }
    setAccess(key, access);
  };

  const toggleRow = (key, checked) => setAccess(key, checked ? types.filter((t) => canGrant(key, t)) : []);

  const grantAll = () =>
    onChange(modules.map((m) => ({ key: m.key, access: types.filter((t) => canGrant(m.key, t)) })).filter((p) => p.access.length));

  const rows = useMemo(
    () => modules.filter((m) => !search || `${m.label} ${m.key}`.toLowerCase().includes(search.toLowerCase())),
    [modules, search]
  );

  const columns = [
    {
      title: "Module",
      key: "module",
      fixed: "left",
      render: (_, m) => {
        const all = types.every((t) => accessOf(m.key).includes(t) || accessOf(m.key).includes("ALL"));
        const some = accessOf(m.key).length > 0;
        return (
          <Checkbox checked={all} indeterminate={some && !all} disabled={disabled || !canGrant(m.key, ACL_ACCESS_LIST.VIEW)} onChange={(e) => toggleRow(m.key, e.target.checked)}>
            <span className="perm-matrix-module">{m.label}</span>
            <span className="perm-matrix-key">{m.key}</span>
          </Checkbox>
        );
      },
    },
    ...types.map((t) => ({
      title: t.charAt(0) + t.slice(1).toLowerCase(),
      key: t,
      align: "center",
      width: 90,
      render: (_, m) => {
        const access = accessOf(m.key);
        const checked = access.includes(t) || access.includes("ALL");
        const blocked = !canGrant(m.key, t);
        const needsView = t !== ACL_ACCESS_LIST.VIEW && !access.includes(ACL_ACCESS_LIST.VIEW) && !access.includes("ALL");
        const box = <Checkbox aria-label={`${m.label} ${t}`} checked={checked} disabled={disabled || blocked} onChange={(e) => toggle(m.key, t, e.target.checked)} />;
        if (blocked) return <Tooltip title="Your own role does not have this permission">{box}</Tooltip>;
        return needsView && !checked ? <Tooltip title="This also turns on View">{box}</Tooltip> : box;
      },
    })),
  ];

  return (
    <div className="perm-matrix">
      <div className="perm-matrix-toolbar">
        <Input allowClear prefix={<SearchOutlined />} placeholder="Find module" style={{ maxWidth: 260 }} value={search} onChange={(e) => setSearch(e.target.value)} />
        {!disabled && (
          <div className="d-flex gap-10">
            <Button size="small" onClick={grantAll}>Select all</Button>
            <Button size="small" onClick={() => onChange([])}>Clear</Button>
          </div>
        )}
      </div>
      <Table rowKey="key" size="small" columns={columns} dataSource={rows} pagination={false} scroll={{ x: "max-content", y: 420 }} loading={!modules.length} />
    </div>
  );
};

export default PermissionMatrix;
