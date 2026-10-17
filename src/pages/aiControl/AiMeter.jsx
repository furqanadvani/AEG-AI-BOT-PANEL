import { Progress } from "antd";
import { BRAND } from "../../utils/Theme";

const fmt = (n) => Number(n || 0).toLocaleString();

/** Usage vs limit bar (dashboard + AI control) */
const AiMeter = ({ label, used, limit, percent = 0 }) => (
  <div style={{ marginBottom: 14 }}>
    <div className="d-flex justify-between text-small" style={{ marginBottom: 4 }}>
      <span className="font-medium">{label}</span>
      <span className="text-gray">{limit > 0 ? `${fmt(used)} of ${fmt(limit)} (${percent}%)` : `${fmt(used)} (no limit)`}</span>
    </div>
    <Progress percent={limit > 0 ? Math.min(100, percent) : 0} showInfo={false} status={percent >= 100 ? "exception" : "normal"} strokeColor={percent >= 80 && percent < 100 ? BRAND.warning : undefined} />
  </div>
);

export default AiMeter;
