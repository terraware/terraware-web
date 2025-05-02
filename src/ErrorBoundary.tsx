import React, { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

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

  return (
    <ReactErrorBoundary
      fallback={<ErrorContent inApp />}
      onError={() => props.setShowNavBar?.(false)}
      onReset={() => {
        if (isDesktop) {
          props.setShowNavBar?.(true);
        }
        navigate(APP_PATHS.HOME);
      }}
    >
      {props.children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
