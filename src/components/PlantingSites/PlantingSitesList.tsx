import { Box, CircularProgress, Container, Grid, Typography } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { search, SearchResponseElement } from 'src/api/search';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TfMain from '../common/TfMain';
import EmptyStatePage from '../emptyStatePages/EmptyStatePage';
import PlantigSitesTable from './PlantigSitesTable';

type PlantingSitesListProps = {
  organization: ServerOrganization;
};

export default function PlantingSitesList(props: PlantingSitesListProps): JSX.Element {
  const { organization } = props;
  const contentRef = useRef(null);
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const { isMobile } = useDeviceInfo();
  const history = useHistory();

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const onSearch = useCallback(async () => {
    const params = {
      fields: ['boundary', 'id', 'name', 'numPlantingZones', 'numPlots'],
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
        <Box sx={{ paddingBottom: theme.spacing(3), display: 'flex', justifyContent: 'space-between' }}>
          <Grid item xs={6}>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.PLANTING_SITES}
            </Typography>
          </Grid>
          {searchResults && searchResults.length > 0 ? (
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              {isMobile ? (
                <Button
                  id='new-planting-site'
                  icon='plus'
                  onClick={() => goTo(APP_PATHS.PLANTING_SITES_NEW)}
                  size='medium'
                />
              ) : (
                <Button
                  id='new-planting-site'
                  icon='plus'
                  label={strings.ADD_PLANTING_SITE}
                  onClick={() => goTo(APP_PATHS.PLANTING_SITES_NEW)}
                  size='medium'
                />
              )}
            </Grid>
          ) : null}
        </Box>
      </PageHeaderWrapper>
      <Grid>
        {searchResults ? (
          <Box>
            {searchResults?.length === 0 ? (
              <Container sx={{ paddingY: 4 }}>
                <EmptyStatePage pageName={'PlantingSites'} />
              </Container>
            ) : (
              <PlantigSitesTable
                organization={organization}
                results={searchResults || []}
                temporalSearchValue={temporalSearchValue}
                setTemporalSearchValue={setTemporalSearchValue}
              />
            )}
          </Box>
        ) : (
          <Box sx={{ position: 'fixed', top: '50%', left: '50%' }}>
            <CircularProgress />
          </Box>
        )}
      </Grid>
    </TfMain>
  );
}
