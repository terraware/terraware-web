import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

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
import { selectAdHocObservationResults } from 'src/redux/features/observations/observationsSelectors';
import { getConditionString } from 'src/redux/features/observations/utils';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import LiveTreesPerSpecies from 'src/scenes/ObservationsRouter/biomass/LiveTreesPerSpecies';
import QuadratSpeciesTable from 'src/scenes/ObservationsRouter/biomass/QuadratSpeciesTable';
import TreesAndShrubsTable from 'src/scenes/ObservationsRouter/biomass/TreesAndShrubsTable';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import MonitoringPlotPhotos from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotos';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouter/common/UnrecognizedSpeciesPageMessage';
import { useOnSaveMergedSpecies } from 'src/scenes/ObservationsRouter/common/useOnSaveMergedSpecies';
import ObservationsService from 'src/services/ObservationsService';
import strings from 'src/strings';
import { getDateTimeDisplayValue, getShortTime } from 'src/utils/dateFormatter';
import downloadZipFile from 'src/utils/downloadZipFile';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

type BiomassMeasurementDetailsProps = {
  reload: () => void;
};

export default function BiomassMeasurementsDetails(props: BiomassMeasurementDetailsProps): JSX.Element {
  const { reload } = props;
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const allAdHocObservationResults = useAppSelector(selectAdHocObservationResults);
  const defaultTimeZone = useDefaultTimeZone();
  const { isMobile } = useDeviceInfo();

  const [unrecognizedSpecies, setUnrecognizedSpecies] = useState<string[]>([]);
  const [showPageMessage, setShowPageMessage] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);

  const observation = allAdHocObservationResults?.find(
    (obsResult) => obsResult?.observationId.toString() === observationId?.toString()
  );

  const monitoringPlot = observation?.adHocPlot;
  const biomassMeasurements = observation?.biomassMeasurements;

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));
  const timeZone = plantingSite?.timeZone ?? defaultTimeZone.get().id;

  const gridSize = isMobile ? 12 : 4;

  const swCoordinatesLat = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[0];
  const swCoordinatesLong = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[1];

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
      { label: strings.ELEVATION_M, value: monitoringPlot?.elevationMeters || '- -' },
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
        label: strings.PLOT_LOCATION,
        value: `${String(strings.formatString(String(strings.SW_CORNER_LATITUDE), String(swCoordinatesLat)))}\n${String(strings.formatString(String(strings.SW_CORNER_LONGITUDE), String(swCoordinatesLong)))}`,
        text: true,
      },
    ];
  }, [
    activeLocale,
    biomassMeasurements,
    defaultTimeZone,
    monitoringPlot,
    plantingSite?.timeZone,
    swCoordinatesLat,
    swCoordinatesLong,
    timeZone,
  ]);

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {observation?.adHocPlot?.monitoringPlotName}
    </Typography>
  );

  const crumbs: Crumb[] = useMemo(() => {
    const curmbsData: Crumb[] = [];

    if (plantingSiteId) {
      curmbsData.push({
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString()),
      });
      curmbsData.push({
        name: strings.BIOMASS_MONITORING,
        to: `${APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString())}&tab=biomassMeasurements`,
      });
    }

    return curmbsData;
  }, [plantingSiteId]);

  const southwestCornerPhoto = monitoringPlot?.photos
    .filter((photo) => photo.type === 'Plot' && photo.position === 'SouthwestCorner')
    .at(0);

  const allPlotPhotos = monitoringPlot?.photos.filter((photo) => photo.type === 'Plot' && photo.position === undefined);

  const positionPhotosExceptSW = monitoringPlot?.photos.filter(
    (photo) => photo.type === 'Plot' && photo.position !== undefined && photo.position !== 'SouthwestCorner'
  );

  useEffect(() => {
    if (biomassMeasurements) {
      const quadratSpeciesNames = biomassMeasurements.quadrats.flatMap((quadrat) =>
        quadrat.species.map((species) => species.speciesName)
      );
      const treeSpeciesNames = biomassMeasurements.trees.map((tree) => tree.speciesName);
      const additionalSpeciesNames = biomassMeasurements.additionalSpecies.map((species) => species.scientificName);
      const combinedNames = Array.from(
        new Set(
          additionalSpeciesNames
            .concat(quadratSpeciesNames)
            .concat(treeSpeciesNames)
            .filter((s): s is string => s !== undefined)
        )
      ).toSorted();

      setUnrecognizedSpecies(combinedNames);
      setShowPageMessage(combinedNames.length > 0);
    }
  }, [biomassMeasurements, setShowPageMessage, setUnrecognizedSpecies]);

  const downloadCsv = useCallback(
    async (fileNameSuffix: string, fetchContent: (observationId: number) => Promise<string | null>) => {
      if (observation) {
        const content = await fetchContent(observation.observationId);

        if (content !== null && plantingSite) {
          const fileName = sanitize(`${plantingSite.name}-${observation?.startDate}-${fileNameSuffix}.csv`);

          const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);

          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', fileName);
          link.click();
        }
      }
    },
    [observation, plantingSite]
  );

  const exportDetailsCsv = useCallback(async () => {
    await downloadCsv(strings.BIOMASS_MONITORING, ObservationsService.exportBiomassDetailsCsv);
  }, [downloadCsv]);

  const exportSpeciesCsv = useCallback(async () => {
    await downloadCsv(strings.SPECIES, ObservationsService.exportBiomassSpeciesCsv);
  }, [downloadCsv]);

  const exportTreesShrubsCsv = useCallback(async () => {
    await downloadCsv(strings.TREES_AND_SHRUBS, ObservationsService.exportBiomassTreesShrubsCsv);
  }, [downloadCsv]);

  const exportAllCsvs = useCallback(async () => {
    if (observation && plantingSite) {
      await downloadZipFile({
        dirName: sanitize(`${plantingSite.name}-${observation.startDate}`),
        files: [
          {
            fileName: strings.BIOMASS_MONITORING,
            content: () => ObservationsService.exportBiomassDetailsCsv(observation.observationId),
          },
          {
            fileName: strings.SPECIES,
            content: () => ObservationsService.exportBiomassSpeciesCsv(observation.observationId),
          },
          {
            fileName: strings.TREES_AND_SHRUBS,
            content: () => ObservationsService.exportBiomassTreesShrubsCsv(observation.observationId),
          },
        ],
        suffix: '.csv',
      });
    }
  }, [observation, plantingSite]);

  const onSaveMergedSpecies = useOnSaveMergedSpecies({
    observationId,
    reload,
    setShowMatchSpeciesModal,
  });

  return (
    <Page
      crumbs={crumbs}
      title={title}
      titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}
      rightComponent={
        <OptionsMenu
          optionItems={[
            {
              label: strings.EXPORT_ALL_ZIP,
              value: 'exportAll',
              onClick: () => void exportAllCsvs(),
            },
            {
              label: strings.EXPORT_BIOMASS_MONITORING_DETAILS_CSV,
              value: 'exportDetails',
              onClick: () => void exportDetailsCsv(),
            },
            {
              label: strings.EXPORT_SPECIES_CSV,
              value: 'exportSpecies',
              onClick: () => void exportSpeciesCsv(),
            },
            {
              label: strings.EXPORT_TREES_AND_SHRUBS_CSV,
              value: 'exportTreesAndShrubs',
              onClick: () => void exportTreesShrubsCsv(),
            },
            {
              label: strings.MATCH_UNRECOGNIZED_SPECIES,
              value: 'matchUnrecognizedSpecies',
              onClick: () => setShowMatchSpeciesModal(true),
              disabled: unrecognizedSpecies.length === 0,
            },
          ]}
        />
      }
    >
      {showPageMessage && (
        <UnrecognizedSpeciesPageMessage
          setShowMatchSpeciesModal={setShowMatchSpeciesModal}
          setShowPageMessage={setShowPageMessage}
          unrecognizedSpecies={unrecognizedSpecies || []}
        />
      )}
      {showMatchSpeciesModal && (
        <MatchSpeciesModal
          onClose={() => setShowMatchSpeciesModal(false)}
          onSave={onSaveMergedSpecies}
          unrecognizedSpecies={unrecognizedSpecies || []}
        />
      )}
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
