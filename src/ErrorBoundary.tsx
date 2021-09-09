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
  public static getDerivedStateFromError(_e: Error): State {
    // Update state so the next render will show the fallback UI.
    if (_e.message.includes('401')) {
      window.location.href = `https://auth.staging.terraware.io/auth/realms/terraware/protocol/openid-connect/auth?approval_prompt=force&client_id=seedbank&redirect_uri=${encodeURIComponent(
        window.location.href
      )}%2Foauth2%2Fcallback&response_type=code&scope=openid+email+profile&state=YlyrCGAwGVIBkiPye2sSjM-oNadkUV8wNvH1_Xjq21w%3A%2F`;
    }
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
