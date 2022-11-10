import { Box, Container, Grid, Typography } from '@mui/material';
import { theme } from '@terraware/web-components';
import { useCallback, useEffect, useRef, useState } from 'react';
import { search, SearchResponseElement } from 'src/api/search';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TfMain from '../common/TfMain';
import EmptyStatePage from '../emptyStatePages/EmptyStatePage';

type PlantingSitesListProps = {
  organization: ServerOrganization;
};

export default function PlantingSitesList(props: PlantingSitesListProps): JSX.Element {
  const { organization } = props;
  const contentRef = useRef(null);
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();

  const onSearch = useCallback(async () => {
    const params = {
      fields: ['boundary', 'id', 'name'],
      prefix: 'plantingSites',
      search: {
        field: 'organization_id',
        operation: 'field',
        values: [organization.id],
      },
      count: 0,
    };
    const apiSearchResults = await search(params);
    setSearchResults(apiSearchResults);
  }, [organization]);

  useEffect(() => {
    onSearch();
  }, [organization, onSearch]);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ paddingBottom: theme.spacing(3) }}>
          <Grid item xs={6}>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.PLANTING_SITES}
            </Typography>
          </Grid>
        </Box>
      </PageHeaderWrapper>
      <Grid>
        <Box>
          {searchResults?.length === 0 && (
            <Container sx={{ paddingY: 4 }}>
              <EmptyStatePage pageName={'PlantingSites'} />
            </Container>
          )}
        </Box>
      </Grid>
    </TfMain>
  );
}
