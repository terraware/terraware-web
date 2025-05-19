import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { DEFAULT_SEARCH_DEBOUNCE_MS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useOrganization, useTimeZones } from 'src/providers/hooks';
import PlantingSiteTypeSelect from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteTypeSelect';
import { DraftPlantingSiteService, TrackingService } from 'src/services';
import strings from 'src/strings';
import { PlantingSitesFilters } from 'src/types/PlantingSite';
import { SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { sortResults } from 'src/utils/searchAndSort';
import useDebounce from 'src/utils/useDebounce';
import useForm from 'src/utils/useForm';
import useQuery from 'src/utils/useQuery';
import { setTimeZone, useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantingSitesTable from './PlantingSitesTable';

export default function PlantingSitesList(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone().get();
  const contentRef = useRef(null);
  const query = useQuery();
  const { activeLocale } = useLocalization();
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [plantingSites, setPlantingSites] = useState<SearchResponseElement[] | null>();
  const [plantingSiteTypeSelectOpen, setPlantingSiteTypeSelectOpen] = useState(false);
  const [searchSortOrder, setSearchSortOrder] = useState<SearchSortOrder>({
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
  const filtersEmpty = useCallback(() => !filters.projectIds || filters.projectIds.length === 0, [filters]);

  /**
   * Search planting sites and draft planting sites.
   * Return merged/sorted results.
   */
  const searchData = useCallback(
    async (searchFields: SearchNodePayload[]) => {
      if (selectedOrganization.id !== -1) {
        const searchRequests = [
          TrackingService.searchPlantingSites(selectedOrganization.id, searchFields, searchSortOrder),
        ];

        searchRequests.push(
          DraftPlantingSiteService.searchDraftPlantingSites(selectedOrganization.id, searchFields, searchSortOrder)
        );

        // batch the search requests
        const results = await Promise.allSettled(searchRequests);

        const sites: PlantingSiteSearchResult[] = results.reduce((acc, result) => {
          if (result.status === 'rejected') {
            return acc;
          }
          const { value } = result;

          return [
            ...acc,
            ...(value ?? []).map(
              (site) =>
                ({
                  ...setTimeZone(site, timeZones, defaultTimeZone),
                  numPlantingSubzones: site.numPlantingSubzones ?? '0',
                  numPlantingZones: site.numPlantingZones ?? '0',
                }) as PlantingSiteSearchResult
            ),
          ];
        }, [] as PlantingSiteSearchResult[]);

        if (sites.some((site) => site.isDraft)) {
          // sort merged results by sort order
          return sortResults(sites, activeLocale, searchSortOrder, [
            'id',
            'numPlantingSubzones',
            'numPlantingZones',
            'project_id',
            'totalPlants',
          ]);
        }

        return sites;
      }
    },
    [activeLocale, defaultTimeZone, searchSortOrder, selectedOrganization.id, timeZones]
  );

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

    const transformedResults = await searchData(searchFields);

    if (!debouncedSearchTerm) {
      setPlantingSites(transformedResults);
    }
    setSearchResults(transformedResults);
  }, [debouncedSearchTerm, filters.projectIds, searchData]);

  useEffect(() => {
    void onSearch();
  }, [selectedOrganization, onSearch]);

  if (plantingSites && filtersEmpty() && !plantingSites.length) {
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
    </TfMain>
  );
}
