import React from "react";
import { logger } from "@/lib/monitoring/logger";

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("frontend_render_error", {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="app-shell-error" id="main-content">
        <div className="container app-shell-error-card">
          <p className="eyebrow">Temporary Website Issue</p>
          <h1>We hit an unexpected rendering problem.</h1>
          <p className="muted-note">
            Please refresh the page. If the issue continues, contact
            hello@automivex.com and mention that the public site failed to render.
          </p>
          <button className="btn" type="button" onClick={this.handleRefresh}>
            Refresh Page
          </button>
        </div>
      </main>
    );
  }
}
