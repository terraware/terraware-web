import { useCallback, useEffect, useMemo, useState } from 'react';
import { Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { useLocalization, useOrganization } from 'src/providers';
import { FieldOptionsMap, SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Card from 'src/components/common/Card';
import ListMapView from 'src/components/ListMapView';
import { FilterField } from 'src/components/common/FilterGroup';
import Search, { FeaturedFilterConfig, SearchProps } from 'src/components/common/SearchFiltersWrapper';
import PlantingProgressList from './PlantingProgressList';
import PlantingProgressMap from './PlantingProgressMap';
import { View } from 'src/components/common/ListMapSelector';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { selectPlantingSitesNames } from 'src/redux/features/tracking/trackingSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import isEnabled from 'src/features';
import { Project } from 'src/types/Project';

const initialView: View = 'list';

type PlantingProgressProps = {
  reloadTracking: () => void;
};

export default function PlantingProgress({ reloadTracking }: PlantingProgressProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();
  const featureFlagProjects = isEnabled('Projects');

  const projects = useAppSelector(selectProjects);

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [search, setSearch] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});
  const [activeView, setActiveView] = useState<View>(initialView);
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>(-1);

  const getProjectName = useCallback(
    (projectId: number) => (projects?.find((project: Project) => project.id === projectId) || {}).name || '',
    [projects]
  );

  const featuredFilters: FeaturedFilterConfig[] = !featureFlagProjects
    ? []
    : [
        {
          field: 'project_id',
          options: (projects || [])?.map((project: Project) => project.id),
          searchNodeCreator: (values: (number | string | null)[]) => ({
            field: 'project_id',
            operation: 'field',
            type: 'Exact',
            values: values.map((value: number | string | null): string | null => (value === null ? value : `${value}`)),
          }),
          label: strings.PROJECTS,
          renderOption: (id: number) => getProjectName(id),
        },
      ];

  useEffect(() => {
    void dispatch(requestObservationsResults(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  const filterColumns = useMemo<FilterField[]>(
    () =>
      activeLocale
        ? [
            { name: 'plantingCompleted', label: strings.PLANTING_COMPLETE, type: 'single_selection' },
            { name: 'siteName', label: strings.PLANTING_SITE, type: 'single_selection' },
          ]
        : [],
    [activeLocale]
  );

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
      filtersProps: {
        filters,
        setFilters: (value: Record<string, any>) => {
          setFilters(value);
        },
        filterColumns,
        filterOptions,
        pillValuesRenderer: (filterName: string, values: unknown[]): string | undefined => {
          if (filterName === 'project_id') {
            return values.map((value: unknown) => getProjectName(Number(value))).join(', ');
          }
        },
      },
    }),
    [search, filters, filterColumns, filterOptions, getProjectName]
  );

  const plantingCompleted = useMemo<boolean | undefined>(() => {
    if (activeLocale && filters.plantingCompleted?.values?.length > 0) {
      return filters.plantingCompleted.values[0] === strings.YES;
    }
  }, [filters, activeLocale]);

  const siteName = useMemo<string | undefined>(() => {
    if (filters.siteName?.values?.length > 0) {
      return filters.siteName.values[0];
    }
  }, [filters]);

  const reloadTrackingAndObservations = useCallback(() => {
    reloadTracking();
    void dispatch(requestObservationsResults(selectedOrganization.id));
  }, [selectedOrganization.id, dispatch, reloadTracking]);

  const plantingSitesNames = useAppSelector((state) => selectPlantingSitesNames(state));

  useEffect(() => {
    setFilterOptions({
      plantingCompleted: {
        partial: false,
        values: [strings.YES, strings.NO],
      },
      siteName: {
        partial: false,
        values: plantingSitesNames ? plantingSitesNames : [],
      },
    });
  }, [activeLocale, plantingSitesNames]);

  return (
    <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <Typography fontSize='20px' fontWeight={600} color={theme.palette.TwClrTxt} marginBottom={theme.spacing(1)}>
        {strings.PLANTING_PROGRESS}
      </Typography>
      <Typography fontSize='14px' fontWeight={400} color={theme.palette.TwClrTxt}>
        {activeView === 'list'
          ? strings.PLANTING_PROGRESS_TABLE_DESCRIPTION
          : strings.PLANTING_PROGRESS_MAP_DESCRIPTION}
      </Typography>
      <ListMapView
        style={{ padding: isMobile ? theme.spacing(3) : theme.spacing(3, 0, 0) }}
        initialView={initialView}
        onView={setActiveView}
        search={
          <SearchComponent
            view={activeView}
            onChangePlantingSite={setSelectedPlantingSiteId}
            featuredFilters={featuredFilters}
            {...searchProps}
          />
        }
        list={
          <PlantingProgressList
            search={search}
            plantingCompleted={plantingCompleted}
            reloadTracking={reloadTrackingAndObservations}
            siteName={siteName}
          />
        }
        map={
          <PlantingProgressMap plantingSiteId={selectedPlantingSiteId} reloadTracking={reloadTrackingAndObservations} />
        }
      />
    </Card>
  );
}

type SearchComponentProps = SearchProps & {
  view: View;
  onChangePlantingSite: (newSiteId: number) => void;
  featuredFilters?: FeaturedFilterConfig[];
};

function SearchComponent(props: SearchComponentProps): JSX.Element {
  const { search, onSearch, filtersProps, view, onChangePlantingSite, featuredFilters } = props;

  return (
    <>
      <div style={{ display: view === 'list' ? 'flex' : 'none' }}>
        <Search search={search} onSearch={onSearch} filtersProps={filtersProps} featuredFilters={featuredFilters} />
      </div>
      <div style={{ display: view === 'map' ? 'flex' : 'none' }}>
        <PlantingSiteSelector onChange={onChangePlantingSite} />
      </div>
    </>
  );
}
