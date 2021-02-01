/* eslint-disable no-console */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.log('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return <div>An error ocurred</div>;
    }

    return this.props.children;
  }
}
