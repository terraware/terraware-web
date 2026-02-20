import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Box, Grid, Popover, useTheme } from '@mui/material';
import { Button, PillListItem, Textfield, Tooltip } from '@terraware/web-components';
import { PillList } from '@terraware/web-components';

import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { selectSubLocations } from 'src/redux/features/subLocations/subLocationsSelectors';
import { requestSubLocations } from 'src/redux/features/subLocations/subLocationsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { convertFilterGroupToMap, getNurseryName } from 'src/scenes/InventoryRouter/FilterUtils';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import InventoryFilters, { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import strings from 'src/strings';
import { Facility, SubLocation } from 'src/types/Facility';
import { Project } from 'src/types/Project';
import { SearchNodePayload } from 'src/types/Search';
import { Species } from 'src/types/Species';
import { getAllNurseries } from 'src/utils/organization';
import useForm from 'src/utils/useForm';

const initialFilters: Record<string, SearchNodePayload> = {
  showEmptyBatches: {
    field: 'showEmptyBatches',
    values: ['false'],
    type: 'Exact',
    operation: 'field',
  },
  showEmptySpecies: {
    field: 'showEmptySpecies',
    values: ['false'],
    type: 'Exact',
    operation: 'field',
  },
  showEmptyNurseries: {
    field: 'showEmptyNurseries',
    values: ['false'],
    type: 'Exact',
    operation: 'field',
  },
};

interface SearchProps {
  filters: InventoryFiltersUnion;
  getResultsSpeciesNames?: () => string[];
  onSearch: (value: string) => void;
  origin?: OriginPage;
  searchValue: string;
  setFilters: (f: InventoryFiltersUnion) => void;
  showEmptyBatchesFilter?: boolean;
  showEmptySpeciesFilter?: boolean;
  showEmptyNurseriesFilter?: boolean;
  showProjectsFilter?: boolean;
  showSearch?: boolean;
  pillListPortalEl?: HTMLElement | null;
}

type PillListItemWithEmptyValue = Omit<PillListItem<string>, 'id'> & {
  id: keyof InventoryFiltersUnion;
  emptyValue: unknown;
};

export default function Search(props: SearchProps): JSX.Element | null {
  const {
    filters,
    getResultsSpeciesNames,
    onSearch,
    searchValue,
    setFilters,
    showEmptyBatchesFilter,
    showEmptySpeciesFilter,
    showEmptyNurseriesFilter,
    showProjectsFilter,
    showSearch,
    pillListPortalEl,
  } = props;

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const origin = props.origin || 'Species';

  const { species } = useSpeciesData();
  const projects = useAppSelector(selectProjects);
  const [nurseries, setNurseries] = useState<Facility[]>([]);
  const [availableSpecies, setAvailableSpecies] = useState<Species[]>([]);

  useEffect(() => {
    setNurseries(selectedOrganization ? getAllNurseries(selectedOrganization) : []);
  }, [selectedOrganization]);

  useEffect(() => {
    void dispatch(requestSubLocations(filters.facilityIds ?? []));
  }, [filters.facilityIds, dispatch]);

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
    }
  }, [dispatch, activeLocale, selectedOrganization]);

  useEffect(() => {
    if (origin !== 'Nursery' || !species.length) {
      return;
    }

    const availableSpeciesNames = getResultsSpeciesNames?.() || [];

    if (!availableSpeciesNames.length) {
      setAvailableSpecies([]);
    } else {
      const speciesWithinResults = new Set(availableSpeciesNames);
      setAvailableSpecies(species.filter((singleSpecies) => speciesWithinResults.has(singleSpecies.scientificName)));
    }
  }, [getResultsSpeciesNames, origin, species]);

  const subLocations = useAppSelector(selectSubLocations);

  const [filterPillData, setFilterPillData] = useState<PillListItemWithEmptyValue[]>([]);

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  const [filterGroupFilters, setFilterGroupFilters] = useForm<Record<string, SearchNodePayload>>(initialFilters);

  // Sync filterGroupFilters when filters prop changes from parent
  useEffect(() => {
    const updates: Record<string, SearchNodePayload> = { ...initialFilters };

    if (filters.showEmptyBatches) {
      updates.showEmptyBatches = {
        field: 'showEmptyBatches',
        values: filters.showEmptyBatches,
        type: 'Exact',
        operation: 'field',
      };
    }

    if (filters.showEmptySpecies) {
      updates.showEmptySpecies = {
        field: 'showEmptySpecies',
        values: filters.showEmptySpecies,
        type: 'Exact',
        operation: 'field',
      };
    }

    if (filters.showEmptyNurseries) {
      updates.showEmptyNurseries = {
        field: 'showEmptyNurseries',
        values: filters.showEmptyNurseries,
        type: 'Exact',
        operation: 'field',
      };
    }

    setFilterGroupFilters(updates);
  }, [filters.showEmptyBatches, filters.showEmptySpecies, filters.showEmptyNurseries, setFilterGroupFilters]);

  const filterGroupColumns = useMemo<FilterField[]>(() => {
    if (!activeLocale) {
      return [];
    }
    const columns: FilterField[] = [];
    if (showEmptyBatchesFilter) {
      columns.push({
        name: 'showEmptyBatches',
        label: strings.FILTER_SHOW_EMPTY_BATCHES,
        showLabel: false,
        type: 'boolean',
      });
    }
    if (showEmptySpeciesFilter) {
      columns.push({
        name: 'showEmptySpecies',
        label: strings.FILTER_SHOW_EMPTY_SPECIES,
        showLabel: false,
        type: 'boolean',
      });
    }
    if (showEmptyNurseriesFilter) {
      columns.push({
        name: 'showEmptyNurseries',
        label: strings.FILTER_SHOW_EMPTY_NURSERIES,
        showLabel: false,
        type: 'boolean',
      });
    }
    return columns;
  }, [activeLocale, showEmptyBatchesFilter, showEmptySpeciesFilter, showEmptyNurseriesFilter]);

  const getSpeciesName = useCallback(
    (speciesId: number) => (availableSpecies || []).find((s) => s.id === speciesId)?.scientificName,
    [availableSpecies]
  );

  const getSubLocationName = useCallback(
    (subLocationId: number) => subLocations?.find((sl) => subLocationId === sl.id)?.name ?? '',
    [subLocations]
  );

  const getProjectName = useCallback(
    (projectId: number | null) => (projects || []).find((p) => p.id === projectId)?.name,
    [projects]
  );

  useEffect(() => {
    const data: PillListItemWithEmptyValue[] = [];

    if (['Batches', 'Species'].includes(origin)) {
      if (filters.facilityIds?.length) {
        data.push({
          id: 'facilityIds',
          label: strings.NURSERY,
          value: selectedOrganization
            ? filters.facilityIds?.map((id) => getNurseryName(id, selectedOrganization))?.join(', ') ?? ''
            : '',
          emptyValue: [],
        });
      }

      if (filters.subLocationsIds?.length) {
        data.push({
          id: 'subLocationsIds',
          label: strings.SUB_LOCATIONS,
          value: filters.subLocationsIds?.map(getSubLocationName).join(', ') ?? '',
          emptyValue: [],
        });
      }
    }

    if (showProjectsFilter && filters.projectIds?.length) {
      const notPresentFilter = (filters.projectIds || [])[0] === null;
      data.push({
        id: 'projectIds',
        label: strings.PROJECTS,
        value: notPresentFilter ? strings.NO_PROJECT : filters.projectIds?.map(getProjectName).join(', ') ?? '',
        emptyValue: [],
      });
    }

    if ('Nursery' === origin && filters.speciesIds?.length) {
      data.push({
        id: 'speciesIds',
        label: strings.SPECIES,
        value: filters.speciesIds?.map(getSpeciesName).join(', ') ?? '',
        emptyValue: [],
      });
    }

    if (showEmptyBatchesFilter && filters.showEmptyBatches && filters.showEmptyBatches[0] === 'true') {
      data.push({
        id: 'showEmptyBatches',
        value: strings.FILTER_SHOW_EMPTY_BATCHES,
        emptyValue: ['false'],
      });
    }

    if (showEmptySpeciesFilter && filters.showEmptySpecies && filters.showEmptySpecies[0] === 'true') {
      data.push({
        id: 'showEmptySpecies',
        value: strings.FILTER_SHOW_EMPTY_SPECIES,
        emptyValue: ['false'],
      });
    }

    if (showEmptyNurseriesFilter && filters.showEmptyNurseries && filters.showEmptyNurseries[0] === 'true') {
      data.push({
        id: 'showEmptyNurseries',
        value: strings.FILTER_SHOW_EMPTY_NURSERIES,
        emptyValue: ['false'],
      });
    }

    setFilterPillData(data);
  }, [
    selectedOrganization,
    filters.facilityIds,
    filters.speciesIds,
    filters.subLocationsIds,
    filters.projectIds,
    filters.showEmptyBatches,
    filters.showEmptySpecies,
    filters.showEmptyNurseries,
    getSpeciesName,
    getSubLocationName,
    getProjectName,
    origin,
    showProjectsFilter,
    showEmptyBatchesFilter,
    showEmptySpeciesFilter,
    showEmptyNurseriesFilter,
  ]);

  const onRemovePillList = useCallback(
    (filterId: keyof InventoryFiltersUnion) => {
      const filter = filterPillData?.find((filterPillDatum) => filterPillDatum.id === filterId);
      if (filterId === 'facilityIds') {
        setFilters({ ...filters, facilityIds: [], subLocationsIds: [] });
      } else if (filterId === 'showEmptyBatches') {
        setFilterGroupFilters({
          showEmptyBatches: { ...initialFilters.showEmptyBatches, values: ['false'] },
        });
        setFilters({ ...filters, showEmptyBatches: ['false'] });
      } else if (filterId === 'showEmptySpecies') {
        setFilterGroupFilters({
          showEmptySpecies: { ...initialFilters.showEmptySpecies, values: ['false'] },
        });
        setFilters({ ...filters, showEmptySpecies: ['false'] });
      } else if (filterId === 'showEmptyNurseries') {
        setFilterGroupFilters({
          showEmptyNurseries: { ...initialFilters.showEmptyNurseries, values: ['false'] },
        });
        setFilters({ ...filters, showEmptyNurseries: ['false'] });
      } else {
        setFilters({ ...filters, [filterId]: filter?.emptyValue || null });
      }
    },
    [filterPillData, filters, setFilters, setFilterGroupFilters]
  );

  if (origin === 'Nursery' && !availableSpecies && !projects) {
    return null;
  }

  if (!showSearch && pillListPortalEl) {
    return createPortal(<PillList data={filterPillData} onRemove={onRemovePillList} />, pillListPortalEl);
  }

  return (
    <Box>
      <Grid container display='flex' flexDirection='row' alignItems='center' gap={theme.spacing(1)}>
        {showSearch && (
          <>
            <Box width='300px'>
              <Textfield
                placeholder={strings.SEARCH}
                iconLeft='search'
                label=''
                id='search'
                type='text'
                onChange={(value) => onSearch(value as string)}
                value={searchValue}
                iconRight='cancel'
                onClickRightIcon={() => onSearch('')}
              />
            </Box>

            {origin === 'Species' && (
              <InventoryFilters
                filters={filters}
                setFilters={setFilters}
                label={strings.NURSERY}
                filterKey='facilityIds'
                options={nurseries.map((n: Facility) => n.id)}
                renderOption={(id: string | number) => nurseries.find((n) => n.id === id)?.name ?? ''}
              />
            )}
            {origin === 'Nursery' && (
              <InventoryFilters
                filters={filters}
                setFilters={setFilters}
                label={strings.SPECIES}
                filterKey='speciesIds'
                options={[...(availableSpecies || [])]
                  .sort((a, b) => a.scientificName.localeCompare(b.scientificName, activeLocale || undefined))
                  .map((n: Species) => n.id)}
                renderOption={(id: string | number) =>
                  (availableSpecies || []).find((n) => n.id === id)?.scientificName ?? ''
                }
              />
            )}

            {origin === 'Batches' && (
              <>
                <InventoryFilters
                  filters={filters}
                  setFilters={setFilters}
                  label={strings.NURSERY}
                  filterKey='facilityIds'
                  options={nurseries.map((n: Facility) => n.id)}
                  renderOption={(id: string | number) => nurseries.find((n) => n.id === id)?.name ?? ''}
                />
                {filters.facilityIds && filters.facilityIds.length > 0 && (
                  <InventoryFilters
                    filters={filters}
                    setFilters={setFilters}
                    disabled={!filters.facilityIds?.length}
                    label={strings.SUB_LOCATIONS}
                    filterKey='subLocationsIds'
                    options={subLocations?.map((sl: SubLocation) => sl.id) ?? []}
                    renderOption={(id: string | number) => subLocations?.find((sl) => sl.id === id)?.name ?? ''}
                  />
                )}
              </>
            )}
          </>
        )}

        {showProjectsFilter && (projects || []).length > 0 && (
          <InventoryFilters
            filters={filters}
            setFilters={setFilters}
            label={strings.PROJECT}
            filterKey='projectIds'
            options={(projects || []).map((n: Project) => n.id)}
            renderOption={(id: string | number) => (id ? (projects || []).find((n) => n.id === id)?.name ?? '' : '')}
            notPresentFilterShown
            notPresentFilterLabel={strings.NO_PROJECT}
          />
        )}

        {showSearch && (showEmptyBatchesFilter || showEmptySpeciesFilter || showEmptyNurseriesFilter) && (
          <Box sx={{ marginTop: theme.spacing(0.5) }}>
            <Tooltip title={strings.FILTER}>
              <Button
                id='filterSpecies'
                onClick={(event) => event && handleFilterClick(event)}
                type='passive'
                priority='ghost'
                icon='filter'
              />
            </Tooltip>
            <Popover
              id='simple-popover'
              open={Boolean(filterAnchorEl)}
              anchorEl={filterAnchorEl}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: '8px',
                  overflow: 'visible',
                  width: '480px',
                },
              }}
            >
              <FilterGroup
                key={JSON.stringify(filterGroupFilters)}
                initialFilters={filterGroupFilters}
                fields={filterGroupColumns}
                onConfirm={(_filterGroupFilters: Record<string, SearchNodePayload>) => {
                  handleFilterClose();
                  setFilterGroupFilters(_filterGroupFilters);
                  if (Object.keys(_filterGroupFilters).length === 0) {
                    setFilters({});
                  } else {
                    setFilters({ ...filters, ...convertFilterGroupToMap(_filterGroupFilters) });
                  }
                }}
                onCancel={handleFilterClose}
              />
            </Popover>
          </Box>
        )}

        {showSearch && <TableSettingsButton />}
      </Grid>
      <Grid
        display='flex'
        flexDirection='row'
        alignItems='center'
        sx={{ marginTop: showSearch ? theme.spacing(2) : 0 }}
      >
        <PillList data={filterPillData} onRemove={onRemovePillList} />
      </Grid>
    </Box>
  );
}
