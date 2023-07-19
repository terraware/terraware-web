/**
 * Nursery plantings and withdrawals
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';
import strings from 'src/strings';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { useOrganization } from 'src/providers';
import { useAppDispatch } from 'src/redux/store';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import PageSnackbar from 'src/components/PageSnackbar';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import PlantingProgress from './PlantingProgressTabContent';
import NurseryWithdrawals from './NurseryWithdrawalsTabContent';
import { requestPlantingSitesSearchResults } from 'src/redux/features/tracking/trackingThunks';

export default function NurseryPlantingsAndWithdrawals(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const contentRef = useRef(null);
  const dispatch = useAppDispatch();
  const tab = query.get('tab') || strings.PLANTING_PROGRESS;

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
    setActiveTab(tab);
  }, [tab]);

  const refreshPlantings = () => {
    dispatch(requestPlantings(selectedOrganization.id));
    dispatch(requestPlantingSitesSearchResults(selectedOrganization.id));
  };

  return (
    <TfMain>
      <Box sx={{ paddingLeft: theme.spacing(3) }}>
        <Grid container spacing={3} sx={{ marginTop: 0 }}>
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
          <Box ref={contentRef} display='flex' flexDirection='column' flexGrow={1}>
            <Tabs
              activeTab={activeTab}
              onTabChange={onTabChange}
              tabs={[
                {
                  label: strings.PLANTING_PROGRESS,
                  children: <PlantingProgress refreshPlantings={refreshPlantings} />,
                },
                { label: strings.WITHDRAWAL_HISTORY, children: <NurseryWithdrawals /> },
              ]}
            />
          </Box>
        </Grid>
      </Box>
    </TfMain>
  );
}
