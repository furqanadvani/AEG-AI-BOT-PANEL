import { Component } from "react";
import { Button, Result } from "antd";

/** Ek page crash ho to poora app white screen na ho */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <Result
          status="warning"
          title="This page could not be loaded"
          subTitle={String(this.state.error?.message || "")}
          extra={<Button type="primary" onClick={() => window.location.reload()}>Reload page</Button>}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
