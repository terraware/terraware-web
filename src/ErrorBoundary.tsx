import React, { ErrorInfo, ReactNode, useCallback } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

import { addReactError } from '@datadog/browser-rum-react';
import { useDeviceInfo } from '@terraware/web-components/utils';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import ErrorContent from './ErrorContent';
import { APP_PATHS } from './constants';

interface Props {
  children: ReactNode;
  setShowNavBar?: (value: boolean) => void;
}

const ErrorBoundary = (props: Props) => {
  const navigate = useSyncNavigate();
  const { isDesktop } = useDeviceInfo();

  const handleError = useCallback(
    (error: Error, info: ErrorInfo) => {
      addReactError(error, info);
      props.setShowNavBar?.(false);
    },
    [props]
  );

  const handleReset = useCallback(() => {
    if (isDesktop) {
      props.setShowNavBar?.(true);
    }
    navigate(APP_PATHS.HOME);
  }, [isDesktop, navigate, props]);

  return (
    <ReactErrorBoundary fallback={<ErrorContent inApp />} onError={handleError} onReset={handleReset}>
      {props.children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
