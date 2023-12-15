import React, { useEffect, useMemo, useState } from 'react';
import { Box, Popover, useTheme } from '@mui/material';
import { Button, Textfield, Tooltip } from '@terraware/web-components';
import { makeStyles } from '@mui/styles';
import strings from 'src/strings';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import FilterGroup, { FilterField } from 'src/components/common/FilterGroup';
import { SearchNodePayload } from 'src/types/Search';
import useForm from 'src/utils/useForm';
import { Facility, SubLocation } from 'src/types/Facility';
import { Species } from 'src/types/Species';
import { getAllNurseries } from 'src/utils/organization';
import { selectSubLocations } from 'src/redux/features/subLocations/subLocationsSelectors';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { Project } from 'src/types/Project';
import InventoryFilters, { InventoryFiltersType } from 'src/components/InventoryV2/InventoryFilter';
import { OriginPage } from 'src/components/InventoryV2/InventoryBatch';
import { convertFilterGroupToMap } from 'src/components/InventoryV2/FilterUtils';
import isEnabled from 'src/features';

const useStyles = makeStyles(() => ({
  popoverContainer: {
    '& .MuiPaper-root': {
      borderRadius: '8px',
      overflow: 'visible',
      width: '480px',
    },
  },
}));

const initialFilters: Record<string, SearchNodePayload> = {
  showEmptyBatches: {
    field: 'showEmptyBatches',
    values: ['false'],
    type: 'Exact',
    operation: 'field',
  },
};

interface SearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  filters: InventoryFiltersType;
  setFilters: (f: InventoryFiltersType) => void;
  origin?: OriginPage;
  showProjectsFilter?: boolean;
}

export default function Search(props: SearchProps): JSX.Element | null {
  const { searchValue, onSearch, filters, setFilters, showProjectsFilter } = props;

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const classes = useStyles();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const featureFlagProjects = isEnabled('Projects');

  const origin = props.origin || 'Species';

  const species = useAppSelector(selectSpecies);
  const projects = useAppSelector(selectProjects);
  const [nurseries, setNurseries] = useState<Facility[]>([]);

  useEffect(() => {
    setNurseries(getAllNurseries(selectedOrganization));
  }, [selectedOrganization]);

  const subLocations = useAppSelector(selectSubLocations);

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  const [filterGroupFilters, setFilterGroupFilters] = useForm<Record<string, SearchNodePayload>>(initialFilters);
  const filterGroupColumns = useMemo<FilterField[]>(
    () =>
      activeLocale
        ? [
            {
              name: 'showEmptyBatches',
              label: strings.FILTER_SHOW_EMPTY_BATCHES,
              showLabel: false,
              type: 'boolean',
            },
          ]
        : [],
    [activeLocale]
  );

  useEffect(() => {
    if (origin === 'Nursery') {
      void dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [origin, dispatch, selectedOrganization.id]);

  if (origin === 'Nursery' && !species && !projects) {
    return null;
  }

  return (
    <>
      <Box display='flex' flexDirection='row' alignItems='center' gap={theme.spacing(1)}>
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
            renderOption={(id: number) => nurseries.find((n) => n.id === id)?.name ?? ''}
          />
        )}
        {origin === 'Nursery' && (
          <InventoryFilters
            filters={filters}
            setFilters={setFilters}
            label={strings.SPECIES}
            filterKey='speciesIds'
            options={(species || []).map((n: Species) => n.id)}
            renderOption={(id: number) => (species || []).find((n) => n.id === id)?.scientificName ?? ''}
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
              renderOption={(id: number) => nurseries.find((n) => n.id === id)?.name ?? ''}
            />
            {filters.facilityIds && filters.facilityIds.length > 0 && (
              <InventoryFilters
                filters={filters}
                setFilters={setFilters}
                disabled={!filters.facilityIds?.length}
                label={strings.SUB_LOCATIONS}
                filterKey='subLocationsIds'
                options={subLocations?.map((sl: SubLocation) => sl.id) ?? []}
                renderOption={(id: number) => subLocations?.find((sl) => sl.id === id)?.name ?? ''}
              />
            )}
          </>
        )}

        {featureFlagProjects && showProjectsFilter && (
          <InventoryFilters
            filters={filters}
            setFilters={setFilters}
            label={strings.PROJECT}
            filterKey='projectIds'
            options={(projects || []).map((n: Project) => n.id)}
            renderOption={(id: number) => (projects || []).find((n) => n.id === id)?.name ?? ''}
          />
        )}

        {origin === 'Batches' && (
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
              className={classes.popoverContainer}
            >
              <FilterGroup
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
      </Box>
    </>
  );
}
