import { DatePicker, Input, InputNumber } from "antd";
import dayjs from "dayjs";
import CField from "../cField/CField";

/**
 * type: text | email | password | number | date | url
 * onChange(value, name): hamesha value deta hai (event nahi), Formik ke setFieldValue ke sath seedha chalta hai
 */
const CInput = ({
  label,
  name,
  type = "text",
  value,
  placeHolder,
  placeholder,
  onChange = () => null,
  onBlur,
  error,
  hint,
  required,
  disabled = false,
  min,
  max,
  prefix,
  suffix,
  format = "DD MMM YYYY",
  className,
  autoFocus,
  ...rest
}) => {
  const ph = placeHolder ?? placeholder;
  const status = error ? "error" : undefined;
  const common = { id: name, name, disabled, status, onBlur, autoFocus, placeholder: ph, ...rest };

  const control = (() => {
    if (type === "number") {
      return <InputNumber {...common} value={value ?? null} min={min} max={max} prefix={prefix} onChange={(v) => onChange(v, name)} />;
    }
    if (type === "date") {
      return <DatePicker {...common} value={value ? dayjs(value) : null} format={format} onChange={(d) => onChange(d ? d.toISOString() : null, name)} />;
    }
    if (type === "password") {
      return <Input.Password {...common} value={value ?? ""} prefix={prefix} autoComplete="current-password" onChange={(e) => onChange(e.target.value, name)} />;
    }
    return (
      <Input
        {...common}
        type={type}
        value={value ?? ""}
        prefix={prefix}
        suffix={suffix}
        autoComplete={type === "email" ? "email" : "off"}
        onChange={(e) => onChange(e.target.value, name)}
      />
    );
  })();

  return (
    <CField label={label} name={name} error={error} hint={hint} required={required} className={className}>
      {control}
    </CField>
  );
};

export default CInput;
