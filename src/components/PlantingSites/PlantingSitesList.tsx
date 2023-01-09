import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import { Button, theme } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { search, SearchResponseElement } from 'src/api/search';
import strings from 'src/strings';
import useDebounce from 'src/utils/useDebounce';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import PlantingSitesTable from './PlantingSitesTable';
import PlantingSiteTypeSelect from './PlantingSiteTypeSelect';
import { useOrganization } from 'src/providers/hooks';

export default function PlantingSitesList(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const contentRef = useRef(null);
  const [searchResults, setSearchResults] = useState<SearchResponseElement[] | null>();
  const [plantingSites, setPlantingSites] = useState<SearchResponseElement[] | null>();
  const [plantingSiteTypeSelectOpen, setPlantingSiteTypeSelectOpen] = useState(false);
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const { isMobile } = useDeviceInfo();

  const onSearch = useCallback(async () => {
    const searchField = debouncedSearchTerm
      ? {
          operation: 'or',
          children: [
            { operation: 'field', field: 'name', type: 'Fuzzy', values: [debouncedSearchTerm] },
            { operation: 'field', field: 'description', type: 'Fuzzy', values: [debouncedSearchTerm] },
          ],
        }
      : null;

    const params = {
      fields: ['boundary', 'id', 'name', 'numPlantingZones', 'numPlots', 'description'],
      prefix: 'plantingSites',
      search: {
        operation: 'and',
        children: [
          {
            field: 'organization_id',
            operation: 'field',
            values: [selectedOrganization.id],
          },
        ],
      },
      count: 0,
    };

    if (searchField) {
      const children: any = params.search.children;
      children.push(searchField);
    }

    const apiSearchResults = await search(params);
    if (!debouncedSearchTerm) {
      setPlantingSites(apiSearchResults);
    }
    setSearchResults(apiSearchResults);
  }, [selectedOrganization, debouncedSearchTerm]);

  useEffect(() => {
    onSearch();
  }, [selectedOrganization, onSearch]);

  if (plantingSites && !plantingSites.length) {
    return <EmptyStatePage backgroundImageVisible={true} pageName={'PlantingSites'} />;
  }

  return (
    <TfMain>
      <PlantingSiteTypeSelect open={plantingSiteTypeSelectOpen} onClose={() => setPlantingSiteTypeSelectOpen(false)} />
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Box sx={{ padding: theme.spacing(0, 0, 4, 3), display: 'flex', justifyContent: 'space-between' }}>
          <Grid item xs={6}>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.PLANTING_SITES}
            </Typography>
          </Grid>
          {plantingSites && plantingSites.length > 0 ? (
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              {isMobile ? (
                <Button
                  id='new-planting-site'
                  icon='plus'
                  onClick={() => setPlantingSiteTypeSelectOpen(true)}
                  size='medium'
                />
              ) : (
                <Button
                  id='new-planting-site'
                  icon='plus'
                  label={strings.ADD_PLANTING_SITE}
                  onClick={() => setPlantingSiteTypeSelectOpen(true)}
                  size='medium'
                />
              )}
            </Grid>
          ) : null}
        </Box>
      </PageHeaderWrapper>
      <Grid item xs={12}>
        <PageSnackbar />
      </Grid>
      <Grid display='flex' flexDirection={isMobile ? 'row' : 'column'} flexGrow={1}>
        {plantingSites ? (
          <Box display='flex' flexDirection='column'>
            <PlantingSitesTable
              results={searchResults || []}
              temporalSearchValue={temporalSearchValue}
              setTemporalSearchValue={setTemporalSearchValue}
            />
          </Box>
        ) : (
          <CircularProgress sx={{ margin: 'auto' }} />
        )}
      </Grid>
    </TfMain>
  );
}
