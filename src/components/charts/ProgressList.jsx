import { Empty } from "antd";
import "./Charts.css";

export const TONES = {
  blue: { fill: "linear-gradient(90deg, #3B82F6, #2563EB)", track: "#E8EEFD", badge: "#EFF4FF", text: "#2563EB" },
  green: { fill: "linear-gradient(90deg, #22C55E, #16A34A)", track: "#E3F6EA", badge: "#ECFDF3", text: "#15803D" },
  orange: { fill: "linear-gradient(90deg, #FB923C, #EF4444)", track: "#FDE9E4", badge: "#FFF4ED", text: "#C2410C" },
  violet: { fill: "linear-gradient(90deg, #A78BFA, #7C3AED)", track: "#EFEAFE", badge: "#F5F3FF", text: "#6D28D9" },
};

/**
 * items: [{ key, name, value, max, suffix, badge, tone }]
 * Reference ke "Weakest / Strongest topics" jaisi list
 */
const ProgressList = ({ items = [], tone = "blue", emptyText = "No data yet", showBadge = true, formatValue }) => {
  if (!items.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />;
  const max = Math.max(1, ...items.map((i) => i.max ?? i.value));

  return (
    <div className="progress-list">
      {items.map((item) => {
        const t = TONES[item.tone || tone];
        const pct = Math.round((item.value / (item.max ?? max)) * 100);
        return (
          <div key={item.key || item.name} className={`progress-row ${showBadge ? "" : "no-badge"}`}>
            {showBadge && (
              <span className="progress-row-badge" style={{ background: t.badge, color: t.text }} aria-hidden="true">
                {item.badge ?? String(item.name).slice(0, 2).toUpperCase()}
              </span>
            )}
            <div className="flex-1">
              <div className="progress-row-name">{item.name}</div>
              <div className="progress-row-track" style={{ background: t.track }}>
                <div className="progress-row-fill" style={{ width: `${Math.max(3, pct)}%`, background: t.fill }} />
              </div>
            </div>
            <div className="progress-row-value">{formatValue ? formatValue(item, pct) : item.value.toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressList;
