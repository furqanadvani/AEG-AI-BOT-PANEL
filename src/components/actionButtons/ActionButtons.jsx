import { Button, Popconfirm, Tooltip } from "antd";
import { DeleteOutlined, EditOutlined, PoweroffOutlined } from "@ant-design/icons";

/**
 * Table row ke standard actions: edit / enable-disable / delete (ACL wala hissa caller deta hai).
 * Reference repo ke reject-btn / activate-btn / view-btn CSS ki jagah antd variants.
 */
const ActionButtons = ({ record, onEdit, onToggle, onDelete, loading = false, extra = null, statusField = "isActive", deleteTitle = "Delete this record?" }) => {
  const active = !!record?.[statusField];
  return (
    <div className="row-actions">
      {extra}
      {onEdit && (
        <Tooltip title="Edit">
          <Button size="small" shape="circle" icon={<EditOutlined />} aria-label="Edit" onClick={() => onEdit(record)} />
        </Tooltip>
      )}
      {onToggle && (
        <Popconfirm title={active ? "Disable this record?" : "Enable this record?"} okText="Yes" cancelText="No" onConfirm={() => onToggle(record, !active)}>
          <Tooltip title={active ? "Disable" : "Enable"}>
            <Button size="small" shape="circle" color={active ? "orange" : "green"} variant="outlined" loading={loading} icon={<PoweroffOutlined />} aria-label={active ? "Disable" : "Enable"} />
          </Tooltip>
        </Popconfirm>
      )}
      {onDelete && (
        <Popconfirm title={deleteTitle} description="This cannot be undone." okText="Delete" okButtonProps={{ danger: true }} cancelText="Cancel" onConfirm={() => onDelete(record)}>
          <Tooltip title="Delete">
            <Button size="small" shape="circle" danger icon={<DeleteOutlined />} aria-label="Delete" loading={loading} />
          </Tooltip>
        </Popconfirm>
      )}
    </div>
  );
};

export default ActionButtons;
