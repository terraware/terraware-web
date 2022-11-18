import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Table, TableColumnType } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { search, SearchNodePayload } from 'src/api/search';
import { Facility, FacilityType } from 'src/api/types/facilities';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { getRequestId, setRequestId } from 'src/utils/requestsId';
import useDebounce from 'src/utils/useDebounce';
import TfMain from '../common/TfMain';
import PageSnackbar from '../PageSnackbar';
import NurseriesCellRenderer from './TableCellRenderer';
import PageHeaderWrapper from '../common/PageHeaderWrapper';

type NurseriesListProps = {
  organization: ServerOrganization;
};

const columns: TableColumnType[] = [
  { key: 'name', name: 'Name', type: 'string' },
  { key: 'description', name: 'Description', type: 'string' },
];

export default function NurseriesList({ organization }: NurseriesListProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const [temporalSearchValue, setTemporalSearchValue] = useState('');
  const debouncedSearchTerm = useDebounce(temporalSearchValue, 250);
  const [results, setResults] = useState<Facility[]>();
  const contentRef = useRef(null);

  const goToNewNursery = () => {
    const newNurseryLocation = {
      pathname: APP_PATHS.NURSERIES_NEW,
    };
    history.push(newNurseryLocation);
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  useEffect(() => {
    const refreshSearch = async () => {
      const params: SearchNodePayload = {
        prefix: 'facilities',
        fields: ['id', 'name', 'description', 'type', 'organization_id'],
        search: {
          operation: 'and',
          children: [
            {
              operation: 'or',
              children: [
                { operation: 'field', field: 'name', type: 'Fuzzy', values: [debouncedSearchTerm] },
                { operation: 'field', field: 'description', type: 'Fuzzy', values: [debouncedSearchTerm] },
              ],
            },
            { operation: 'field', field: 'type', type: 'Exact', values: ['Nursery'] },
            {
              operation: 'field',
              field: 'organization_id',
              type: 'Exact',
              values: [organization.id],
            },
          ],
        },
        count: 0,
      };
      const requestId = Math.random().toString();
      setRequestId('searchNurseries', requestId);
      const searchResults = await search(params);
      const nurseriesResults: Facility[] = [];
      searchResults?.forEach((result) => {
        nurseriesResults.push({
          id: result.id as number,
          name: result.name as string,
          description: result.description as string,
          organizationId: parseInt(result.organization_id as string, 10),
          type: result.type as FacilityType,
          connectionState: result.connectionState as 'Not Connected' | 'Connected' | 'Configured',
        });
      });
      if (getRequestId('searchNurseries') === requestId) {
        setResults(nurseriesResults);
      }
    };
    refreshSearch();
  }, [debouncedSearchTerm, organization]);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Grid container paddingBottom={theme.spacing(4)} paddingLeft={isMobile ? 0 : theme.spacing(3)}>
          <Grid item xs={9} alignItems='center'>
            <Typography fontSize='24px' fontWeight={600}>
              {strings.NURSERIES}
            </Typography>
          </Grid>
          <Grid item xs={3} sx={{ textAlign: 'right' }}>
            {['Admin', 'Owner'].includes(organization.role) &&
              (isMobile ? (
                <Button id='new-nursery' icon='plus' onClick={goToNewNursery} size='medium' />
              ) : (
                <Button id='new-nursery' icon='plus' label={strings.ADD_NURSERY} onClick={goToNewNursery} size='medium' />
              ))}
          </Grid>
          <PageSnackbar />
        </Grid>
      </PageHeaderWrapper>
      <Grid container ref={contentRef} sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderRadius: '32px',
        padding: theme.spacing(3),
        minWidth: 'fit-content'
      }}>
        <Grid item xs={12}>
          <Box width='300px'>
            <TextField
              placeholder={strings.SEARCH}
              iconLeft='search'
              label=''
              id='search'
              type='text'
              onChange={onChangeSearch}
              value={temporalSearchValue}
              iconRight='cancel'
              onClickRightIcon={clearSearch}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          {results && (
            <Table
              id='nurseries-table'
              columns={columns}
              rows={results}
              orderBy='name'
              Renderer={NurseriesCellRenderer}
            />
          )}
        </Grid>
      </Grid>
    </TfMain>
  );
}
