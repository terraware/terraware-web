import { useMemo } from 'react';

import { SkipToken } from '@reduxjs/toolkit/query';

import { ListDeliverablesApiArg, useListDeliverablesQuery } from 'src/queries/generated/deliverables';
import { ListDeliverablesElementWithOverdue, withOverdueStatus } from 'src/types/Deliverables';

/**
 * Lists deliverables with past-due, unsubmitted ones marked 'Overdue'.
 */
const useDeliverablesWithOverdue = (arg: ListDeliverablesApiArg | SkipToken) => {
  const { currentData, isFetching, isError, refetch } = useListDeliverablesQuery(arg);

  const deliverables = useMemo<ListDeliverablesElementWithOverdue[] | undefined>(
    () => currentData?.deliverables.map(withOverdueStatus),
    [currentData]
  );

  return { deliverables, isFetching, isError, refetch };
};

export default useDeliverablesWithOverdue;
