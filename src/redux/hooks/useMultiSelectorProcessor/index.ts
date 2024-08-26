import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual } from 'react-redux';

import { AsyncRequest, Statuses } from 'src/redux/features/asyncUtils';
import { RootState } from 'src/redux/rootReducer';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import { createCombinedSelector, getCombinedStatus } from './util';

// selector processor callbacks for easier use
export type ProcessorCallbacksProps = {
  handleError?: boolean; // whether to pop up a toast error if the selector has an error
  dispatched?: boolean; // whether an action has been dispatched for this selector, defaults to true
  onData?: React.Dispatch<React.SetStateAction<any>>;
  onError?: (error: string) => void;
  onPartialSuccess?: (data?: any) => void;
  onPending?: () => void;
  onSuccess?: (data?: any) => void;
};

export type AsyncRequestSelector = (state: RootState) => AsyncRequest | undefined;

export type SelectorIdentifier = string;

export type SelectorConfig = [SelectorIdentifier, AsyncRequestSelector, ProcessorCallbacksProps?];

export type SelectorResultConfig = [SelectorIdentifier, AsyncRequest | undefined, ProcessorCallbacksProps?];

/**
 * App selector processor that sets data and processes status transition based callbacks
 */
export const useMultiSelectorProcessor = (
  selectors: SelectorConfig[]
): { status: Statuses; data: Record<SelectorIdentifier, AsyncRequest['data']> } => {
  const snackbar = useSnackbar();

  const [lastStatus, setLastStatus] = useState<Record<SelectorIdentifier, Statuses>>({});
  const [lastData, setLastData] = useState<Record<SelectorIdentifier, AsyncRequest['data']>>({});

  const results = useAppSelector(createCombinedSelector(selectors));

  useEffect(() => {
    const nextLastData = { ...lastData };
    const nextLastStatus = { ...lastStatus };

    results.forEach(([identifier, selectorResult, config]) => {
      const {
        handleError = true,
        dispatched = true,
        onData,
        onError,
        onPartialSuccess,
        onPending,
        onSuccess,
      } = config || {};

      if (!selectorResult || !dispatched) {
        return;
      }

      const { status, data } = selectorResult;

      if (lastStatus[identifier] === status && lastData[identifier] === data) {
        return;
      }

      nextLastStatus[identifier] = status;
      nextLastData[identifier] = data;

      if (status === 'error') {
        const errorMessage = strings.GENERIC_ERROR;
        if (handleError) {
          snackbar.toastError(errorMessage);
        }
        // Errors for async thunks are currently stored in the async result's data, eventually we
        // should implement an `error` property
        if (onError) {
          onError(`${data}`);
        }
      } else if (status === 'success') {
        if (onData) {
          onData(data);
        }
        if (onSuccess) {
          onSuccess(data);
        }
      } else if (status === 'partial-success') {
        if (onData) {
          onData(data);
        }
        if (onPartialSuccess) {
          onPartialSuccess(data);
        }
      } else if (onPending && status === 'pending') {
        onPending();
      }
    });

    if (!shallowEqual(lastStatus, nextLastStatus)) {
      setLastStatus(nextLastStatus);
    }

    if (!shallowEqual(lastData, nextLastData)) {
      setLastData(nextLastData);
    }
  }, [lastData, lastStatus, results]);

  return useMemo(() => {
    const statuses = Object.values(lastStatus);

    return {
      status: statuses.length === 0 ? 'pending' : getCombinedStatus(statuses),
      data: lastData,
    };
  }, [lastStatus, lastData]);
};
