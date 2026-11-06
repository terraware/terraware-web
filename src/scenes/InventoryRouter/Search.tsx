import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import { PillList } from '@terraware/web-components';

import { useSubLocationsForFacilities } from 'src/components/common/SubLocations/useSubLocationsForFacilities';
import TableSettingsButton from 'src/components/common/table/TableSettingsButton';
import { useOrganizationSpecies } from 'src/hooks/useOrganizationSpecies';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { getNurseryName } from 'src/scenes/InventoryRouter/FilterUtils';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import InventoryFilters, { InventoryFiltersUnion } from 'src/scenes/InventoryRouter/InventoryFilter';
import strings from 'src/strings';
import { Facility, SubLocation } from 'src/types/Facility';
import { Project } from 'src/types/Project';
import { Species } from 'src/types/Species';
import { getAllNurseries } from 'src/utils/organization';

interface SearchProps {
  filters: InventoryFiltersUnion;
  getResultsSpeciesNames?: () => string[];
  onSearch: (value: string) => void;
  origin?: OriginPage;
  searchValue: string;
  setFilters: (f: InventoryFiltersUnion) => void;
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
    showProjectsFilter,
    showSearch,
    pillListPortalEl,
  } = props;

  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const origin = props.origin || 'Species';

  const { species } = useOrganizationSpecies();
  const { availableProjects: projects } = useProjects();
  const nurseries = useMemo<Facility[]>(
    () => (selectedOrganization ? getAllNurseries(selectedOrganization) : []),
    [selectedOrganization]
  );
  const [availableSpecies, setAvailableSpecies] = useState<Species[]>([]);

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

  const subLocations = useSubLocationsForFacilities(filters.facilityIds);

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

  const filterPillData = useMemo<PillListItemWithEmptyValue[]>(() => {
    const data: PillListItemWithEmptyValue[] = [];

    if (['Batches', 'Species'].includes(origin)) {
      if (filters.facilityIds?.length) {
        data.push({
          id: 'facilityIds',
          label: strings.NURSERY,
          value: selectedOrganization
            ? (filters.facilityIds?.map((id) => getNurseryName(id, selectedOrganization))?.join(', ') ?? '')
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
        value: notPresentFilter ? strings.NO_PROJECT : (filters.projectIds?.map(getProjectName).join(', ') ?? ''),
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

    return data;
  }, [
    selectedOrganization,
    filters.facilityIds,
    filters.speciesIds,
    filters.subLocationsIds,
    filters.projectIds,
    getSpeciesName,
    getSubLocationName,
    getProjectName,
    origin,
    showProjectsFilter,
  ]);

  const onRemovePillList = useCallback(
    (filterId: keyof InventoryFiltersUnion) => {
      const filter = filterPillData?.find((filterPillDatum) => filterPillDatum.id === filterId);
      if (filterId === 'facilityIds') {
        setFilters({ ...filters, facilityIds: [], subLocationsIds: [] });
      } else {
        setFilters({ ...filters, [filterId]: filter?.emptyValue || null });
      }
    },
    [filterPillData, filters, setFilters]
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
            renderOption={(id: string | number) => (id ? ((projects || []).find((n) => n.id === id)?.name ?? '') : '')}
            notPresentFilterShown
            notPresentFilterLabel={strings.NO_PROJECT}
          />
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
