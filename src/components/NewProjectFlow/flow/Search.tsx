import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Box, useTheme } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import { PillList } from '@terraware/web-components';
import strings from 'src/strings';
import { ProjectEntitiesFilters } from 'src/components/NewProjectFlow/flow/useProjectEntitySelection';

interface SearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  filters: ProjectEntitiesFilters;
  setFilters: React.Dispatch<React.SetStateAction<ProjectEntitiesFilters>>;
}

type PillListItemWithEmptyValue = PillListItem<string> & { emptyValue: unknown };

export default function Search(props: SearchProps): JSX.Element | null {
  const { searchValue, onSearch, filters, setFilters } = props;

  const theme = useTheme();

  const [filterPillData, setFilterPillData] = useState<PillListItemWithEmptyValue[]>([]);

  useEffect(() => {
    let data: PillListItemWithEmptyValue[] = [];
    if (filters.projectIds && filters.projectIds.length > 0) {
      data = [
        {
          id: 'projectIds',
          label: strings.PROJECT,
          // TODO
          value: filters.projectIds.join(','),
          emptyValue: [],
        },
      ];
    }

    if (filters.statuses && filters.statuses.length > 0) {
      data = [
        {
          id: 'statuses',
          label: strings.STATUS,
          // TODO
          value: filters.statuses.join(','),
          emptyValue: [],
        },
      ];
    }

    if (filters.nurseryIds && filters.nurseryIds.length > 0) {
      data = [
        {
          id: 'nurseryIds',
          label: strings.NURSERY,
          // TODO
          value: filters.nurseryIds.join(','),
          emptyValue: [],
        },
      ];
    }

    setFilterPillData(data);
  }, [filters.projectIds, filters.statuses, filters.nurseryIds]);

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
