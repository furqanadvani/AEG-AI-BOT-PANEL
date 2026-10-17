import { Empty, Table } from "antd";
import "./CTable.css";

/** onRowClick diya ho to poori row clickable (detail page) */
const CTable = ({ data, dataSource, columns = [], loading = false, rowKey = "_id", emptyText = "No records yet", onRowClick, className = "", ...rest }) => (
  <div className={`c-table-wrapper ${className}`}>
    <Table
      columns={columns}
      dataSource={dataSource ?? data ?? []}
      rowKey={rowKey}
      loading={loading}
      scroll={{ x: "max-content" }}
      locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} /> }}
      rowClassName={onRowClick ? "is-clickable" : undefined}
      onRow={onRowClick ? (record) => ({ onClick: (e) => !e.target.closest("button, a, .ant-popover, .ant-select, .ant-switch") && onRowClick(record) }) : undefined}
      {...rest}
    />
  </div>
);

export default CTable;
