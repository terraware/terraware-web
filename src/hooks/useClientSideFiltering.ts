import { useMemo } from 'react';

import { useLocalization } from 'src/providers';
import { SearchNodePayload, SearchSortOrder } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

const useClientSideFilter = <T extends Record<string, unknown>>(
  data: T[],
  search?: SearchNodePayload,
  searchSortOrder?: SearchSortOrder
) => {
  const { activeLocale } = useLocalization();

  const searchOrderConfig: SearchOrderConfig | undefined = useMemo(() => {
    if (searchSortOrder) {
      return {
        locale: activeLocale ?? null,
        sortOrder: searchSortOrder,
      };
    }
  }, [activeLocale, searchSortOrder]);

  return useMemo(() => searchAndSort(data, search, searchOrderConfig), [data, search, searchOrderConfig]);
};

export default useClientSideFilter;
