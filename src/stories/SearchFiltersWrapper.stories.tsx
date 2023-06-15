import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { Story } from '@storybook/react';
import SearchFiltersWrapper, { SearchProps } from 'src/components/common/SearchFiltersWrapper';

const SearchFiltersWrapperTemplate: Story<SearchProps> = (args) => {
  const [search, setSearch] = useState<string>(args.search);

  useEffect(() => setSearch(args.search), [args.search]);

  return <SearchFiltersWrapper {...args} search={search} onSearch={(val) => setSearch(val)} />;
};

const FiltersWrapperTemplate: Story<SearchProps> = (args) => {
  const [search, setSearch] = useState<string>(args.search);
  const [filters, setFilters] = useState<Record<string, any>>(args.filtersProps?.filters || {});

  useEffect(() => setSearch(args.search), [args.search]);

  return (
    <Grid container>
      <SearchFiltersWrapper
        search={search}
        onSearch={(val) => setSearch(val)}
        filtersProps={{
          filters,
          setFilters: (val) => setFilters(val),
          filterOptions: args.filtersProps?.filterOptions ?? {},
          filterColumns: args.filtersProps?.filterColumns ?? [],
        }}
      />
    </Grid>
  );
};

export default {
  title: 'SearchFiltersWrapper',
  component: SearchFiltersWrapper,
};

export const SearchWithoutFilters = SearchFiltersWrapperTemplate.bind({});

SearchWithoutFilters.args = {
  search: '',
};

export const SearchWithFilters = FiltersWrapperTemplate.bind({});

SearchWithFilters.args = {
  search: '',
  filtersProps: {
    filters: {},
    setFilters: () => {
      return;
    },
    filterColumns: [
      { name: 'donut', label: 'Donut', type: 'multiple_selection' },
      { name: 'beverage', label: 'Beverage', type: 'single_selection' },
    ],
    filterOptions: {
      donut: { partial: false, values: ['glazed', 'sugar', 'apple cider'] },
      beverage: { partial: false, values: ['milk', 'coffee', 'tea'] },
    },
  },
};
