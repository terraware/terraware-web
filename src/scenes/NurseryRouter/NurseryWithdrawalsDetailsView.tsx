import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Tab, Theme, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, Message } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import OptionsMenu from 'src/components/common/OptionsMenu';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import { NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';
import { Batch, NurseryWithdrawal } from 'src/types/Batch';
import { NurseryWithdrawalPurposes } from 'src/types/Batch';
import { Species } from 'src/types/Species';
import { Delivery } from 'src/types/Tracking';
import { isTrue } from 'src/utils/boolean';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useSnackbar from 'src/utils/useSnackbar';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import UndoWithdrawalModal from './UndoWithdrawalModal';
import NonOutplantWithdrawalContent from './WithdrawalDetails/NonOutplantWithdrawalContent';
import ReassignmentTabPanelContent from './WithdrawalDetails/ReassignmentTabPanelContent';
import WithdrawalTabPanelContent from './WithdrawalDetails/WithdrawalTabPanelContent';

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
  const { OUTPLANT, NURSERY_TRANSFER } = NurseryWithdrawalPurposes;
  const query = useQuery();
  const navigate = useNavigate();
  const location = useStateLocation();
  const tab = (query.get('tab') || '').toLowerCase();
  const preselectedTab = TABS.indexOf(tab) === -1 ? 'withdrawal' : tab;
  const [selectedTab, setSelectedTab] = useState(preselectedTab);

  const [withdrawal, setWithdrawal] = useState<NurseryWithdrawal | undefined>(undefined);
  const [withdrawalSummary, setWithdrawalSummary] = useState<WithdrawalSummary | undefined>(undefined);
  const [delivery, setDelivery] = useState<Delivery | undefined>(undefined);
  const [batches, setBatches] = useState<Batch[] | undefined>(undefined);
  const [undoWithdrawalModalOpened, setUndoWithdrawalModalOpened] = useState(false);
  const [reload, setReload] = useState(false);

  const reloadWithdrawal = () => {
    setReload(true);
  };
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
      if (withdrawalId) {
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
      }
    };

    updateWithdrawal();
  }, [selectedOrganization, withdrawalId, snackbar, reload]);

  useEffect(() => {
    setSelectedTab(query.get('tab') || 'withdrawal');
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
      navigate({
        pathname: APP_PATHS.NURSERY_REASSIGNMENT.replace(':deliveryId', delivery.id.toString()),
        search: '?fromWithdrawal',
      });
    }
  };

  const handleTabChange = (newValue: string) => {
    query.set('tab', newValue);
    navigate(getLocation(location.pathname, location, query.toString()));
  };

  return (
    <TfMain>
      {undoWithdrawalModalOpened && (
        <UndoWithdrawalModal
          onClose={() => setUndoWithdrawalModalOpened(false)}
          row={withdrawalSummary}
          reload={reloadWithdrawal}
        />
      )}
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Box marginBottom={theme.spacing(4)}>
          <Box>
            <BackToLink
              id='back'
              to={`${APP_PATHS.NURSERY_WITHDRAWALS}?tab=withdrawal_history`}
              className={classes.backToWithdrawals}
              name={strings.WITHDRAWAL_HISTORY}
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

            {!withdrawal?.undoneByWithdrawalId && (
              <Box>
                {withdrawal?.purpose === OUTPLANT && hasSubzones && (
                  <Box sx={{ display: 'inline', paddingLeft: 1 }}>
                    <Button
                      size='medium'
                      priority='secondary'
                      onClick={handleReassign}
                      label={strings.REASSIGN}
                      disabled={withdrawalSummary?.hasReassignments}
                    />
                  </Box>
                )}
                {withdrawal?.purpose !== NURSERY_TRANSFER && !withdrawal?.undoesWithdrawalId && (
                  <OptionsMenu
                    onOptionItemClick={() => setUndoWithdrawalModalOpened(true)}
                    optionItems={[{ label: strings.UNDO_WITHDRAWAL, value: 'undo' }]}
                  />
                )}
              </Box>
            )}
          </Box>
          <PageSnackbar />
        </Box>
      </PageHeaderWrapper>
      <div ref={contentRef}>
        {withdrawal?.undoneByWithdrawalId && (
          <Box sx={{ marginTop: 0, marginBottom: 4 }}>
            <Message
              type='page'
              title={strings.WITHDRAWAL_UNDONE}
              priority={'warning'}
              body={strings.UNDONE_WITHDRAWAL_MESSAGE}
            />
          </Box>
        )}
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
