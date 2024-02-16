import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { PlantingSiteSearchResult } from 'src/types/Tracking';
import { DraftPlantingSiteService, TrackingService } from 'src/services';
import { SearchNodePayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';
import { PlantingSitesFilters } from 'src/types/PlantingSite';
import strings from 'src/strings';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import useDebounce from 'src/utils/useDebounce';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import PlantingSitesTable from './PlantingSitesTable';
import PlantingSiteTypeSelect from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteTypeSelect';
import { useOrganization, useTimeZones } from 'src/providers/hooks';
import { setTimeZone, useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import useForm from 'src/utils/useForm';

type SiteProperty = keyof PlantingSiteSearchResult;

const getVal = (site: PlantingSiteSearchResult, key: SiteProperty) => {
  if (key === 'numPlantingSubzones') {
    return site['numPlantingSubzones(raw)'] ?? 0;
  }
  if (key === 'numPlantingZones') {
    return site['numPlantingZones(raw)'] ?? 0;
  }
  return site[key] ?? '';
};

function siteSortFunction(sortField: SiteProperty, isAscending: boolean, locale: string | undefined) {
  return (siteA: PlantingSiteSearchResult, siteB: PlantingSiteSearchResult) => {
    const valueA = getVal(siteA, sortField);
    const valueB = getVal(siteB, sortField);

    if (sortField === 'numPlantingSubzones' || sortField === 'numPlantingZones') {
      return isAscending ? Number(valueA) - Number(valueB) : Number(valueB) - Number(valueA);
    }

    return isAscending
      ? String(valueA).localeCompare(String(valueB), locale)
      : String(valueB).localeCompare(String(valueA), locale);
  };
}

export default function PlantingSitesList(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const timeZones = useTimeZones();
  const defaultTimeZone = useDefaultTimeZone().get();
  const contentRef = useRef(null);
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
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const { isMobile } = useDeviceInfo();
  const featureFlagSites = isEnabled('User Detailed Sites');

  const filtersEmpty = useCallback(() => !filters.projectIds || filters.projectIds.length === 0, [filters]);

  /**
   * Search planting sites and draft planting sites.
   * Return merged/sorted results.
   */
  const searchData = useCallback(
    async (searchFields: SearchNodePayload[]) => {
      const searchRequests = [
        TrackingService.searchPlantingSites(selectedOrganization.id, searchFields, searchSortOrder),
      ];

      if (featureFlagSites) {
        searchRequests.push(
          DraftPlantingSiteService.searchDraftPlantingSites(selectedOrganization.id, searchFields, searchSortOrder)
        );
      }

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

      if (featureFlagSites && sites.some((site) => site.isDraft)) {
        // sort merged results by sort order
        const sortField: SiteProperty = (searchSortOrder?.field ?? 'name') as SiteProperty;
        const isAscending = searchSortOrder?.direction === 'Ascending';

        sites.sort(siteSortFunction(sortField, isAscending, activeLocale || undefined));
      }

      return sites;
    },
    [activeLocale, defaultTimeZone, featureFlagSites, searchSortOrder, selectedOrganization.id, timeZones]
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
