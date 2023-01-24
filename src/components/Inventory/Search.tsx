import React from 'react';
import { Grid, Box } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import InventoryFilters, { InventoryFiltersType } from './InventoryFiltersPopover';
import { getNurseryName, removeFilter } from './FilterUtils';
import { useOrganization } from 'src/providers/hooks';
import { PillList } from '@terraware/web-components';

interface SearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
}

export default function Search(props: SearchProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { searchValue, onSearch, filters, setFilters } = props;

  const filterPillData =
    filters.facilityIds?.map((id) => {
      return {
        id,
        label: strings.NURSERY,
        value: getNurseryName(id, selectedOrganization),
      };
    }) || [];

  return (
    <>
      <Box display='flex' flexDirection='row' alignItems='center' marginBottom={filters.facilityIds?.length ? 2 : 0}>
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
      <Grid xs={12} display='flex'>
        <PillList data={filterPillData} onRemove={(id: number) => removeFilter(id, setFilters)} />
      </Grid>
    </>
  );
}
