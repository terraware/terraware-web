import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Typography, useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import Card from 'src/components/common/Card';
import { FilterField } from 'src/components/common/FilterGroup';
import { View } from 'src/components/common/ListMapSelector';
import PlantingSiteSelector from 'src/components/common/PlantingSiteSelector';
import Search, { FeaturedFilterConfig, SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { useLocalization, useOrganization } from 'src/providers';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { searchPlantingProgress } from 'src/redux/features/plantings/plantingsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { selectPlantingSite, selectPlantingSitesNames } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Project } from 'src/types/Project';
import { FieldOptionsMap, SearchNodePayload } from 'src/types/Search';
import useDeviceInfo from 'src/utils/useDeviceInfo';

import PlantingProgressList from './PlantingProgressList';
import PlantingProgressMap from './PlantingProgressMap';
import { exportNurseryPlantingProgress } from './exportNurseryData';

const initialView: View = 'list';

export default function PlantingProgress(): JSX.Element {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { activeLocale } = useLocalization();

  const projects = useAppSelector(selectProjects);

  const [filters, setFilters] = useState<Record<string, SearchNodePayload>>({});
  const [search, setSearch] = useState<string>('');
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});
  const [activeView, setActiveView] = useState<View>(initialView);
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>(-1);
  const rows = useAppSelector((state: any) => searchPlantingProgress(state, search.trim(), filters));
  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(selectedPlantingSiteId)));

  const getProjectName = useCallback(
    (projectId: number) => (projects?.find((project: Project) => project.id === projectId) || {}).name || '',
    [projects]
  );

  const featuredFilters: FeaturedFilterConfig[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              field: 'project_id',
              options: (projects || [])?.map((project: Project) => project.id),
              searchNodeCreator: (values: (number | string | null)[]) => ({
                field: 'project_id',
                operation: 'field',
                type: 'Exact',
                values: values.map((value: number | string | null): string | null =>
                  value === null ? value : `${value}`
                ),
              }),
              label: strings.PROJECTS,
              renderOption: (id: string | number) => getProjectName(Number(id)),
              notPresentFilterShown: true,
              notPresentFilterLabel: strings.NO_PROJECT,
              pillValuesRenderer: (values: unknown[]): string | undefined => {
                if (values.length === 1 && values[0] === null) {
                  return strings.NO_PROJECT;
                }

                return values.map((value: unknown) => getProjectName(Number(value))).join(', ');
              },
            },
          ]
        : [],
    [activeLocale, getProjectName, projects]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestObservationsResults(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

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
        setFilters,
        filterColumns,
        filterOptions,
      },
    }),
    [filters, filterColumns, filterOptions, search, setFilters, setSearch]
  );

  const reloadTrackingAndObservations = useCallback(() => {
    if (selectedOrganization) {
      void dispatch(requestPlantingSites(selectedOrganization.id));
      void dispatch(requestObservationsResults(selectedOrganization.id));
      void dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [selectedOrganization, dispatch]);

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

  const onExport = useCallback(() => {
    void exportNurseryPlantingProgress({ plantingProgress: rows || [] });
  }, [rows]);

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
        data={plantingSite?.strata}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          padding: isMobile ? theme.spacing(3) : theme.spacing(3, 0, 0),
        }}
        initialView={initialView}
        onView={setActiveView}
        search={
          activeView === 'list' ? undefined : (
            <SearchComponent
              view={activeView}
              onChangePlantingSite={setSelectedPlantingSiteId}
              featuredFilters={featuredFilters}
              onExport={onExport}
              {...searchProps}
            />
          )
        }
        list={<PlantingProgressList reloadTracking={reloadTrackingAndObservations} rows={rows} />}
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

function SearchComponent({
  featuredFilters,
  filtersProps,
  onChangePlantingSite,
  onExport,
  onSearch,
  search,
  view,
}: SearchComponentProps): JSX.Element {
  return (
    <>
      <div style={{ display: view === 'list' ? 'flex' : 'none' }}>
        <Search
          featuredFilters={featuredFilters}
          filtersProps={filtersProps}
          onExport={onExport}
          onSearch={onSearch}
          search={search}
        />
      </div>
      <div style={{ display: view === 'map' ? 'flex' : 'none' }}>
        <PlantingSiteSelector onChange={onChangePlantingSite} />
      </div>
    </>
  );
}
