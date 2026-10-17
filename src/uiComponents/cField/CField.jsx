import "./CField.css";

/** Label + control + hint/error. Saare uiComponents isi mein wrap hote hain */
const CField = ({ label, name, required, hint, error, className = "", children }) => (
  <div className={`c-field ${className}`}>
    {label && (
      <label htmlFor={name} className="c-field-label">
        {label}
        {required && <span className="c-field-required">*</span>}
      </label>
    )}
    {children}
    {error ? <span className="c-field-error">{error}</span> : hint ? <span className="c-field-hint">{hint}</span> : null}
  </div>
);

export default CField;
