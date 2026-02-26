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
            .flatMap((stratumResults) => stratumResults.substrata)
            ?.flatMap((substratumResults) => substratumResults?.monitoringPlots)
            .find((plot) => plot.monitoringPlotId === monitoringPlotId),
    [monitoringPlotId, results?.adHocPlot, results?.isAdHoc, results?.strata]
  );

  const substratum = useMemo(
    () =>
      results?.isAdHoc
        ? undefined
        : results?.strata
            .flatMap((stratumResults) => stratumResults.substrata)
            .find((substratumResults) =>
              substratumResults.monitoringPlots.some((plot) => plot.monitoringPlotId === monitoringPlotId)
            ),
    [monitoringPlotId, results?.isAdHoc, results?.strata]
  );

  const stratum = useMemo(
    () =>
      results?.isAdHoc
        ? undefined
        : results?.strata
            .flatMap((stratumResults) => stratumResults.substrata)
            .find((substratumResults) => substratumResults.substratumId === substratum?.substratumId),
    [results?.isAdHoc, results?.strata, substratum?.substratumId]
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
              {!monitoringPlot?.isAdHoc && (
                <Typography>
                  {strings.STRATUM}: {stratum?.name}
                </Typography>
              )}
              {!monitoringPlot?.isAdHoc && (
                <Typography>
                  {strings.SUBSTRATUM}: {substratum?.name}
                </Typography>
              )}
              <Typography>
                {strings.PLOT_TYPE}:{' '}
                {monitoringPlot?.isAdHoc
                  ? strings.AD_HOC
                  : monitoringPlot?.isPermanent
                    ? strings.PERMANENT
                    : strings.TEMPORARY}
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
    monitoringPlot?.isAdHoc,
    monitoringPlot?.isPermanent,
    monitoringPlot?.monitoringPlotNumber,
    stratum?.name,
    strings.AD_HOC,
    strings.LOCATION,
    strings.PERMANENT,
    strings.PLOT_INFO,
    strings.PLOT_TYPE,
    strings.STRATUM,
    strings.SUBSTRATUM,
    strings.TEMPORARY,
    substratum?.name,
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
