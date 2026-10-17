import { Select } from "antd";
import CField from "../cField/CField";

/**
 * data: [{ value, label }] ya [{ key, label }] ya ["string"]
 * mode: "multiple" | "tags" (tags = khud likh kar add, e.g. aliases)
 */
const CSelect = ({
  label,
  name,
  data = [],
  value,
  placeholder,
  onChange = () => null,
  onBlur,
  error,
  hint,
  required,
  mode,
  loading = false,
  disabled = false,
  allowClear = true,
  showSearch = true,
  className,
  ...rest
}) => {
  const options = data.map((item) =>
    typeof item === "object" ? { value: item.value ?? item.key ?? item._id, label: item.label ?? item.name ?? String(item.value ?? item.key) } : { value: item, label: item }
  );
  const isMulti = mode === "multiple" || mode === "tags";

  return (
    <CField label={label} name={name} error={error} hint={hint} required={required} className={className}>
      <Select
        id={name}
        mode={mode}
        value={isMulti ? (Array.isArray(value) ? value : []) : (value ?? undefined)}
        options={options}
        placeholder={placeholder}
        onChange={(v) => onChange(v, name)}
        onBlur={onBlur}
        status={error ? "error" : undefined}
        loading={loading}
        disabled={disabled}
        allowClear={allowClear}
        showSearch={showSearch ? { optionFilterProp: "label" } : false}
        tokenSeparators={mode === "tags" ? [",", "|"] : undefined}
        notFoundContent={loading ? "Loading..." : mode === "tags" ? "Type and press Enter" : "No options"}
        {...rest}
      />
    </CField>
  );
};

export default CSelect;
