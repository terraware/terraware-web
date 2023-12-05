import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, Box, useTheme } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import { PillList } from '@terraware/web-components';
import strings from 'src/strings';
import { ProjectEntitiesFilters } from 'src/components/NewProjectFlow/flow/useProjectEntitySelection';
import { FlowStates } from 'src/components/NewProjectFlow';
import { useAppSelector } from 'src/redux/store';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { getAllNurseries } from 'src/utils/organization';
import { useOrganization } from 'src/providers';
import ProjectEntitiesFiltersPopover from 'src/components/NewProjectFlow/flow/ProjectEntitiesFiltersPopover';

interface SearchProps {
  flowState: FlowStates;
  searchValue: string;
  onSearch: (value: string) => void;
  filters: ProjectEntitiesFilters;
  setFilters: (value: ProjectEntitiesFilters) => void;
}

type PillListItemWithEmptyValue = PillListItem<string> & { emptyValue: unknown };

export default function Search(props: SearchProps): JSX.Element | null {
  const { flowState, searchValue, onSearch, filters, setFilters } = props;

  const theme = useTheme();
  const { selectedOrganization } = useOrganization();

  const projects = useAppSelector(selectProjects);
  const nurseries = useMemo(() => getAllNurseries(selectedOrganization), [selectedOrganization]);

  const [filterPillData, setFilterPillData] = useState<PillListItemWithEmptyValue[]>([]);

  useEffect(() => {
    const data: PillListItemWithEmptyValue[] = [];

    if (filters.projectIds && filters.projectIds.length > 0) {
      data.push({
        id: 'projectIds',
        label: strings.PROJECT,
        // TODO
        value: filters.projectIds
          .map((projectId: number) => (projects || []).find((project) => project.id === projectId))
          .map((project) => project?.name)
          .join(','),
        emptyValue: [],
      });
    }

    if (filters.statuses && filters.statuses.length > 0) {
      data.push({
        id: 'statuses',
        label: strings.STATUS,
        // TODO
        value: filters.statuses.join(','),
        emptyValue: [],
      });
    }

    if (filters.nurseryIds && filters.nurseryIds.length > 0) {
      data.push({
        id: 'nurseryIds',
        label: strings.NURSERY,
        // TODO
        value: filters.nurseryIds
          .map((nurseryId: number) => nurseries.find((nursery) => nursery.id === nurseryId))
          .map((nursery) => nursery?.name)
          .join(','),
        emptyValue: [],
      });
    }

    setFilterPillData(data);
  }, [filters, nurseries, projects]);

  const onRemovePillList = useCallback(
    (filterId: string) => {
      const filter = filterPillData?.find((filterPillDatum) => filterPillDatum.id === filterId);
      setFilters({ [filterId]: filter?.emptyValue || null });
    },
    [filterPillData, setFilters]
  );

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
        <ProjectEntitiesFiltersPopover flowState={flowState} filters={filters} setFilters={setFilters} />
      </Box>
      <Grid
        display='flex'
        flexDirection='row'
        alignItems='center'
        sx={{ marginTop: theme.spacing(0.5), marginLeft: theme.spacing(1) }}
      >
        <PillList data={filterPillData} onRemove={onRemovePillList} />
      </Grid>
    </>
  );
}
