import { Skeleton } from "antd";
import "./CountCards.css";

/**
 * items: [{ key, label, value, hint, icon, primary, accent, onClick }]
 * accent = left edge color (status ka rang); primary = blue card (sab se ahem number)
 */
const CountCards = ({ items = [], loading = false }) => {
  if (loading) {
    return (
      <div className="count-cards">
        {Array.from({ length: items.length || 4 }).map((_, i) => (
          <div className="count-card" key={i}>
            <Skeleton active paragraph={false} title={{ width: "60%" }} />
            <Skeleton.Button active size="small" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="count-cards">
      {items.map((item) => {
        const Wrapper = item.onClick ? "button" : "div";
        return (
          <Wrapper key={item.key || item.label} type={item.onClick ? "button" : undefined} className={`count-card ${item.primary ? "is-primary" : ""}`} onClick={item.onClick}>
            {item.accent && <span className="count-card-accent" style={{ background: item.accent }} />}
            <span className="count-card-label">
              {item.icon}
              {item.label}
            </span>
            <span className="count-card-value">{item.value ?? 0}</span>
            {item.hint && <span className="count-card-hint">{item.hint}</span>}
          </Wrapper>
        );
      })}
    </div>
  );
};

export default CountCards;
