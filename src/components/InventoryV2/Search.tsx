import React, { useEffect, useState } from 'react';
import { Grid, Box } from '@mui/material';
import { PillListItem, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import InventoryFilters, { InventoryFiltersType } from './InventoryFiltersPopover';
import { getNurseryName } from './FilterUtils';
import { useOrganization } from 'src/providers/hooks';
import { PillList } from '@terraware/web-components';
import theme from '../../theme';

interface SearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
}

export default function Search(props: SearchProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { searchValue, onSearch, filters, setFilters } = props;
  const [filterPillData, setFilterPillData] = useState<PillListItem<string>[]>();

  useEffect(() => {
    let data: PillListItem<string>[] = [];
    if ((filters.facilityIds?.length ?? 0) > 0) {
      data = [
        {
          id: 'filterPillData',
          label: strings.NURSERY,
          value: filters.facilityIds?.map((id) => getNurseryName(id, selectedOrganization))?.join(', ') ?? '',
        },
      ];
    } else if ((filters.speciesIds?.length ?? 0) > 0) {
      data = [
        {
          id: 'filterPillData',
          label: strings.SPECIES,
          value: filters.speciesIds?.map((id) => id)?.join(', ') ?? '',
        },
      ];
    }

    setFilterPillData(data);
  }, [selectedOrganization, filters.facilityIds]);

  return (
    <>
      <Box display='flex' flexDirection='row' alignItems='center'>
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
        <InventoryFilters filters={filters} setFilters={setFilters} />
      </Box>
      <Grid
        display='flex'
        flexDirection='row'
        alignItems='center'
        sx={{ marginTop: theme.spacing(0.5), marginLeft: theme.spacing(1) }}
      >
        <PillList data={filterPillData ?? []} onRemove={() => setFilters({})} />
      </Grid>
    </>
  );
}
