import { useId } from "react";
import "./Charts.css";

/** Chhota trend line (KPI cards). values = numbers */
const Sparkline = ({ values = [], color = "var(--them-primary)" }) => {
  const id = useId().replace(/:/g, "");
  const W = 120;
  const H = 34;
  if (!values.length) return <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" />;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const pts = values.map((v, i) => [i * step, H - 3 - (v / max) * (H - 8)]);
  // Smooth curve (cardinal spline)
  const d = pts.reduce((acc, [x, y], i, a) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = a[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");

  return (
    <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${W},${H} L0,${H} Z`} fill={`url(#sg-${id})`} stroke="none" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export default Sparkline;
