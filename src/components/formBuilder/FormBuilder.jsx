import { Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { FieldArray, getIn, useFormikContext } from "formik";
import { CInput, CSelect, CSwitch, CTextarea } from "../../uiComponents";
import "./FormBuilder.css";

/**
 * Field config se Formik form:
 *   { name, label, type, options, placeholder, hint, required, span: 2, show: (values) => bool, disabled, fields (list), section }
 *   type: text | email | password | number | date | textarea | select | multiselect | tags | switch | list
 */
export const FormField = ({ field, prefix = "" }) => {
  const { values, errors, touched, submitCount, setFieldValue, setFieldTouched } = useFormikContext();
  const name = prefix ? `${prefix}.${field.name}` : field.name;
  const value = getIn(values, name);
  const rawError = getIn(errors, name);
  const error = (submitCount || getIn(touched, name)) && typeof rawError === "string" ? rawError : undefined;
  const common = {
    name,
    label: field.label,
    placeholder: field.placeholder,
    hint: field.hint,
    required: field.required,
    disabled: typeof field.disabled === "function" ? field.disabled(values) : field.disabled,
    error,
    onChange: (v) => setFieldValue(name, v),
    onBlur: () => setFieldTouched(name, true),
  };

  switch (field.type) {
    case "textarea":
      return <CTextarea {...common} value={value} rows={field.rows || 3} maxLength={field.maxLength} />;
    case "select":
      return <CSelect {...common} value={value} data={typeof field.options === "function" ? field.options(values) : field.options} loading={field.loading} allowClear={field.allowClear ?? true} />;
    case "multiselect":
      return <CSelect {...common} mode="multiple" value={value} data={field.options} loading={field.loading} />;
    case "tags":
      return <CSelect {...common} mode="tags" value={value} data={field.options || []} open={field.options ? undefined : false} suffixIcon={null} />;
    case "switch":
      return <CSwitch {...common} value={value} onText={field.onText} />;
    case "list":
      return <ListField field={field} name={name} value={value} error={typeof rawError === "string" ? rawError : undefined} />;
    default:
      return <CInput {...common} type={field.type || "text"} value={value} min={field.min} max={field.max} />;
  }
};

const ListField = ({ field, name, value = [], error }) => (
  <div className="c-field">
    {field.label && <span className="c-field-label">{field.label}</span>}
    <FieldArray name={name}>
      {({ push, remove }) => (
        <div className="form-list">
          {(value || []).map((_, i) => (
            <div className="form-list-row" key={i}>
              {field.fields.map((sub) => (
                <FormField key={sub.name} field={sub} prefix={`${name}.${i}`} />
              ))}
              <Button className="form-list-remove" size="small" shape="circle" danger icon={<DeleteOutlined />} aria-label="Remove row" onClick={() => remove(i)} />
            </div>
          ))}
          <Button type="dashed" icon={<PlusOutlined />} onClick={() => push({ ...(field.newItem || {}) })}>
            {field.addLabel || "Add row"}
          </Button>
        </div>
      )}
    </FieldArray>
    {error && <span className="c-field-error">{error}</span>}
  </div>
);

const FormBuilder = ({ fields = [], single = false }) => {
  const { values } = useFormikContext();
  return (
    <div className={`form-grid ${single ? "is-single" : ""}`}>
      {fields
        .filter((f) => !f.show || f.show(values))
        .map((f) =>
          f.section ? (
            <div className="form-section-title" key={`s-${f.section}`}>{f.section}</div>
          ) : (
            <div key={f.name} className={f.span === 2 || ["textarea", "list"].includes(f.type) ? "span-2" : ""}>
              <FormField field={f} />
            </div>
          )
        )}
    </div>
  );
};

export default FormBuilder;
