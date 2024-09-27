import React, { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';

import ErrorContent from './ErrorContent';
import { APP_PATHS } from './constants';

interface Props {
  children: ReactNode;
  setShowNavBar?: (value: boolean) => void;
}

const ErrorBoundary = (props: Props) => {
  const navigate = useNavigate();

  return (
    <ReactErrorBoundary
      fallback={<ErrorContent inApp />}
      onError={() => props.setShowNavBar?.(false)}
      onReset={() => {
        props.setShowNavBar?.(true);
        navigate(APP_PATHS.HOME);
      }}
    >
      {props.children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
