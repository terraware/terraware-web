import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';
import sanitize from 'sanitize-filename';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { selectAdHocObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import { getConditionString } from 'src/redux/features/observations/utils';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import ObservationsService from 'src/services/ObservationsService';
import strings from 'src/strings';
import { getDateTimeDisplayValue, getShortTime } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import LiveTreesPerSpecies from './LiveTreesPerSpecies';
import QuadratSpeciesTable from './QuadratSepciesTable';
import TreesAndShrubsTable from './TreesAndShrubsTable';
import MonitoringPlotPhotos from './plot/MonitoringPlotPhotos';

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
      { label: strings.TYPE_OF_FOREST, value: biomassMeasurements?.forestType },
      {
        label: strings.NUMBER_OF_SMALL_TREES,
        value:
          biomassMeasurements?.smallTreeCountLow || biomassMeasurements?.smallTreeCountHigh
            ? `${biomassMeasurements?.smallTreeCountLow}-${biomassMeasurements?.smallTreeCountHigh}`
            : '0',
      },
      {
        label: '',
        value: undefined,
      },
      { label: strings.WATER_DEPTH_M, value: biomassMeasurements?.waterDepth || '- -' },
      { label: strings.SALINITY_PPT, value: biomassMeasurements?.salinity || '- -' },
      { label: strings.PH, value: biomassMeasurements?.ph || '- -' },
      { label: strings.TIDE, value: biomassMeasurements?.tide || '- -' },
      {
        label: strings.MEASUREMENT_TIME,
        value: biomassMeasurements?.tideTime
          ? getDateTimeDisplayValue(new Date(biomassMeasurements?.tideTime).getTime())
          : '- -',
      },
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
        value: biomassMeasurements?.treeSpeciesCount,
      },
      { label: strings.OBSERVER, value: monitoringPlot?.claimedByName },
      {
        label: strings.PLOT_CONDITIONS,
        value: monitoringPlot?.conditions.map((condition) => getConditionString(condition)).join(', ') || '- -',
      },
      { label: strings.FIELD_NOTES, value: monitoringPlot?.notes || '- -' },
      {
        label: '',
        value: undefined,
      },
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
        name: strings.BIOMASS_MONITORING,
        to: `${APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString())}&tab=biomassMeasurements`,
      });
    }

    return data;
  }, [activeLocale, plantingSiteId, observationId]);
  const southwestCornerPhoto = monitoringPlot?.photos
    .filter((photo) => photo.type === 'Plot' && photo.position === 'SouthwestCorner')
    .at(0);

  const allPlotPhotos = monitoringPlot?.photos.filter((photo) => photo.type === 'Plot' && photo.position === undefined);

  const positionPhotosExceptSW = monitoringPlot?.photos.filter(
    (photo) => photo.type === 'Plot' && photo.position !== undefined && photo.position !== 'SouthwestCorner'
  );

  const downloadCsv = async (
    fileNameSuffix: string,
    fetchContent: (observationId: number) => Promise<string | null>
  ) => {
    if (observation) {
      const content = await fetchContent(observation.observationId);

      if (content != null && plantingSite != null) {
        const fileName = sanitize(`${plantingSite.name}-${observation?.startDate}-${fileNameSuffix}.csv`);

        const encodedUri = `data:text/csv;charset=utf-8,` + encodeURIComponent(content);

        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', fileName);
        link.click();
      }
    }
  };

  const exportDetailsCsv = useCallback(async () => {
    await downloadCsv(strings.BIOMASS_MEASUREMENTS, ObservationsService.exportBiomassDetailsCsv);
  }, [observation]);

  const exportSpeciesCsv = useCallback(async () => {
    await downloadCsv(strings.SPECIES, ObservationsService.exportBiomassSpeciesCsv);
  }, [observation]);

  const exportTreesShrubsCsv = useCallback(async () => {
    await downloadCsv(strings.TREES_AND_SHRUBS, ObservationsService.exportBiomassTreesShrubsCsv);
  }, [observation]);

  return (
    <Page
      crumbs={crumbs}
      title={title}
      titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}
      rightComponent={
        <OptionsMenu
          optionItems={[
            {
              label: strings.EXPORT_BIOMASS_MONITORING_DETAILS_CSV,
              value: 'exportDetails',
              onClick: exportDetailsCsv,
            },
            {
              label: strings.EXPORT_SPECIES_CSV,
              value: 'exportSpecies',
              onClick: exportSpeciesCsv,
            },
            {
              label: strings.EXPORT_TREES_AND_SHRUBS_CSV,
              value: 'exportTreesAndShrubs',
              onClick: exportTreesShrubsCsv,
            },
          ]}
        />
      }
    >
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
              <Grid container spacing={2} marginTop={2}>
                <Grid item xs={12}>
                  <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    {strings.PHOTOS}
                  </Typography>
                  <MonitoringPlotPhotos
                    observationId={Number(observationId)}
                    monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
                    photos={[
                      ...(southwestCornerPhoto ? [southwestCornerPhoto] : []),
                      ...(positionPhotosExceptSW || []),
                    ]}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Grid item xs={12}>
                    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                      {strings.PLOT_PHOTO}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} display={'flex'}>
                    <Grid item xs={6}>
                      <MonitoringPlotPhotos
                        observationId={Number(observationId)}
                        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
                        photos={[...(southwestCornerPhoto ? [southwestCornerPhoto] : []), ...(allPlotPhotos || [])]}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography
                        fontSize='14px'
                        lineHeight='28px'
                        fontWeight={400}
                        color={theme.palette.TwClrTxtSecondary}
                      >
                        {strings.PLOT_DESCRIPTION}
                      </Typography>
                      <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
                        {biomassMeasurements?.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    {strings.SOIL_PHOTO}
                  </Typography>
                  <Grid item xs={12} display={'flex'}>
                    <Grid item xs={6}>
                      <MonitoringPlotPhotos
                        observationId={Number(observationId)}
                        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
                        photos={monitoringPlot?.photos.filter((photo) => photo.type === 'Soil')}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontSize='14px' lineHeight='28px' fontWeight={400} color={theme.palette.TwClrTxt}>
                        {strings.DESCRIPTION_NOTES}
                      </Typography>
                      <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
                        {biomassMeasurements?.soilAssessment}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    {strings.PHOTO_NORTHWEST_QUADRAT}
                  </Typography>
                  <Grid item xs={12} display={'flex'}>
                    <Grid item xs={6}>
                      <MonitoringPlotPhotos
                        observationId={Number(observationId)}
                        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
                        photos={monitoringPlot?.photos
                          .filter((photo) => photo.type === 'Quadrat' && photo.position === 'NorthwestCorner')
                          .filter((pic, index) => index === 0)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontSize='14px' lineHeight='28px' fontWeight={400} color={theme.palette.TwClrTxt}>
                        {strings.DESCRIPTION_NOTES}
                      </Typography>
                      <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
                        {biomassMeasurements?.quadrats.find((quad) => quad.position === 'NorthwestCorner')?.description}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <QuadratSpeciesTable
                      species={
                        biomassMeasurements?.quadrats.find((quad) => quad.position === 'NorthwestCorner')?.species
                      }
                      quadrat='NorthwestCorner'
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    {strings.PHOTO_NORTHEAST_QUADRAT}
                  </Typography>
                  <Grid item xs={12} display={'flex'}>
                    <Grid item xs={6}>
                      <MonitoringPlotPhotos
                        observationId={Number(observationId)}
                        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
                        photos={monitoringPlot?.photos
                          .filter((photo) => photo.type === 'Quadrat' && photo.position === 'NortheastCorner')
                          .filter((pic, index) => index === 0)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontSize='14px' lineHeight='28px' fontWeight={400} color={theme.palette.TwClrTxt}>
                        {strings.DESCRIPTION_NOTES}
                      </Typography>
                      <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
                        {biomassMeasurements?.quadrats.find((quad) => quad.position === 'NortheastCorner')?.description}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <QuadratSpeciesTable
                      species={
                        biomassMeasurements?.quadrats.find((quad) => quad.position === 'NortheastCorner')?.species
                      }
                      quadrat='NortheastCorner'
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    {strings.PHOTO_SOUTHWEST_QUADRAT}
                  </Typography>
                  <Grid item xs={12} display={'flex'}>
                    <Grid item xs={6}>
                      <MonitoringPlotPhotos
                        observationId={Number(observationId)}
                        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
                        photos={monitoringPlot?.photos
                          .filter((photo) => photo.type === 'Quadrat' && photo.position === 'SouthwestCorner')
                          .filter((pic, index) => index === 0)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontSize='14px' lineHeight='28px' fontWeight={400} color={theme.palette.TwClrTxt}>
                        {strings.DESCRIPTION_NOTES}
                      </Typography>
                      <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
                        {biomassMeasurements?.quadrats.find((quad) => quad.position === 'SouthwestCorner')?.description}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <QuadratSpeciesTable
                      species={
                        biomassMeasurements?.quadrats.find((quad) => quad.position === 'SouthwestCorner')?.species
                      }
                      quadrat='SouthwestCorner'
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                    {strings.PHOTO_SOUTHEAST_QUADRAT}
                  </Typography>
                  <Grid item xs={12} display={'flex'}>
                    <Grid item xs={6}>
                      <MonitoringPlotPhotos
                        observationId={Number(observationId)}
                        monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
                        photos={monitoringPlot?.photos
                          .filter((photo) => photo.type === 'Quadrat' && photo.position === 'SoutheastCorner')
                          .filter((pic, index) => index === 0)}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography fontSize='14px' lineHeight='28px' fontWeight={400} color={theme.palette.TwClrTxt}>
                        {strings.DESCRIPTION_NOTES}
                      </Typography>
                      <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
                        {biomassMeasurements?.quadrats.find((quad) => quad.position === 'SoutheastCorner')?.description}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <QuadratSpeciesTable
                      species={
                        biomassMeasurements?.quadrats.find((quad) => quad.position === 'SoutheastCorner')?.species
                      }
                      quadrat='SoutheastCorner'
                    />
                  </Grid>
                </Grid>
                {biomassMeasurements?.additionalSpecies && biomassMeasurements?.additionalSpecies.length > 0 && (
                  <Grid item xs={6}>
                    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
                      {strings.ADDITIONAL_INVASIVE_THREATENED_SPECIES}
                    </Typography>
                    <QuadratSpeciesTable species={biomassMeasurements?.additionalSpecies} />
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Typography
              fontSize='20px'
              lineHeight='28px'
              fontWeight={600}
              color={theme.palette.TwClrTxt}
              paddingBottom={2}
              paddingTop={3}
            >
              {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
            </Typography>
            <Box height='360px'>
              <LiveTreesPerSpecies trees={biomassMeasurements?.trees} />
            </Box>
            <Typography
              fontSize='20px'
              lineHeight='28px'
              fontWeight={600}
              color={theme.palette.TwClrTxt}
              paddingBottom={2}
              paddingTop={3}
            >
              {strings.TREES_AND_SHRUBS}
            </Typography>
            <TreesAndShrubsTable trees={biomassMeasurements?.trees} />
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
}
