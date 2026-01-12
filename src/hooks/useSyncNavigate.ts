import { useCallback } from 'react';
import { NavigateOptions, To, useNavigate as useNavigateRouter } from 'react-router';

interface SyncNavigateFunction {
  (to: To, options?: NavigateOptions): void;

  (delta: number): void;
}

/**
 * Replaces the useNavigate hook to remove the need for adding `void navigate` to all usages to fix linting issues
 */
export const useSyncNavigate = (): SyncNavigateFunction => {
  const routerNavigate = useNavigateRouter();

  return useCallback(
    (toOrDelta, options?: NavigateOptions) => {
      if (typeof toOrDelta === 'number') {
        void routerNavigate(toOrDelta);
      } else {
        void routerNavigate(toOrDelta, options);
      }
    },
    [routerNavigate]
  );
};
