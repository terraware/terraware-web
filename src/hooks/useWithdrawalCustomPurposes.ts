import { useEffect, useMemo } from 'react';

import { useLocalization, useOrganization } from 'src/providers';
import {
  WithdrawalCustomPurposePayload,
  useLazyListCustomPurposesQuery,
} from 'src/queries/generated/withdrawalCustomPurposes';

type UseWithdrawalCustomPurposesProps = {
  includeArchived?: boolean;
};

/**
 * The organization's saved names for Other nursery withdrawals, sorted by name. Archived purposes
 * are left out of the withdrawal form but are still needed where past withdrawals are listed.
 */
const useWithdrawalCustomPurposes = (props?: UseWithdrawalCustomPurposesProps) => {
  const { includeArchived } = props ?? {};
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [listCustomPurposes, listCustomPurposesResponse] = useLazyListCustomPurposesQuery();

  const organizationId = selectedOrganization?.id;

  useEffect(() => {
    if (organizationId) {
      void listCustomPurposes({ organizationId, type: 'Nursery', includeArchived }, true);
    }
  }, [includeArchived, listCustomPurposes, organizationId]);

  const customPurposes = useMemo(
    (): WithdrawalCustomPurposePayload[] =>
      (listCustomPurposesResponse.currentData?.customPurposes ?? []).toSorted((a, b) =>
        a.name.localeCompare(b.name, activeLocale || undefined)
      ),
    [activeLocale, listCustomPurposesResponse.currentData]
  );

  return {
    customPurposes,
    hasLoaded: listCustomPurposesResponse.isSuccess,
    isLoading: listCustomPurposesResponse.isFetching,
  };
};

export default useWithdrawalCustomPurposes;
