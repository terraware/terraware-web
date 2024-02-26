import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Grid } from '@mui/material';
import { Story } from '@storybook/react';
import Card from 'src/components/common/Card';
import TfMain from 'src/components/common/TfMain';
import SearchFiltersWrapperV2, { FilterConfig, SearchProps } from 'src/components/common/SearchFiltersWrapperV2';

const useStyles = makeStyles(() => ({
  mainContainer: {
    padding: 0,
  },
}));

const SearchFiltersWrapperV2Template: Story<SearchProps> = (args) => {
  const classes = useStyles();

  const [search, setSearch] = useState<string>(args.search);
  const [filters, setFilters] = useState<Record<string, any>>({});

  useEffect(() => setSearch(args.search), [args.search]);

  return (
    <TfMain>
      <Container maxWidth={false} className={classes.mainContainer}>
        <Card flushMobile>
          <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px', alignItems: 'center' }}>
            <SearchFiltersWrapperV2
              search={search}
              onSearch={(val) => setSearch(val)}
              featuredFilters={args.featuredFilters}
              iconFilters={args.iconFilters}
              currentFilters={filters}
              setCurrentFilters={setFilters}
            />
          </Grid>
        </Card>
      </Container>
      <pre>{JSON.stringify(filters)}</pre>
    </TfMain>
  );
};

export default {
  title: 'SearchFiltersWrapperV2',
  component: SearchFiltersWrapperV2,
};

export const SearchFiltersWrapperV2Story = SearchFiltersWrapperV2Template.bind({});

const featuredFilters: FilterConfig[] = [
  {
    field: 'beverage',
    options: ['milk', 'coffee', 'tea'],
    label: 'Beverage',
  },
];

const iconFilters: FilterConfig[] = [
  {
    field: 'donut',
    options: ['glazed', 'sugar', 'apple cider'],
    label: 'Donut',
  },
];

SearchFiltersWrapperV2Story.args = {
  search: '',
  featuredFilters,
  iconFilters,
};
