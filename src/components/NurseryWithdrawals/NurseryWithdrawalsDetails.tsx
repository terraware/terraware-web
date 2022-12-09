import { Link, useHistory, useParams } from 'react-router-dom';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from '../common/TfMain';
import { Box, Tab, Theme, Typography, useTheme } from '@mui/material';
import { APP_PATHS } from '../../constants';
import { Button, Icon } from '@terraware/web-components';
import strings from '../../strings';
import PageSnackbar from '../PageSnackbar';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import { useEffect, useRef, useState } from 'react';
import useDeviceInfo from '../../utils/useDeviceInfo';
import { makeStyles } from '@mui/styles';
import { getNurseryWithdrawal } from '../../api/tracking/withdrawals';
import { Batch, NurseryWithdrawal } from '../../api/types/batch';
import { Delivery } from '../../api/types/tracking';
import useSnackbar from '../../utils/useSnackbar';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import useQuery from '../../utils/useQuery';
import useStateLocation, { getLocation } from '../../utils/useStateLocation';
import WithdrawalTabPanelContent from './WithdrawalDetails/WithdrawalTabPanelContent';
import ReassignmentTabPanelContent from './WithdrawalDetails/ReassignmentTabPanelContent';
import NurseryTransferContent from './WithdrawalDetails/NurseryTransferContent';
import DeadContent from './WithdrawalDetails/DeadContent';
import OtherContent from './WithdrawalDetails/OtherContent';

const useStyles = makeStyles((theme: Theme) => ({
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: '4px',
  },
  backToWithdrawals: {
    fontSize: '14px',
    fontWeight: 500,
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    alignItems: 'center',
    marginLeft: 0,
    marginTop: theme.spacing(2),
  },
}));

const TABS = ['withdrawal', 'reassignment'];

type NurseryWithdrawalsDetailsProps = {
  organization: ServerOrganization;
};

export default function NurseryWithdrawalsDetails({ organization }: NurseryWithdrawalsDetailsProps): JSX.Element {
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
  const [delivery, setDelivery] = useState<Delivery | undefined>(undefined);
  const [batches, setBatches] = useState<Batch[] | undefined>(undefined);
  useEffect(() => {
    const updateWithdrawal = async () => {
      const withdrawalResponse = await getNurseryWithdrawal(withdrawalId);
      if (!withdrawalResponse.requestSucceeded || withdrawalResponse.error) {
        setWithdrawal(undefined);
        setDelivery(undefined);
        setBatches(undefined);
        snackbar.toastError(`An Error Occurred: ${withdrawalResponse.error}`);
      } else {
        setWithdrawal(withdrawalResponse.withdrawal);
        setDelivery(withdrawalResponse.delivery);
        setBatches(withdrawalResponse.batches);
      }
    };

    updateWithdrawal();
  }, [withdrawalId, snackbar]);

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

  const handleTabChange = (newValue: string) => {
    query.set('tab', newValue);
    history.push(getLocation(location.pathname, location, query.toString()));
  };

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current} nextElementInitialMargin={-24}>
        <Box marginBottom={theme.spacing(4)}>
          <Box>
            <Link id='back' to={APP_PATHS.NURSERY_WITHDRAWALS} className={classes.backToWithdrawals}>
              <Icon name='caretLeft' className={classes.backIcon} size='small' />
              {strings.WITHDRAWAL_LOG}
            </Link>
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
            {withdrawal?.purpose === 'Out Plant' && (
              <Button size='medium' priority='secondary' onClick={() => undefined} label={strings.REASSIGN} />
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
                withdrawal={withdrawal}
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
