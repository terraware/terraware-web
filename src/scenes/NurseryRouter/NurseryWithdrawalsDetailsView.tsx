import { useHistory, useParams } from 'react-router-dom';
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
import { NurseryWithdrawalService } from 'src/services';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { Delivery } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import WithdrawalTabPanelContent from './WithdrawalDetails/WithdrawalTabPanelContent';
import ReassignmentTabPanelContent from './WithdrawalDetails/ReassignmentTabPanelContent';
import NonOutplantWithdrawalContent from './WithdrawalDetails/NonOutplantWithdrawalContent';
import { Species } from 'src/types/Species';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';
import BackToLink from 'src/components/common/BackToLink';
import { useOrganization } from 'src/providers/hooks';
import { isTrue } from 'src/utils/boolean';

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
  subzoneNames: string;
  scientificNames: string[];
  totalWithdrawn: string;
  hasReassignments: boolean;
}

type NurseryWithdrawalsDetailsViewProps = {
  species: Species[];
  plantingSubzoneNames: Record<number, string>;
};

export default function NurseryWithdrawalsDetailsView({
  species,
  plantingSubzoneNames,
}: NurseryWithdrawalsDetailsViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const classes = useStyles();
  const theme = useTheme();
  const { withdrawalId } = useParams<{ withdrawalId: string }>();
  const { isMobile } = useDeviceInfo();
  const contentRef = useRef(null);
  const snackbar = useSnackbar();
  const { OUTPLANT } = NurseryWithdrawalPurposes;
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
      const withdrawalResponse = await NurseryWithdrawalService.getNurseryWithdrawal(Number(withdrawalId));
      if (!withdrawalResponse.requestSucceeded || withdrawalResponse.error) {
        setWithdrawal(undefined);
        setDelivery(undefined);
        setBatches(undefined);
        snackbar.toastError();
      } else {
        setWithdrawal(withdrawalResponse.withdrawal);
        setDelivery(withdrawalResponse.delivery);
        setBatches(withdrawalResponse.batches);
      }
      // get summary information
      const apiSearchResults = await NurseryWithdrawalService.listNurseryWithdrawals(selectedOrganization.id, [
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
          subzoneNames: withdrawalSummaryRecord.plantingSubzoneNames as string,
          scientificNames: withdrawalSummaryRecord.speciesScientificNames as string[],
          totalWithdrawn: withdrawalSummaryRecord.totalWithdrawn as string,
          hasReassignments: isTrue(withdrawalSummaryRecord.hasReassignments),
        });
      }
    };

    updateWithdrawal();
  }, [selectedOrganization, withdrawalId, snackbar]);

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
    // needed to fit in mobile view
    minWidth: 'fit-content',
  };

  const hasSubzones = delivery?.plantings?.some((planting) => planting.plantingSubzoneId) ?? false;

  const handleReassign = () => {
    if (delivery) {
      history.push({
        pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', delivery.id.toString()),
        search: '?fromWithdrawal',
      });
    }
  };

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
              to={`${APP_PATHS.NURSERY_WITHDRAWALS}?tab=withdrawal_history`}
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
            <Typography color={theme.palette.TwClrTxt} fontSize='24px' lineHeight='32px' fontWeight={600}>
              {withdrawal?.withdrawnDate}
            </Typography>
            {withdrawal?.purpose === OUTPLANT && hasSubzones && (
              <Button
                size='medium'
                priority='secondary'
                onClick={handleReassign}
                label={strings.REASSIGN}
                disabled={withdrawalSummary?.hasReassignments}
              />
            )}
          </Box>
          <PageSnackbar />
        </Box>
      </PageHeaderWrapper>
      <div ref={contentRef}>
        {withdrawal?.purpose === OUTPLANT && withdrawalSummary?.hasReassignments && (
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
                species={species}
                plantingSubzoneNames={plantingSubzoneNames}
                withdrawal={withdrawal}
                withdrawalSummary={withdrawalSummary}
                delivery={delivery}
                batches={batches}
              />
            </TabPanel>
            <TabPanel value='reassignment' sx={contentPanelProps}>
              <ReassignmentTabPanelContent
                species={species}
                plantingSubzoneNames={plantingSubzoneNames}
                withdrawal={withdrawal}
                delivery={delivery}
                batches={batches}
              />
            </TabPanel>
          </TabContext>
        )}
        {withdrawal?.purpose === OUTPLANT && !withdrawalSummary?.hasReassignments && (
          <Box sx={contentPanelProps}>
            <WithdrawalTabPanelContent
              species={species}
              plantingSubzoneNames={plantingSubzoneNames}
              withdrawal={withdrawal}
              withdrawalSummary={withdrawalSummary}
              delivery={delivery}
              batches={batches}
            />
          </Box>
        )}
        {withdrawal?.purpose !== OUTPLANT && (
          <Box sx={contentPanelProps}>
            <NonOutplantWithdrawalContent
              species={species}
              withdrawal={withdrawal}
              withdrawalSummary={withdrawalSummary}
              batches={batches}
            />
          </Box>
        )}
      </div>
    </TfMain>
  );
}
