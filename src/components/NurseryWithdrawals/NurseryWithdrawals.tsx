import { Box, Grid, Theme, Typography, useTheme } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useEffect, useRef, useState } from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import TfMain from '../common/TfMain';
import { makeStyles } from '@mui/styles';
import { Table, TableColumnType } from '@terraware/web-components';
import { listNurseryWithdrawals } from 'src/api/tracking/withdrawals';
import { SearchResponseElement } from 'src/api/search';
import WithdrawalLogRenderer from './WithdrawalLogRenderer';
import { APP_PATHS } from 'src/constants';
import { useHistory } from 'react-router-dom';

type NurseryWithdrawalsProps = {
  organization: ServerOrganization;
};

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    width: '300px',
  },
}));

const columns: TableColumnType[] = [
  { key: 'withdrawnDate', name: strings.DATE, type: 'string' },
  { key: 'purpose', name: strings.PURPOSE, type: 'string' },
  { key: 'facility_name', name: strings.FROM_NURSERY, type: 'string' },
  { key: 'destinationName', name: strings.DESTINATION, type: 'string' },
  { key: 'plotNames', name: strings.TO_PLOT, type: 'string' },
  { key: 'speciesScientificNames', name: strings.SPECIES, type: 'string' },
  { key: 'totalWithdrawn', name: strings.TOTAL_QUANTITY, type: 'string' },
  { key: 'hasReassignments', name: '', type: 'string' },
];

export default function NurseryWithdrawals(props: NurseryWithdrawalsProps): JSX.Element {
  const { organization } = props;
  const theme = useTheme();
  const contentRef = useRef(null);
  const classes = useStyles();
  const [nurseryWithdrawals, setNurseryWithdrawals] = useState<SearchResponseElement[]>();
  const history = useHistory();

  useEffect(() => {
    const getNurseryWithdrawals = async () => {
      if (organization) {
        const withdrawals = await listNurseryWithdrawals(organization.id, []);
        if (withdrawals) {
          setNurseryWithdrawals(withdrawals);
        }
      }
    };

    getNurseryWithdrawals();
  }, [organization]);

  const onWithdrawalClicked = (withdrawal: any) => {
    history.push({
      pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', withdrawal.delivery_id),
    });
  };

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }}>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3), paddingBottom: theme.spacing(4) }}>
              <Grid item xs={8}>
                <Typography sx={{ marginTop: 0, marginBottom: 0, fontSize: '24px', fontWeight: 600 }}>
                  {strings.WITHDRAWAL_LOG}
                </Typography>
              </Grid>
            </Grid>
          </PageHeaderWrapper>
          <Grid
            container
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              padding: theme.spacing(3),
              borderRadius: '32px',
              minWidth: 'fit-content',
            }}
            ref={contentRef}
          >
            <Grid item xs={12} sx={{ display: 'flex', marginBottom: '16px' }}>
              <TextField
                placeholder={strings.SEARCH}
                iconLeft='search'
                label=''
                id='search'
                type='text'
                className={classes.searchField}
                iconRight='cancel'
              />
            </Grid>
            <Grid item xs={12}>
              <div>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <Table
                      id='withdrawal-log'
                      columns={columns}
                      rows={nurseryWithdrawals || []}
                      Renderer={WithdrawalLogRenderer}
                      orderBy={'name'}
                      onSelect={onWithdrawalClicked}
                    />
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </TfMain>
  );
}
