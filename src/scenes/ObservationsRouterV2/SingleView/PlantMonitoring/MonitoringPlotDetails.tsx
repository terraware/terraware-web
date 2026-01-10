import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { Typography, useTheme } from '@mui/material';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

const MonitoringPlotDetails = (): JSX.Element => {
  const theme = useTheme();
  const { strings } = useLocalization();
  const params = useParams<{ observationId: string; stratumName: string; monitoringPlotId: string }>();
  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);
  const stratumName = params.stratumName;

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const plotResults = useMemo(
    () =>
      results?.strata
        ?.flatMap((stratum) => stratum.substrata)
        .flatMap((substratum) => substratum.monitoringPlots)
        .find((plot) => plot.monitoringPlotId === monitoringPlotId),
    [monitoringPlotId, results?.strata]
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
        to: `${APP_PATHS.OBSERVATIONS}`,
      },
    ];

    if (plantingSite && stratumName) {
      crumbsData.push(
        {
          name: plantingSite.name,
          to: `/${observationId}`,
        },
        {
          name: stratumName,
          to: `/stratum/${stratumName}`,
        }
      );
    }

    return crumbsData;
  }, [observationId, plantingSite, stratumName, strings.OBSERVATIONS]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {`Observation ${results?.observationId}`}
    </Typography>
  );

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      Monitoring Plot Observation Placeholder
    </Page>
  );
};

export default MonitoringPlotDetails;
