import React from 'react';
import { Grid, Box } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import Pill from 'src/components/Pill';
import InventoryFilters, { InventoryFiltersType } from './InventoryFiltersPopover';
import { getNurseryName, removeFilter } from './FilterUtils';
import { useOrganization } from 'src/providers/hooks';

interface SearchProps {
  searchValue: string;
  onSearch: (value: string) => void;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
}

export default function Search(props: SearchProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const { searchValue, onSearch, filters, setFilters } = props;

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
        {filters.facilityIds?.map((id) => (
          <Pill
            key={id}
            filter={strings.NURSERY}
            value={getNurseryName(id, selectedOrganization!!)}
            onRemoveFilter={() => removeFilter(id, setFilters)}
          />
        ))}
      </Grid>
    </>
  );
}
