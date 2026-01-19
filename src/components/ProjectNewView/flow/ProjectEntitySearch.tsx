import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import { PillList } from '@terraware/web-components';

import ProjectEntityFilter, {
  EntitySpecificFilterConfig,
} from 'src/components/ProjectNewView/flow/ProjectEntityFilter';
import { ProjectEntityFilters } from 'src/components/ProjectNewView/flow/useProjectEntitySelection';
import { useLocalization, useOrganization } from 'src/providers';
import { selectProjects } from 'src/redux/features/projects/projectsSelectors';
import { requestProjects } from 'src/redux/features/projects/projectsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

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

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const projects = useAppSelector(selectProjects);

  const [filterPillData, setFilterPillData] = useState<PillListItemWithEmptyValue[]>([]);

  const onRemovePillList = useCallback(
    (filterId: string) => {
      const filter = filterPillData?.find((filterPillDatum) => filterPillDatum.id === filterId);
      setFilters({ [filterId]: filter?.emptyValue || null });
    },
    [filterPillData, setFilters]
  );

  const projectEntityFilterConfig: EntitySpecificFilterConfig | undefined = useMemo(
    () =>
      projects?.length
        ? {
            label: strings.PROJECT,
            initialSelection: filters.projectIds || [],
            filterKey: 'projectIds',
            options: projects?.map((project) => project.id) || [],
            renderOption: (projectId: string | number | null) =>
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
                  value:
                    projectIds[0] === null
                      ? strings.NO_PROJECT
                      : projectIds
                          .map((projectId: number) => (projects || []).find((project) => project.id === projectId))
                          .map((project) => project?.name)
                          .join(','),
                  emptyValue: [],
                },
              ];
            },
          }
        : undefined,
    [filters.projectIds, projects]
  );

  useEffect(() => {
    const data: PillListItemWithEmptyValue[] = [
      ...(projectEntityFilterConfig ? projectEntityFilterConfig.pillModifier(filters) : []),
      ...entitySpecificFilterConfigs.map((config) => config.pillModifier(filters)).flat(),
    ];

    setFilterPillData(data);
  }, [entitySpecificFilterConfigs, filters, projectEntityFilterConfig]);

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestProjects(selectedOrganization.id, activeLocale || undefined));
    }
  }, [activeLocale, dispatch, selectedOrganization]);

  return (
    <Grid container>
      <Grid item xs={12}>
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
          {projectEntityFilterConfig && (
            <ProjectEntityFilter filterConfig={projectEntityFilterConfig} setFilters={setFilters} />
          )}
        </Box>
      </Grid>
      <Grid item xs={12} display='flex' flexDirection='row' alignItems='center' sx={{ marginTop: theme.spacing(2) }}>
        <PillList data={filterPillData} onRemove={onRemovePillList} />
      </Grid>
    </Grid>
  );
}
