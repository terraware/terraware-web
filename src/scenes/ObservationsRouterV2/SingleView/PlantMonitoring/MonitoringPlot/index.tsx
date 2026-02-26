import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Tabs, Tooltip } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
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
  const params = useParams<{ observationId: string; stratumName: string; monitoringPlotId: string }>();
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;
  const monitoringPlotId = Number(params.monitoringPlotId);
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);
  const monitoringPlot = useMemo(
    () =>
      results?.isAdHoc
        ? results?.adHocPlot
        : results?.strata
            .flatMap((stratum) => stratum.substrata)
            ?.flatMap((substratum) => substratum?.monitoringPlots)
            .find((plot) => plot.monitoringPlotId === monitoringPlotId),
    [monitoringPlotId, results?.adHocPlot, results?.isAdHoc, results?.strata]
  );

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

    if (!results?.isAdHoc && plantingSite && stratumName) {
      crumbsData.push({
        name: plantingSite.name,
        to: `/${observationId}`,
      });
      crumbsData.push({
        name: stratumName,
        to: `/stratum/${stratumName}`,
      });
    }

    return crumbsData;
  }, [observationId, plantingSite, results?.isAdHoc, stratumName, strings.OBSERVATIONS]);

  const title = useMemo(() => {
    const swCoordinatesLat = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[1];
    const swCoordinatesLng = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[0];
    return (
      <Box display='flex' alignItems={'end'}>
        <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {monitoringPlot?.monitoringPlotNumber}
        </Typography>
        <Tooltip
          placement='bottom'
          title={
            <Box>
              <Typography>
                {strings.PLOT_TYPE}: {strings.AD_HOC}
              </Typography>
              <Typography>
                {strings.LOCATION}: {swCoordinatesLat}, {swCoordinatesLng}
              </Typography>
            </Box>
          }
        >
          <Typography
            fontSize='16px'
            color={theme.palette.TwClrTxtBrand}
            fontWeight={400}
            paddingLeft={theme.spacing(1)}
          >
            {strings.PLOT_INFO}
          </Typography>
        </Tooltip>
      </Box>
    );
  }, [
    monitoringPlot?.boundary?.coordinates,
    monitoringPlot?.monitoringPlotNumber,
    strings.AD_HOC,
    strings.LOCATION,
    strings.PLOT_INFO,
    strings.PLOT_TYPE,
    theme,
  ]);

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
    <Page crumbs={crumbs} title={title}>
      <SurvivalRateMessageV2 selectedPlantingSiteId={results?.plantingSiteId} />
      <Box width='100%'>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default MonitoringPlotDetails;
