import logo from "../../assets/Logo.svg";
import "./Loader.css";

const Loader = ({ text = "Loading your workspace" }) => (
  <div className="app-loader" role="status" aria-live="polite">
    <div className="app-loader-badge">
      <span className="app-loader-ring" />
      <img src={logo} alt="" />
    </div>
    <span className="app-loader-text">{text}</span>
  </div>
);

export default Loader;
