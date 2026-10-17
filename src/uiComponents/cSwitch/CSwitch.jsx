import { Switch } from "antd";
import CField from "../cField/CField";

/** Boolean field. Label ke sath ek line ka text bhi (onText) */
const CSwitch = ({ label, name, value, onChange = () => null, hint, error, disabled, onText, className }) => (
  <CField label={label} name={name} hint={hint} error={error} className={className}>
    <div className="d-flex align-item-center gap-10">
      <Switch id={name} checked={!!value} onChange={(v) => onChange(v, name)} disabled={disabled} />
      {onText && <span className="text-gray">{onText}</span>}
    </div>
  </CField>
);

export default CSwitch;
