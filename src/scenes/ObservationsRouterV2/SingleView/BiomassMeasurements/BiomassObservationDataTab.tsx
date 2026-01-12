import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon, Textfield, Tooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { getConditionString } from 'src/redux/features/observations/utils';
import ExtraData from 'src/scenes/ObservationsRouter/adhoc/ExtraData';
import ObservationDataNumbers from 'src/scenes/ObservationsRouter/adhoc/ObservationDataNumbers';
import LiveTreesPerSpecies from 'src/scenes/ObservationsRouter/biomass/LiveTreesPerSpecies';
import EventLog from 'src/scenes/ObservationsRouter/common/EventLog';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import MonitoringPlotPhotosWithActions from 'src/scenes/ObservationsRouter/common/MonitoringPlotPhotosWithActions';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouter/common/UnrecognizedSpeciesPageMessage';
import { useOnSaveMergedSpeciesRtk } from 'src/scenes/ObservationsRouterV2/useOnSaveMergedSpeciesRtk';
import { getDateTimeDisplayValue, getShortTime } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import useObservationExports from '../../useObservationExports';
import EditBiomassQualitativeDataModal, { BiomassQualitativeFormData } from './EditBiomassQualitativeDataModal';
import TreesAndShrubsEditableTable from './TreesAndShrubsEditableTable';

const BiomassObservationDataTab = () => {
  const isEditObservationsEnabled = isEnabled('Edit Observations');

  const { strings } = useLocalization();
  const theme = useTheme();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const [getPlantingSite, plantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const monitoringPlot = useMemo(() => results?.adHocPlot, [results?.adHocPlot]);
  const plotLocation = useMemo(() => {
    const swCoordinatesLat = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[0];
    const swCoordinatesLong = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[1];
    if (swCoordinatesLat && swCoordinatesLong) {
      return `${swCoordinatesLat}, ${swCoordinatesLong}`;
    } else {
      return undefined;
    }
  }, [monitoringPlot?.boundary?.coordinates]);
  const biomassMeasurement = useMemo(() => results?.biomassMeasurements, [results?.biomassMeasurements]);

  useEffect(() => {
    if (results) {
      void getPlantingSite(results.plantingSiteId, true);
    }
  }, [getPlantingSite, results]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);

  const { downloadBiomassObservationDetails } = useObservationExports();

  const unrecognizedSpecies = useMemo(() => {
    if (biomassMeasurement) {
      const quadratSpeciesNames = biomassMeasurement.quadrats.flatMap((quadrat) =>
        quadrat.species.map((species) => species.speciesName)
      );
      const treeSpeciesNames = biomassMeasurement.trees.map((tree) => tree.speciesName);
      const additionalSpeciesNames = biomassMeasurement.additionalSpecies.map((species) => species.scientificName);
      const combinedNames = Array.from(
        new Set(
          additionalSpeciesNames
            .concat(quadratSpeciesNames)
            .concat(treeSpeciesNames)
            .filter((s): s is string => s !== undefined)
        )
      ).toSorted();

      return combinedNames;
    } else {
      return [];
    }
  }, [biomassMeasurement]);

  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();
  const [editQualitativeDataModalOpen, setEditQualitativeDataModalOpen] = useState(false);
  const [showPageMessage, setShowPageMessage] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);

  const soilPhoto = monitoringPlot?.media.find((m) => m.type === 'Soil');
  const items = [
    {
      label: strings.TOTAL_PLANTS,
      tooltip: strings.BIOMASS_PLOT_TOTAL_PLANTS_TOOLTIP,
      value: monitoringPlot?.totalPlants,
    },
    {
      label: strings.LIVE_PLANTS,
      tooltip: strings.BIOMASS_PLOT_LIVE_PLANTS_TOOLTIP,
      value: getObservationSpeciesLivePlantsCount(monitoringPlot?.species),
    },
    {
      label: strings.DEAD_PLANTS,
      tooltip: strings.BIOMASS_PLOT_DEAD_PLANTS_TOOLTIP,
      value: getObservationSpeciesDeadPlantsCount(monitoringPlot?.species),
    },
    {
      label: strings.SPECIES,
      tooltip: strings.BIOMASS_PLOT_SPECIES_TOOLTIP,
      value: monitoringPlot?.totalSpecies,
    },
    {
      label: strings.PLOT_LOCATION,
      tooltip: strings.BIOMASS_PLOT_LOCATION_TOOLTIP,
      value: plotLocation,
    },
  ];

  const extraItems = [
    {
      label: strings.PLOT_DESCRIPTION,
      value: biomassMeasurement?.description,
    },
    {
      label: strings.TYPE_OF_FOREST,
      value: biomassMeasurement?.forestType,
    },
    {
      label: strings.NUMBER_OF_SMALL_TREES,
      value:
        biomassMeasurement?.smallTreeCountLow || biomassMeasurement?.smallTreeCountHigh
          ? biomassMeasurement?.smallTreeCountLow === 1001
            ? '+1000'
            : `${biomassMeasurement?.smallTreeCountLow}-${biomassMeasurement?.smallTreeCountHigh}`
          : '0',
    },
    {
      label: strings.HERBACEOUS_COVER_PERCENT,
      value: biomassMeasurement?.herbaceousCoverPercent,
    },
    {
      label: strings.WATER_DEPTH_CM,
      value: biomassMeasurement?.waterDepth,
    },
    {
      label: strings.SALINITY_PPT,
      value: biomassMeasurement?.salinity,
    },
    {
      label: strings.PH,
      value: biomassMeasurement?.ph,
    },
    {
      label: strings.TIDE,
      value: biomassMeasurement?.tide,
    },
    {
      label: strings.MEASUREMENT_TIME,
      value: biomassMeasurement?.tideTime
        ? getDateTimeDisplayValue(new Date(biomassMeasurement?.tideTime).getTime())
        : '- -',
    },
    {
      label: strings.PLOT_CONDITIONS,
      value: monitoringPlot?.conditions?.map((condition) => getConditionString(condition)).join(', ') || '- -',
    },
    {
      label: strings.FIELD_NOTES,
      value: monitoringPlot?.notes || '- -',
    },
  ];

  const onEditQualitativeData = useCallback(() => {
    setEditQualitativeDataModalOpen(true);
  }, []);

  const initialQualitativeData = useMemo((): BiomassQualitativeFormData | undefined => {
    if (monitoringPlot && biomassMeasurement) {
      return {
        conditions: monitoringPlot.conditions,
        notes: monitoringPlot.notes,
        biomassMeasurement,
      };
    } else {
      return undefined;
    }
  }, [biomassMeasurement, monitoringPlot]);

  const onSaveMergedSpecies = useOnSaveMergedSpeciesRtk({
    observationId,
    onComplete: () => setShowMatchSpeciesModal(false),
  });

  return (
    <Card radius='24px'>
      {editQualitativeDataModalOpen && initialQualitativeData && (
        <EditBiomassQualitativeDataModal
          open={editQualitativeDataModalOpen}
          setOpen={setEditQualitativeDataModalOpen}
          initialFormData={initialQualitativeData}
        />
      )}
      {showPageMessage && (
        <UnrecognizedSpeciesPageMessage
          setShowMatchSpeciesModal={setShowMatchSpeciesModal}
          setShowPageMessage={setShowPageMessage}
          unrecognizedSpecies={unrecognizedSpecies}
        />
      )}
      {showMatchSpeciesModal && (
        <MatchSpeciesModal
          onClose={() => setShowMatchSpeciesModal(false)}
          onSave={onSaveMergedSpecies}
          unrecognizedSpecies={unrecognizedSpecies}
        />
      )}
      <ObservationDataNumbers items={items} isCompleted={!!results?.completedTime} />
      <Box display='flex' sx={{ paddingBottom: 2, paddingTop: 3, alignItems: 'center' }}>
        <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt} paddingRight={1}>
          {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
        </Typography>
        <Tooltip title={strings.BIOMASS_NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP}>
          <Box display='flex'>
            <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} />
          </Box>
        </Tooltip>
      </Box>
      <Box height='300px'>
        <LiveTreesPerSpecies trees={biomassMeasurement?.trees} />
      </Box>
      <Box
        display={'flex'}
        justifyContent={'end'}
        borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
        paddingBottom={1.5}
      >
        <Button
          priority='ghost'
          label={strings.MATCH_UNRECOGNIZED_SPECIES}
          icon='iconSynced'
          onClick={() => setShowMatchSpeciesModal(true)}
          disabled={!unrecognizedSpecies || unrecognizedSpecies.length === 0}
          sx={{ fontWeight: '400 !important' }}
        />
        <Button
          priority='ghost'
          label={strings.EXPORT_DATA}
          icon='iconImport'
          onClick={() => void downloadBiomassObservationDetails(observationId)}
          sx={{ fontWeight: '400 !important' }}
        />
      </Box>
      <Box paddingY={2} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        {monitoringPlot?.claimedByName && monitoringPlot?.completedTime && (
          <Typography fontSize={'14px'}>
            {strings.formatString(
              strings.OBSERVED_BY_ON,
              monitoringPlot?.claimedByName,
              getDateDisplayValue(monitoringPlot?.completedTime, plantingSite?.timeZone),
              getShortTime(
                monitoringPlot?.completedTime,
                activeLocale,
                plantingSite?.timeZone || defaultTimeZone.get().id
              )
            )}
          </Typography>
        )}
        {monitoringPlot && isEditObservationsEnabled && (
          <Button
            id='edit'
            label={strings.EDIT}
            onClick={onEditQualitativeData}
            icon='iconEdit'
            priority='secondary'
            size='small'
          />
        )}
      </Box>
      <ExtraData items={extraItems} />
      <Box paddingTop={2}>
        <Typography fontSize={'20px'} fontWeight={600}>
          {strings.SOIL_ASSESSMENT}
        </Typography>
        <Box display='grid' gap='16px' gridTemplateColumns={'repeat(3,1fr)'} justifyItems={'start'}>
          {soilPhoto && (
            <MonitoringPlotPhotosWithActions
              observationId={Number(observationId)}
              monitoringPlotId={Number(monitoringPlot?.monitoringPlotId)}
              photos={[soilPhoto]}
            />
          )}
          <Box>
            <Textfield
              id='soilDescription'
              label={strings.DESCRIPTION_NOTES}
              value={biomassMeasurement?.soilAssessment}
              preserveNewlines={true}
              type='text'
              display={true}
            />
          </Box>
        </Box>
      </Box>
      <Box paddingTop={2}>
        <Typography fontSize={'20px'} fontWeight={600}>
          {strings.TREES_AND_SHRUBS}
        </Typography>
        {isEditObservationsEnabled && (
          <Box display='flex' alignItems={'center'} paddingTop={3}>
            <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} size='medium' />
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingLeft={1}>
              {strings.TREES_AND_SHRUBS_TABLE_INSTRUCTIONS}
            </Typography>
          </Box>
        )}
        <TreesAndShrubsEditableTable editable={isEditObservationsEnabled} />
        {monitoringPlot?.monitoringPlotId && (
          <EventLog observationId={observationId} plotId={monitoringPlot.monitoringPlotId} isBiomass />
        )}
      </Box>
    </Card>
  );
};

export default BiomassObservationDataTab;
