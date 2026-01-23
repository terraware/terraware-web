import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';

import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { SearchSortOrderElement } from 'src/queries/generated/search';
import { useLazySearchDraftPlantingSitesQuery } from 'src/queries/search/draftPlantingSites';
import { useLazySearchPlantingSitesQuery } from 'src/queries/search/plantingSites';
import { PlantingSitesFilters } from 'src/types/PlantingSite';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';

import PlantingSitesTable from './PlantingSitesTable';

type PlantingSitesListTabProps = {
  isDraft?: boolean;
};

export default function PlantingSitesListTab({ isDraft }: PlantingSitesListTabProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrderElement>({
    field: 'name',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<PlantingSitesFilters>({});
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);

  const [search, { data: plantingSites, isLoading: sitesLoading }] = useLazySearchPlantingSitesQuery();
  const [searchDraft, { data: draftPlantingSites, isLoading: draftSitesLoading }] =
    useLazySearchDraftPlantingSitesQuery();

  useEffect(() => {
    if (selectedOrganization) {
      if (isDraft) {
        void searchDraft(
          {
            organizationId: selectedOrganization?.id,
            projectIds: filters.projectIds,
            searchTerm: debouncedSearchTerm,
            searchOrder: [searchSortOrder],
          },
          true
        );
      } else {
        void search(
          {
            organizationId: selectedOrganization?.id,
            projectIds: filters.projectIds,
            searchTerm: debouncedSearchTerm,
            searchOrder: [searchSortOrder],
          },
          true
        );
      }
    }
  }, [debouncedSearchTerm, filters.projectIds, isDraft, search, searchDraft, searchSortOrder, selectedOrganization]);

  const isLoading = useMemo(() => {
    if (isDraft) {
      return draftSitesLoading;
    } else {
      return sitesLoading;
    }
  }, [draftSitesLoading, isDraft, sitesLoading]);

  const combinedSites = useMemo(() => {
    if (isDraft) {
      return draftPlantingSites ?? [];
    } else {
      return plantingSites ?? [];
    }
  }, [draftPlantingSites, isDraft, plantingSites]);

  return !isLoading ? (
    <Box display='flex' flexDirection='column'>
      <PlantingSitesTable
        results={combinedSites}
        temporalSearchValue={temporalSearchValue}
        setTemporalSearchValue={setTemporalSearchValue}
        setSearchSortOrder={setSearchSortOrder}
        filters={filters}
        setFilters={setFilters}
      />
    </Box>
  ) : (
    <CircularProgress sx={{ margin: 'auto' }} />
  );
}
