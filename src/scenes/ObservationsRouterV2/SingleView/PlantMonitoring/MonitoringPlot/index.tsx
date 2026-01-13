import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import useStickyTabs from 'src/utils/useStickyTabs';

import MonitoringPlotObservationDataTab from './MonitoringPlotObservationDataTab';
import MonitoringPlotPhotosTab from './MonitoringPlotPhotosTab';

const MonitoringPlotDetails = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const params = useParams<{ observationId: string; stratumName: string }>();
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (results) {
      void getPlantingSite(results.plantingSiteId);
    }
  }, [getPlantingSite, results]);

  const crumbs: Crumb[] = useMemo(() => {
    const crumbsData: Crumb[] = [
      {
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS,
      },
    ];

    if (!results?.isAdHoc && plantingSite) {
      crumbsData.push({
        name: plantingSite.name,
        to: `/${observationId}`,
      });
      crumbsData.push({
        name: plantingSite.name,
        to: `/stratum/${stratumName}}`,
      });
    }

    return crumbsData;
  }, [observationId, plantingSite, results?.isAdHoc, stratumName, strings.OBSERVATIONS]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {results?.adHocPlot?.monitoringPlotNumber}
    </Typography>
  );

  const tabs = useMemo(() => {
    return [
      {
        id: 'observationData',
        label: strings.OBSERVATION_DATA,
        children: <MonitoringPlotObservationDataTab />,
      },
      {
        id: 'photosAndVideos',
        label: strings.PHOTOS_AND_VIDEOS,
        children: <MonitoringPlotPhotosTab />,
      },
    ];
  }, [strings.OBSERVATION_DATA, strings.PHOTOS_AND_VIDEOS]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'observationData',
    tabs,
    viewIdentifier: 'monitoringPlotObservation',
  });

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      <Box width='100%'>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default MonitoringPlotDetails;
