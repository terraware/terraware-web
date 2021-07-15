import React, { Component, ErrorInfo, ReactNode } from 'react';
import strings from './strings';

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
    // tslint:disable-next-line: no-console
    console.log('Uncaught error:', error, errorInfo);

    if (this.props.handler) {
      this.props.handler();
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.handler) {
        return <div />;
      } else {
        return <div>{strings.GENERIC_ERROR}</div>;
      }
    }

    return this.props.children;
  }
}
