import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { TrackingService } from 'src/services';
import { SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import PlantingSitesTable from 'src/components/PlantingSites/PlantingSitesTable';
import PlantingSiteTypeSelect from 'src/components/PlantingSites/PlantingSiteTypeSelect';
import { useOrganization, useTimeZones } from 'src/providers/hooks';
import { setTimeZone, useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import useForm from 'src/utils/useForm';

export type PlantingSitesFilters = {
  projectIds?: number[];
};

export default function PlantingSitesList(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone().get();
  const contentRef = useRef(null);
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [plantingSites, setPlantingSites] = useState<SearchResponseElement[] | null>();
  const [plantingSiteTypeSelectOpen, setPlantingSiteTypeSelectOpen] = useState(false);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
    field: 'name',
    direction: 'Ascending',
  });
  const [filters, setFilters] = useForm<PlantingSitesFilters>({});
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const { isMobile } = useDeviceInfo();

  const filtersEmpty = useCallback(() => !filters.projectIds || filters.projectIds.length === 0, [filters]);

  const onSearch = useCallback(async () => {
    const searchFields: SearchNodePayload[] = [];

    if (debouncedSearchTerm) {
      searchFields.push({
        operation: 'or',
        children: [
          { operation: 'field', field: 'name', type: 'Fuzzy', values: [debouncedSearchTerm] },
          { operation: 'field', field: 'description', type: 'Fuzzy', values: [debouncedSearchTerm] },
        ],
      });
    }

    if (filters.projectIds && filters.projectIds.length > 0) {
      searchFields.push({
        field: 'project_id',
        operation: 'field',
        type: 'Exact',
        values: filters.projectIds.map((projectId: number) => `${projectId}`),
      });
    }

    const apiSearchResults = await TrackingService.searchPlantingSites(
      selectedOrganization.id,
      searchFields,
      searchSortOrder
    );

    const transformedResults = apiSearchResults?.map((result) => setTimeZone(result, timeZones, defaultTimeZone));
    if (!debouncedSearchTerm) {
      setPlantingSites(transformedResults);
    }
    setSearchResults(transformedResults);
  }, [debouncedSearchTerm, filters.projectIds, selectedOrganization.id, searchSortOrder, timeZones, defaultTimeZone]);

  useEffect(() => {
    onSearch();
  }, [selectedOrganization, onSearch]);

  if (plantingSites && filtersEmpty() && !plantingSites.length) {
    return <EmptyStatePage backgroundImageVisible={true} pageName={'PlantingSites'} />;
  }

  return (
    <TfMain>
      <PlantingSiteTypeSelect open={plantingSiteTypeSelectOpen} onClose={() => setPlantingSiteTypeSelectOpen(false)} />
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
      <Grid display='flex' flexDirection={isMobile ? 'row' : 'column'} flexGrow={1}>
        {plantingSites ? (
          <Box display='flex' flexDirection='column'>
            <PlantingSitesTable
              results={searchResults || []}
              temporalSearchValue={temporalSearchValue}
              setTemporalSearchValue={setTemporalSearchValue}
              setSearchSortOrder={(order: SearchSortOrder) => setSearchSortOrder(order)}
              filters={filters}
              setFilters={setFilters}
            />
          </Box>
        ) : (
          <CircularProgress sx={{ margin: 'auto' }} />
        )}
      </Grid>
    </TfMain>
  );
}
