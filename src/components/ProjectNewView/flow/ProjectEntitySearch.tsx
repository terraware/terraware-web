import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, Box, useTheme } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import { PillList } from '@terraware/web-components';
import strings from 'src/strings';
import { ProjectEntityFilters } from 'src/components/ProjectNewView/flow/useProjectEntitySelection';
import { useAppSelector } from 'src/redux/store';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import ProjectEntityFilter, { EntitySpecificFilterConfig } from './ProjectEntityFilter';

interface ProjectEntitySearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  entitySpecificFilterConfigs: EntitySpecificFilterConfig[];
  filters: ProjectEntityFilters;
  setFilters: (value: ProjectEntityFilters) => void;
}

export type PillListItemWithEmptyValue = PillListItem<string> & { emptyValue: unknown };

export default function ProjectEntitySearch(props: ProjectEntitySearchProps): JSX.Element | null {
  const { searchValue, onSearch, entitySpecificFilterConfigs, filters, setFilters } = props;

  const theme = useTheme();

  const projects = useAppSelector(selectProjects);

  const [filterPillData, setFilterPillData] = useState<PillListItemWithEmptyValue[]>([]);

  const onRemovePillList = useCallback(
    (filterId: string) => {
      const filter = filterPillData?.find((filterPillDatum) => filterPillDatum.id === filterId);
      setFilters({ [filterId]: filter?.emptyValue || null });
    },
    [filterPillData, setFilters]
  );

  const projectEntityFilterConfig: EntitySpecificFilterConfig = useMemo(
    () => ({
      label: strings.PROJECT,
      initialSelection: filters.projectIds || [],
      filterKey: 'projectIds',
      options: projects?.map((project) => project.id) || [],
      renderOption: (projectId: string | number) =>
        (projects || []).find((project) => project.id === projectId)?.name || '',
      pillModifier: (_filters: ProjectEntityFilters): PillListItemWithEmptyValue[] => {
        const projectIds = _filters.projectIds || [];
        if (projectIds.length === 0) {
          return [];
        }

        return [
          {
            id: 'projectIds',
            label: strings.PROJECT,
            value: projectIds
              .map((projectId: number) => (projects || []).find((project) => project.id === projectId))
              .map((project) => project?.name)
              .join(','),
            emptyValue: [],
          },
        ];
      },
    }),
    [filters.projectIds, projects]
  );

  useEffect(() => {
    const data: PillListItemWithEmptyValue[] = [
      ...projectEntityFilterConfig.pillModifier(filters),
      ...entitySpecificFilterConfigs.map((config) => config.pillModifier(filters)).flat(),
    ];

    setFilterPillData(data);
  }, [entitySpecificFilterConfigs, filters, projectEntityFilterConfig]);

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
        {entitySpecificFilterConfigs.map((filterConfig, index) => (
          <ProjectEntityFilter filterConfig={filterConfig} setFilters={setFilters} key={index} />
        ))}
        <ProjectEntityFilter filterConfig={projectEntityFilterConfig} setFilters={setFilters} />
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
