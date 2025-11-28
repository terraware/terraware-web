import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { BiomassMeasurement, ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { getDateTimeDisplayValue, getShortTime } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useForm from 'src/utils/useForm';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ExtraData from '../adhoc/ExtraData';
import ObservationDataNumbers from '../adhoc/ObservationDataNumbers';
import EditQualitativeDataConfirmationModal from '../common/EditQualitativeDataConfirmationModal';
import EditQualitativeDataModal from '../common/EditQualitativeDataModal';
import { BiomassPlot } from '../common/EditQualitativeDataModal';
import LiveTreesPerSpecies from './LiveTreesPerSpecies';
import PlotActions from './PlotActions';

type BiomassObservationDataTabProps = {
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  biomassMeasurement?: BiomassMeasurement;
  plotLocation?: string;
  unrecognizedSpecies?: string[];
  onExportData: () => void;
  onMatchSpecies: () => void;
  observationId: number;
};

const BiomassObservationDataTab = ({
  monitoringPlot,
  biomassMeasurement,
  plotLocation,
  unrecognizedSpecies,
  onExportData,
  onMatchSpecies,
  observationId,
}: BiomassObservationDataTabProps) => {
  const theme = useTheme();
  const { plantingSite } = usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();
  const [editQualitativeDataModalOpen, setEditQualitativeDataModalOpen] = useState(false);
  const [showConfirmationModalOpened, setShowConfirmationModalOpened] = useState(false);

  const createBiomassPlot = useMemo(() => {
    return {
      conditions: monitoringPlot?.conditions,
      notes: monitoringPlot?.notes,
      monitoringPlotId: monitoringPlot?.monitoringPlotId,
      biomassMeasurement,
      media: monitoringPlot?.media,
    };
  }, [biomassMeasurement, monitoringPlot]);
  const [record, setRecord] = useForm<BiomassPlot | Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>>>(
    createBiomassPlot
  );

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
          ? `${biomassMeasurement?.smallTreeCountLow}-${biomassMeasurement?.smallTreeCountHigh}`
          : '0',
    },
    {
      label: strings.HERBACIOUS_COVER_PERCENT,
      value: biomassMeasurement?.herbaceousCoverPercent,
    },
    {
      label: strings.WATER_DEPTH_M,
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

  const closeEditQualitativeDataModal = useCallback(() => {
    setEditQualitativeDataModalOpen(false);
    setRecord(createBiomassPlot);
  }, [createBiomassPlot, setRecord]);

  const showConfirmationModal = useCallback(() => {
    setEditQualitativeDataModalOpen(false);
    setShowConfirmationModalOpened(true);
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setShowConfirmationModalOpened(false);
    setRecord(createBiomassPlot);
  }, [createBiomassPlot, setRecord]);

  const saveEditedData = useCallback(() => {
    // save to backend
  }, []);

  const onEditQualitativeData = useCallback(() => {
    setEditQualitativeDataModalOpen(true);
  }, []);

  return (
    <Card radius='24px'>
      {showConfirmationModalOpened && (
        <EditQualitativeDataConfirmationModal onClose={closeConfirmationModal} onSubmit={saveEditedData} />
      )}
      {editQualitativeDataModalOpen && (
        <EditQualitativeDataModal
          record={record}
          setRecord={setRecord}
          onClose={closeEditQualitativeDataModal}
          onSubmit={showConfirmationModal}
          observationId={observationId}
        />
      )}
      <ObservationDataNumbers items={items} />
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
        <LiveTreesPerSpecies trees={biomassMeasurement?.trees} />
      </Box>
      <PlotActions
        unrecognizedSpecies={unrecognizedSpecies}
        onExportData={onExportData}
        onMatchSpecies={onMatchSpecies}
      />
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
        <Button
          id='edit'
          label={strings.EDIT}
          onClick={onEditQualitativeData}
          icon='iconEdit'
          priority='secondary'
          size='small'
        />
      </Box>
      <ExtraData items={extraItems} />
    </Card>
  );
};

export default BiomassObservationDataTab;
