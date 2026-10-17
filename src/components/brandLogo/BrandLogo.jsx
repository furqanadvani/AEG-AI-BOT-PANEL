import "./BrandLogo.css";

/** AEG wordmark (sidebar, login, loader) */
const BrandLogo = ({ size = "md", tagline = true }) => (
  <span className={`brand-logo is-${size}`} aria-label="AEG Visa Consultancy">
    <span className="brand-logo-word">AEG</span>
    {tagline && <span className="brand-logo-tag">Visa Consultancy</span>}
  </span>
);

export default BrandLogo;
