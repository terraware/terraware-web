/**
 * Nursery plantings and withdrawals
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Tabs } from '@terraware/web-components';
import strings from 'src/strings';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { useLocalization, useOrganization } from 'src/providers';
import { useAppDispatch } from 'src/redux/store';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import PlantingProgress from './PlantingProgressTabContent';
import NurseryWithdrawals from './NurseryWithdrawalsTabContent';
import { requestPlantingSitesSearchResults } from 'src/redux/features/tracking/trackingThunks';

const useStyles = makeStyles(() => ({
  tabs: {
    '& .MuiTabPanel-root[hidden]': {
      flexGrow: 0,
    },
    '& .MuiTabPanel-root': {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    '& >.MuiBox-root': {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
  },
}));

type NurseryWithdrawalsProps = {
  reloadTracking: () => void;
};

export default function NurseryPlantingsAndWithdrawalsView({ reloadTracking }: NurseryWithdrawalsProps): JSX.Element {
  const classes = useStyles();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const contentRef = useRef(null);
  const dispatch = useAppDispatch();
  const tab = query.get('tab') || 'planting_progress';

  const [activeTab, setActiveTab] = useState<string>(tab);

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      history.push(getLocation(location.pathname, location, query.toString()));
    },
    [query, history, location]
  );

  useEffect(() => {
    dispatch(requestPlantings(selectedOrganization.id));
    dispatch(requestPlantingSitesSearchResults(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (activeLocale) {
      setActiveTab(tab);
    }
  }, [tab, activeLocale]);

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }} display='flex' flexDirection='column' flexGrow={1}>
        <Grid container spacing={3} sx={{ marginTop: 0 }} display='flex' flexDirection='column' flexGrow={1}>
          <PageHeaderWrapper nextElement={contentRef.current}>
            <Grid container spacing={3} sx={{ paddingLeft: theme.spacing(3), paddingBottom: theme.spacing(4) }}>
              <Grid item xs={8}>
                <Typography sx={{ marginTop: 0, marginBottom: 0, fontSize: '24px', fontWeight: 600 }}>
                  {strings.WITHDRAWALS}
                </Typography>
              </Grid>
            </Grid>
          </PageHeaderWrapper>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
          <Box
            ref={contentRef}
            display='flex'
            flexDirection='column'
            flexGrow={1}
            maxWidth='100%'
            className={classes.tabs}
          >
            <Tabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              tabs={[
                {
                  id: 'planting_progress',
                  label: strings.PLANTING_PROGRESS,
                  children: <PlantingProgress reloadTracking={reloadTracking} />,
                },
                { id: 'withdrawal_history', label: strings.WITHDRAWAL_HISTORY, children: <NurseryWithdrawals /> },
              ]}
            />
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
