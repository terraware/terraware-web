import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { selectAdHocObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { getShortTime } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

export default function BiomassMeasurementsDetails(): JSX.Element {
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const allAdHocObservationsResults = useAppSelector(selectAdHocObservationsResults);
  const defaultTimeZone = useDefaultTimeZone();
  const { isMobile } = useDeviceInfo();

  const observation = allAdHocObservationsResults?.find(
    (obsResult) => obsResult?.observationId.toString() === observationId?.toString()
  );

  const monitoringPlot = observation?.adHocPlot;
  const biomassMeasurements = observation?.biomassMeasurements;

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;

  const gridSize = isMobile ? 12 : 4;

  const data: Record<string, any>[] = useMemo(() => {
    return [
      { label: strings.DATE, value: getDateDisplayValue(monitoringPlot?.completedTime || '', timeZone) },
      {
        label: strings.TIME,
        value: monitoringPlot?.completedTime
          ? getShortTime(
              monitoringPlot?.completedTime,
              activeLocale,
              plantingSite?.timeZone || defaultTimeZone.get().id
            )
          : undefined,
      },
      { label: strings.ELEVATION, value: 106.1 },
      { label: strings.TYPE_OF_FOREST, value: biomassMeasurements?.forestType },
      {
        label: strings.NUMBER_OF_SMALL_TREES,
        value: `${biomassMeasurements?.smallTreeCountLow}-${biomassMeasurements?.smallTreeCountHigh}`,
      },
      {
        label: '',
        value: undefined,
      },
      { label: strings.WATER_DEPTH_M, value: biomassMeasurements?.waterDepth },
      { label: strings.SALINITY_PPT, value: biomassMeasurements?.salinity },
      { label: strings.PH, value: biomassMeasurements?.ph },
      { label: strings.TIDE, value: biomassMeasurements?.tide },
      { label: strings.MEASUREMENT_TIME, value: '' },
      {
        label: '',
        value: undefined,
      },
      {
        label: strings.TREES_OR_SHRUBS,
        value: biomassMeasurements?.trees.length,
      },
      {
        label: strings.SPECIES,
        value: biomassMeasurements?.species.length,
      },
      { label: strings.OBSERVER, value: monitoringPlot?.claimedByName },
      { label: strings.ADDITIONAL_OBSERVATIONS, value: '' },
      { label: strings.FIELD_NOTES, value: monitoringPlot?.notes },
    ];
  }, [activeLocale, defaultTimeZone, plantingSite]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {observation?.adHocPlot?.monitoringPlotName}
    </Typography>
  );

  const crumbs: Crumb[] = useMemo(() => {
    const data: Crumb[] = [];

    if (plantingSiteId) {
      data.push({
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString()),
      });
      data.push({
        name: strings.BIOMASS_MEASUREMENTS,
        to: `${APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString())}&tab=biomassMeasurements`,
      });
    }

    return data;
  }, [activeLocale, plantingSiteId, observationId]);

  return (
    <Page crumbs={crumbs} title={title}>
      <Grid container>
        <Grid item xs={12}>
          <Card flushMobile>
            <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
              {strings.DETAILS}
            </Typography>
            <Grid container>
              {data.map((datum, index) => (
                <Grid key={index} item xs={gridSize} marginTop={2}>
                  <Textfield
                    id={`plot-observation-${index}`}
                    label={datum.label}
                    value={datum.value}
                    type={datum.text ? 'textarea' : 'text'}
                    preserveNewlines={true}
                    display={true}
                  />
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
}
