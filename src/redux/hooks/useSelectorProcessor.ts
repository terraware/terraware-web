import React, { useEffect, useState } from 'react';

import { Statuses } from 'src/redux/features/asyncUtils';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

// selector processor callbacks for easier use
export type ProcessorCallbacksProps = {
  handleError?: boolean; // whether to pop up a toast error if the selector has an error
  dispatched?: boolean; // whether an action has been dispatched for this selector, defaults to true
  onSuccess?: (data?: any) => void;
  onError?: (error: string) => void;
  onPending?: () => void;
  onPartialSuccess?: (data?: any) => void;
};

// callback to set data from selector on success
export type OnSelectorData = React.Dispatch<React.SetStateAction<any>>;

/**
 * Hook that handles callbacks with selectors
 */
export const useProcessorCallbacks = (
  selector: any,
  onData: OnSelectorData,
  { handleError = true, dispatched = true, onSuccess, onError, onPending, onPartialSuccess }: ProcessorCallbacksProps
) => {
  const [lastStatus, setLastStatus] = useState<Statuses>();
  const [lastData, setLastData] = useState<any>();
  const [lastError, setLastError] = useState<string>();
  const snackbar = useSnackbar();

  useEffect(() => {
    if (!selector || !dispatched) {
      return;
    }

    const { status, data, error } = selector;
    if (lastStatus === status && lastData === data && lastError === error) {
      return;
    }

    setLastStatus(status);
    setLastData(data);
    setLastError(error);

    if (status === 'error') {
      const errorMessage: string = error || strings.GENERIC_ERROR;
      if (handleError) {
        snackbar.toastError(errorMessage);
      }
      if (onError) {
        onError(errorMessage);
      }
    } else if (status === 'success') {
      onData(data);
      if (onSuccess) {
        onSuccess(data);
      }
    } else if (status === 'partial-success') {
      onData(data);
      if (onPartialSuccess) {
        onPartialSuccess(data);
      }
    } else if (onPending && status === 'pending') {
      onPending();
    }
  }, [
    selector,
    dispatched,
    snackbar,
    handleError,
    onData,
    onError,
    onPending,
    onSuccess,
    onPartialSuccess,
    lastData,
    lastError,
    lastStatus,
  ]);
};

/**
 * App selector processor that sets data and processes status transition based callbacks
 */
export const useSelectorProcessor = (
  selector: any,
  onData?: OnSelectorData,
  callbacksProps?: ProcessorCallbacksProps
) => {
  const [, setDefaultOnData] = useState<any>();
  useProcessorCallbacks(selector, onData || setDefaultOnData, callbacksProps || {});
};
