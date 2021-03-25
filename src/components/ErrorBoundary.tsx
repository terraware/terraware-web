import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sendLog } from '../api/logs';

interface Props {
  children: ReactNode;
  handler?: () => void;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  // when an error occurred we want to update the statee
  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  // when an error ocurred log the message
  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.log('Uncaught error:', error, errorInfo);

    if (this.props.handler) {
      this.props.handler();
    } else {
      sendLog({
        level: 'error',
        message: error.message,
        details: errorInfo.componentStack,
      });
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.handler) {
        return <div></div>;
      } else {
        return <div>An error ocurred</div>;
      }
    }

    return this.props.children;
  }
}
