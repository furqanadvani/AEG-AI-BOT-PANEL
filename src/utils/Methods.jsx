import { Tag } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import holder from "./AntdStatic";
import { TOKEN } from "./Constants";

dayjs.extend(relativeTime);

export const ConditionalRendering = ({ condition, children, elseChildren = null }) => (condition ? children : elseChildren);

export const handleSuccess = (val) => holder.message?.success(val || "Done");

export const handleError = (val) => holder.message?.error(val || "Something went wrong");

/** Backend error ko seedhi zaban mein (422 validation details bhi) */
export const getErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;
  if (!error?.response) return "Cannot reach the server. Is the backend running?";
  if (Array.isArray(data?.details) && data.details.length) {
    return data.details.map((d) => d.message).join(", ");
  }
  return data?.message || fallback;
};

export const readableText = (text) => {
  if (!text) return "";
  const s = String(text).replace(/_/g, " ").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const getFullName = (user) => [user?.firstName, user?.lastName].filter(Boolean).join(" ");

export const getInitials = (name) => {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const AVATAR_COLORS = ["#2563EB", "#334155", "#0F766E", "#4338CA", "#0369A1", "#57534E", "#1E40AF", "#065F46"];
export const getColorFromName = (name = "") => {
  let hash = 0;
  for (const ch of String(name)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const renderDate = (date, withTime = false) => {
  if (!date || !dayjs(date).isValid()) return "-";
  return dayjs(date).format(withTime ? "DD MMM YYYY, hh:mm A" : "DD MMM YYYY");
};

export const fromNow = (date) => (date && dayjs(date).isValid() ? dayjs(date).fromNow() : "-");

export const renderTag = (val, colors = {}, fallback = "default") =>
  val ? (
    <Tag color={colors[val] || fallback} className="status-tag">
      {val}
    </Tag>
  ) : (
    "-"
  );

export const renderActive = (val) => (
  <Tag color={val ? "green" : "default"} className="status-tag">
    {val ? "Active" : "Disabled"}
  </Tag>
);

export const renderList = (arr) => (Array.isArray(arr) && arr.length ? arr.join(", ") : "-");

export const clearLocalstorage = () => localStorage.removeItem(TOKEN);

/** "a | b, c" ya array -> array */
export const toList = (v) =>
  (Array.isArray(v) ? v : String(v ?? "").split(/[|,;\n]/)).map((x) => String(x).trim()).filter(Boolean);

/** Table pagination props (backend meta.pagination se) */
export const tablePagination = (pagination, onChange) => ({
  current: pagination?.page || 1,
  pageSize: pagination?.limit || 20,
  total: pagination?.total || 0,
  showSizeChanger: true,
  pageSizeOptions: [10, 20, 50, 100],
  showTotal: (total) => `${total} records`,
  onChange,
});

export const copyText = async (text, label = "Copied") => {
  try {
    await navigator.clipboard.writeText(String(text));
    handleSuccess(label);
  } catch {
    handleError("Could not copy");
  }
};
