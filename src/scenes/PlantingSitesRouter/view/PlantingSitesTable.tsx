import React, { useCallback, useEffect, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { PillList, PillListItem, TableColumnType, Textfield } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import isEnabled from 'src/features';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSitesFilters } from 'src/types/PlantingSite';
import { Project } from 'src/types/Project';
import { SearchResponseElement, SearchSortOrder } from 'src/types/Search';

import PlantingSitesCellRenderer from './PlantingSitesCellRenderer';

interface PlantingSitesTableProps {
  results: SearchResponseElement[];
  temporalSearchValue: string;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setSearchSortOrder: (sortOrder: SearchSortOrder) => void;
  filters: PlantingSitesFilters;
  setFilters: (filters: PlantingSitesFilters) => void;
}

type PillListItemWithEmptyValue = Omit<PillListItem<string>, 'id'> & {
  id: keyof PlantingSitesFilters;
  emptyValue: number[];
};

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.NAME,
    type: 'string',
  },
  {
    key: 'description',
    name: strings.DESCRIPTION,
    type: 'string',
  },
  {
    key: 'project_name',
    name: strings.PROJECT,
    type: 'string',
  },
  { key: 'numPlantingZones', name: strings.PLANTING_ZONES, type: 'string' },
  { key: 'numPlantingSubzones', name: strings.SUBZONES, type: 'string' },
  { key: 'timeZone', name: strings.TIME_ZONE, type: 'string' },
  // TODO: update with BE prop
  { key: 'draft', name: '', type: 'string' }, // don't show column header name
];

export default function PlantingSitesTable(props: PlantingSitesTableProps): JSX.Element {
  const { results, setTemporalSearchValue, temporalSearchValue, setSearchSortOrder, filters, setFilters } = props;

  const theme = useTheme();
  const featureFlagSites = isEnabled('User Detailed Sites');

  const projects = useAppSelector(selectProjects);

  const [isPresorted, setIsPresorted] = useState<boolean>(false);
  const [filterPillData, setFilterPillData] = useState<PillListItemWithEmptyValue[]>([]);

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const isTimeZone = orderBy === 'timeZone';
    if (!isTimeZone) {
      setSearchSortOrder({
        field: orderBy as string,
        direction: order === 'asc' ? 'Ascending' : 'Descending',
      });
    }
    setIsPresorted(!isTimeZone);
  };

  useEffect(() => {
    const data: PillListItemWithEmptyValue[] = [];
    if (filters.projectIds?.length) {
      data.push({
        id: 'projectIds',
        label: strings.NURSERY,
        value: filters.projectIds?.map((id) => (projects || []).find((p) => p.id === id)?.name).join(', ') ?? '',
        emptyValue: [],
      });
    }

    setFilterPillData(data);
  }, [projects, filters.projectIds]);

  const onRemovePillList = useCallback(
    (filterId: keyof PlantingSitesFilters) => {
      const filter = filterPillData?.find((filterPillDatum) => filterPillDatum.id === filterId);
      setFilters({ ...filters, [filterId]: filter?.emptyValue || undefined });
    },
    [filterPillData, filters, setFilters]
  );

  const tableColumns = useCallback(() => {
    const columnsData = columns();
    return featureFlagSites ? columnsData : columnsData.filter((column) => column.key !== 'draft');
  }, [featureFlagSites]);

  return (
    <Card flushMobile>
      <Box display='flex' flexDirection='row' alignItems='center' gap={theme.spacing(1)}>
        <Box width='300px'>
          <Textfield
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            onChange={(value) => setTemporalSearchValue(value as string)}
            value={temporalSearchValue}
            iconRight='cancel'
            onClickRightIcon={() => setTemporalSearchValue('')}
          />
        </Box>

        <FilterMultiSelectContainer<PlantingSitesFilters>
          filters={filters}
          setFilters={setFilters}
          label={strings.PROJECTS}
          filterKey='projectIds'
          options={projects?.map((project: Project) => project.id) ?? []}
          renderOption={(id: string | number) => projects?.find((project) => project.id === id)?.name ?? ''}
        />
      </Box>

      <Grid display='flex' flexDirection='row' alignItems='center' sx={{ marginTop: theme.spacing(2) }}>
        <PillList data={filterPillData} onRemove={onRemovePillList} />
      </Grid>

      <Grid item xs={12} marginTop={2}>
        <div>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                id='planting-sites-table'
                columns={tableColumns}
                rows={results}
                orderBy='name'
                Renderer={PlantingSitesCellRenderer}
                sortHandler={onSortChange}
                isPresorted={isPresorted}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Card>
  );
}
