import React from 'react';
import { Grid, Box } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import Pill from 'src/components/Pill';
import InventoryFilters, { InventoryFiltersType } from './InventoryFiltersPopover';
import { getNurseryName, removeFilter } from './FilterUtils';

interface SearchProps {
  organization: ServerOrganization;
  searchValue: string;
  onSearch: (value: string) => void;
  filters: InventoryFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>;
}

export default function Search(props: SearchProps): JSX.Element {
  const { organization, searchValue, onSearch, filters, setFilters } = props;

  return (
    <>
      <Box display='flex' flexDirection='row'>
        <Box width='300px'>
          <Textfield
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            onChange={(id, value) => onSearch(value as string)}
            value={searchValue}
            iconRight='cancel'
            onClickRightIcon={() => onSearch('')}
          />
        </Box>
        <InventoryFilters filters={filters} setFilters={setFilters} organization={organization} />
      </Box>
      <Grid xs={12} display='flex' paddingTop={1}>
        {filters.facilityIds?.map((id) => (
          <Pill
            key={id}
            filter={strings.NURSERY}
            value={getNurseryName(id, organization)}
            onRemoveFilter={() => removeFilter(id, setFilters)}
          />
        ))}
      </Grid>
    </>
  );
}
