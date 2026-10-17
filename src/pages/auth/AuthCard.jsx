import BrandLogo from "../../components/brandLogo/BrandLogo";
import "./Auth.css";

const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="auth-container">
    <div className="auth-card auth-card-animated">
      <div className="auth-header">
        <div className="auth-logo">
          <BrandLogo size="lg" />
        </div>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-para">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="auth-footer">{footer}</div>}
    </div>
    <p className="auth-copy">© {new Date().getFullYear()} AEG Visa Consultancy</p>
  </div>
);

export default AuthCard;
