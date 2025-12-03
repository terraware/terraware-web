import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { SearchSortOrderElement } from 'src/queries/generated/search';
import { useLazySearchPlantingSitesQuery } from 'src/queries/search/plantingSites';
import PlantingSiteTypeSelect from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteTypeSelect';
import strings from 'src/strings';
import { PlantingSitesFilters } from 'src/types/PlantingSite';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import useQuery from 'src/utils/useQuery';

import PlantingSitesTable from './PlantingSitesTable';

export default function PlantingSitesList(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const contentRef = useRef(null);
  const query = useQuery();
  const [plantingSiteTypeSelectOpen, setPlantingSiteTypeSelectOpen] = useState(false);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrderElement>({
    field: 'name',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<PlantingSitesFilters>({});
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, DEFAULT_SEARCH_DEBOUNCE_MS);
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    if (query.get('new')) {
      setPlantingSiteTypeSelectOpen(true);
    }
  }, [query]);

  const [search, { data: plantingSites }] = useLazySearchPlantingSitesQuery();

  useEffect(() => {
    if (selectedOrganization) {
      void search({
        organizationId: selectedOrganization?.id,
        projectIds: filters.projectIds,
        searchTerm: debouncedSearchTerm,
        searchOrder: [searchSortOrder],
      });
    }
  }, [debouncedSearchTerm, filters.projectIds, search, searchSortOrder, selectedOrganization]);

  const filtersEmpty = useMemo(() => !filters.projectIds || filters.projectIds.length === 0, [filters]);

  if (plantingSites && filtersEmpty && !plantingSites.length) {
    return <EmptyStatePage pageName={'PlantingSites'} />;
  }

  return (
    <TfMain>
      {plantingSiteTypeSelectOpen && <PlantingSiteTypeSelect onClose={() => setPlantingSiteTypeSelectOpen(false)} />}
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ padding: theme.spacing(0, 0, 4, 3), display: 'flex', justifyContent: 'space-between' }}>
          <Grid item xs={6}>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.PLANTING_SITES}
            </Typography>
          </Grid>
          {plantingSites && plantingSites.length > 0 ? (
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              {isMobile ? (
                <Button
                  id='new-planting-site'
                  icon='plus'
                  onClick={() => setPlantingSiteTypeSelectOpen(true)}
                  size='medium'
                />
              ) : (
                <Button
                  id='new-planting-site'
                  icon='plus'
                  label={strings.ADD_PLANTING_SITE}
                  onClick={() => setPlantingSiteTypeSelectOpen(true)}
                  size='medium'
                />
              )}
            </Grid>
          ) : null}
        </Box>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      {plantingSites ? (
        <Box display='flex' flexDirection='column'>
          <PlantingSitesTable
            results={plantingSites}
            temporalSearchValue={temporalSearchValue}
            setTemporalSearchValue={setTemporalSearchValue}
            setSearchSortOrder={(order: SearchSortOrderElement) => setSearchSortOrder(order)}
            filters={filters}
            setFilters={setFilters}
          />
        </Box>
      ) : (
        <CircularProgress sx={{ margin: 'auto' }} />
      )}
    </TfMain>
  );
}
