import { useHistory, useParams } from 'react-router-dom';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from 'src/components/common/TfMain';
import { Box, Tab, Theme, Typography, useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import { Button } from '@terraware/web-components';
import strings from 'src/strings';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import { useEffect, useRef, useState } from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { makeStyles } from '@mui/styles';
import { getNurseryWithdrawal, listNurseryWithdrawals } from 'src/api/tracking/withdrawals';
import { Batch, NurseryWithdrawal } from 'src/api/types/batch';
import { Delivery } from 'src/api/types/tracking';
import useSnackbar from 'src/utils/useSnackbar';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import WithdrawalTabPanelContent from './WithdrawalDetails/WithdrawalTabPanelContent';
import ReassignmentTabPanelContent from './WithdrawalDetails/ReassignmentTabPanelContent';
import NurseryTransferContent from './WithdrawalDetails/NurseryTransferContent';
import DeadContent from './WithdrawalDetails/DeadContent';
import OtherContent from './WithdrawalDetails/OtherContent';
import { Species } from 'src/types/Species';
import BackToLink from 'src/components/common/BackToLink';

const useStyles = makeStyles((theme: Theme) => ({
  backToWithdrawals: {
    marginLeft: 0,
    marginTop: theme.spacing(2),
  },
}));

const TABS = ['withdrawal', 'reassignment'];

export interface WithdrawalSummary {
  id: string;
  delivery_id: string;
  withdrawnDate: string;
  purpose: string;
  facilityName: string;
  destinationName: string;
  plotNames: string;
  scientificNames: string[];
  totalWithdrawn: number;
  hasReassignments: boolean;
}

type NurseryWithdrawalsDetailsProps = {
  organization: ServerOrganization;
  species: Species[];
};

export default function NurseryWithdrawalsDetails({
  organization,
  species,
}: NurseryWithdrawalsDetailsProps): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { withdrawalId } = useParams<{ withdrawalId: string }>();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const [snackbar] = useState(useSnackbar());

  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const tab = (query.get('tab') || '').toLowerCase();
  const preselectedTab = TABS.indexOf(tab) === -1 ? 'withdrawal' : tab;
  const [selectedTab, setSelectedTab] = useState(preselectedTab);

  const [withdrawal, setWithdrawal] = useState<NurseryWithdrawal | undefined>(undefined);
  const [withdrawalSummary, setWithdrawalSummary] = useState<WithdrawalSummary | undefined>(undefined);
  const [delivery, setDelivery] = useState<Delivery | undefined>(undefined);
  const [batches, setBatches] = useState<Batch[] | undefined>(undefined);
  useEffect(() => {
    const updateWithdrawal = async () => {
      const withdrawalResponse = await getNurseryWithdrawal(Number(withdrawalId));
      if (!withdrawalResponse.requestSucceeded || withdrawalResponse.error) {
        setWithdrawal(undefined);
        setDelivery(undefined);
        setBatches(undefined);
        snackbar.toastError(withdrawalResponse.error);
      } else {
        setWithdrawal(withdrawalResponse.withdrawal);
        setDelivery(withdrawalResponse.delivery);
        setBatches(withdrawalResponse.batches);
      }
      // get summary information
      const apiSearchResults = await listNurseryWithdrawals(organization.id, [
        {
          operation: 'field',
          field: 'id',
          type: 'Exact',
          values: [withdrawalId],
        },
      ]);
      if (apiSearchResults && apiSearchResults.length > 0) {
        const withdrawalSummaryRecord = apiSearchResults[0];
        setWithdrawalSummary({
          id: withdrawalSummaryRecord.id as string,
          delivery_id: withdrawalSummaryRecord.delivery_id as string,
          withdrawnDate: withdrawalSummaryRecord.withdrawnDate as string,
          purpose: withdrawalSummaryRecord.purpose as string,
          facilityName: withdrawalSummaryRecord.facilityName as string,
          destinationName: withdrawalSummaryRecord.destinationName as string,
          plotNames: withdrawalSummaryRecord.plotNames as string,
          scientificNames: withdrawalSummaryRecord.speciesScientificNames as string[],
          totalWithdrawn: Number(withdrawalSummaryRecord.totalWithdrawn),
          hasReassignments: Boolean(withdrawalSummaryRecord.hasReassignments),
        });
      }
    };

    updateWithdrawal();
  }, [organization.id, withdrawalId, snackbar]);

  useEffect(() => {
    setSelectedTab((query.get('tab') || 'withdrawal') as string);
  }, [query]);

  const tabStyles = {
    fontSize: '14px',
    padding: theme.spacing(1, 2),
    minHeight: theme.spacing(4.5),
    textTransform: 'capitalize',
    '&.Mui-selected': {
      color: theme.palette.TwClrTxtBrand as string,
      fontWeight: 500,
    },
  };

  const contentPanelProps = {
    borderRadius: '32px',
    backgroundColor: theme.palette.TwClrBg,
    padding: theme.spacing(3),
  };

  const hasPlots = delivery?.plantings?.some((planting) => planting.plotId) ?? false;

  const handleTabChange = (newValue: string) => {
    query.set('tab', newValue);
    history.push(getLocation(location.pathname, location, query.toString()));
  };

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Box marginBottom={theme.spacing(4)}>
          <Box>
            <BackToLink
              id='back'
              to={APP_PATHS.NURSERY_WITHDRAWALS}
              className={classes.backToWithdrawals}
              name={strings.WITHDRAWAL_LOG}
            />
          </Box>
          <Box
            padding={isMobile ? theme.spacing(3, 0, 4, 0) : theme.spacing(3, 3, 4, 3)}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography color={theme.palette.TwClrTxt} fontSize='20px' fontWeight={600} fontStyle='italic'>
              {withdrawal?.withdrawnDate}
            </Typography>
            {withdrawal?.purpose === 'Out Plant' && hasPlots && (
              <Button
                size='medium'
                priority='secondary'
                onClick={() => undefined}
                label={strings.REASSIGN}
                disabled={withdrawalSummary?.hasReassignments}
              />
            )}
          </Box>
          <PageSnackbar />
        </Box>
      </PageHeaderWrapper>
      <div ref={contentRef}>
        {withdrawal?.purpose === 'Out Plant' && (
          <TabContext value={selectedTab}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                margin: isMobile ? 0 : theme.spacing(0, 4),
              }}
            >
              <TabList
                sx={{ minHeight: theme.spacing(4.5) }}
                onChange={(_, value) => handleTabChange(value)}
                TabIndicatorProps={{
                  style: {
                    background: theme.palette.TwClrBgBrand,
                    height: '4px',
                    borderRadius: '4px 4px 0 0',
                  },
                }}
              >
                <Tab label={strings.WITHDRAWAL} value='withdrawal' sx={tabStyles} />
                <Tab label={strings.REASSIGNMENT} value='reassignment' sx={tabStyles} />
              </TabList>
            </Box>
            <TabPanel value='withdrawal' sx={contentPanelProps}>
              <WithdrawalTabPanelContent
                organization={organization}
                species={species}
                withdrawal={withdrawal}
                withdrawalSummary={withdrawalSummary}
                delivery={delivery}
                batches={batches}
              />
            </TabPanel>
            <TabPanel value='reassignment' sx={contentPanelProps}>
              <ReassignmentTabPanelContent />
            </TabPanel>
          </TabContext>
        )}
        {withdrawal?.purpose === 'Nursery Transfer' && (
          <Box sx={contentPanelProps}>
            <NurseryTransferContent />
          </Box>
        )}
        {withdrawal?.purpose === 'Dead' && (
          <Box sx={contentPanelProps}>
            <DeadContent />
          </Box>
        )}
        {withdrawal?.purpose === 'Other' && (
          <Box sx={contentPanelProps}>
            <OtherContent />
          </Box>
        )}
      </div>
    </TfMain>
  );
}
