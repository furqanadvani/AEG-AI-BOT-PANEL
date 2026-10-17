import PageHeader from "../../components/pageHeaderWrapper/PageHeader";
import "./ContainerWrapper.css";

/** Har page: upar PageHeader (title, actions, group tabs), neeche content */
const ContainerWrapper = ({ children, pageHeaderProps }) => (
  <div className="container-wrapper-main">
    {pageHeaderProps && <PageHeader {...pageHeaderProps} />}
    <div className="container-wrapper-body">{children}</div>
  </div>
);

export default ContainerWrapper;
