import { Input } from "antd";
import CField from "../cField/CField";

const CTextarea = ({ label, name, value, placeHolder, placeholder, onChange = () => null, onBlur, error, hint, required, disabled, rows = 4, maxLength, className, ...rest }) => (
  <CField label={label} name={name} error={error} hint={hint} required={required} className={className}>
    <Input.TextArea
      id={name}
      name={name}
      value={value ?? ""}
      placeholder={placeHolder ?? placeholder}
      onChange={(e) => onChange(e.target.value, name)}
      onBlur={onBlur}
      status={error ? "error" : undefined}
      disabled={disabled}
      autoSize={{ minRows: rows, maxRows: rows + 8 }}
      maxLength={maxLength}
      showCount={!!maxLength}
      {...rest}
    />
  </CField>
);

export default CTextarea;
