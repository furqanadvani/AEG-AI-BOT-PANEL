import { Tooltip } from "antd";
import "./Charts.css";

const niceMax = (v) => {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
};

/** Activity chart: data = [{ label, value, tooltip }] */
const BarChart = ({ data = [], ticks = 4 }) => {
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const axis = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max / ticks) * i));

  return (
    <div className="bar-chart" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
      <div className="bar-chart-axis" aria-hidden="true">
        {axis.map((a) => (
          <span key={a}>{a.toLocaleString()}</span>
        ))}
      </div>
      <div className="bar-chart-plot">
        {data.map((d) => (
          <Tooltip key={d.label} title={d.tooltip || `${d.label}: ${d.value.toLocaleString()}`}>
            <div className="bar-chart-col">
              <div className="bar-chart-track">
                <div className="bar-chart-fill" style={{ height: `${max ? (d.value / max) * 100 : 0}%` }} />
              </div>
              <span className="bar-chart-label">{d.label}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
