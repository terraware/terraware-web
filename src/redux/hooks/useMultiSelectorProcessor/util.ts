import { createSelector } from '@reduxjs/toolkit';

import { Statuses } from 'src/redux/features/asyncUtils';
import { RootState } from 'src/redux/store';

import { SelectorConfig, SelectorResultConfig } from '.';

export const createCombinedSelector = (selectors: SelectorConfig[]) =>
  createSelector(
    selectors.map(
      ([identifier, selector, config]) =>
        (state: RootState): SelectorResultConfig => [identifier, selector(state), config]
    ),
    // Extracted values are passed to the result function for recalculation
    (...results) => results
  );

export const getCombinedStatus = (statuses: Statuses[]): Statuses =>
  statuses.reduce((acc: Statuses, curr: Statuses) => {
    if (curr === 'error') {
      // Error overrides all statuses
      return 'error';
    } else if (curr === 'pending') {
      // Pending overrides all but error
      if (['success', 'partial-success'].includes(acc)) {
        return curr;
      }

      return acc;
    } else if (curr === 'success') {
      // Success does not override any status
      if (['error', 'partial-success', 'pending'].includes(acc)) {
        return acc;
      }

      return curr;
    } else if (curr === 'partial-success') {
      // Partial success can override success only
      if (acc === 'success') {
        return curr;
      }

      return acc;
    }

    return acc;
  });
