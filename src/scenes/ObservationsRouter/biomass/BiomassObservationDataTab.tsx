import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon, Textfield, Tooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import {
  BiomassUpdateOperationPayload,
  ObservationPlotUpdateOperationPayload,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { BiomassMeasurement, ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { getDateTimeDisplayValue, getShortTime } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ExtraData from '../adhoc/ExtraData';
import ObservationDataNumbers from '../adhoc/ObservationDataNumbers';
import EditQualitativeDataConfirmationModal from '../common/EditQualitativeDataConfirmationModal';
import EditQualitativeDataModal from '../common/EditQualitativeDataModal';
import { BiomassPlot } from '../common/EditQualitativeDataModal';
import EventLog from '../common/EventLog';
import MonitoringPlotPhotosWithActions from '../common/MonitoringPlotPhotosWithActions';
import LiveTreesPerSpecies from './LiveTreesPerSpecies';
import PlotActions from './PlotActions';
import TreesAndShrubsEditableTable from './TreesAndShrubsEditableTable';

type BiomassObservationDataTabProps = {
  monitoringPlot?: ObservationMonitoringPlotResultsPayload;
  biomassMeasurement?: BiomassMeasurement;
  plotLocation?: string;
  unrecognizedSpecies?: string[];
  onExportData: () => void;
  onMatchSpecies: () => void;
  observationId: number;
  reload: () => void;
  isCompleted: boolean;
};

const BiomassObservationDataTab = ({
  monitoringPlot,
  biomassMeasurement,
  plotLocation,
  unrecognizedSpecies,
  onExportData,
  onMatchSpecies,
  observationId,
  reload,
  isCompleted,
}: BiomassObservationDataTabProps) => {
  const theme = useTheme();
  const { plantingSite } = usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();
  const [editQualitativeDataModalOpen, setEditQualitativeDataModalOpen] = useState(false);
  const [showConfirmationModalOpened, setShowConfirmationModalOpened] = useState(false);
  const [update] = useUpdateCompletedObservationPlotMutation();
  const snackbar = useSnackbar();
  const soilPhoto = monitoringPlot?.media.find((m) => m.type === 'Soil');

  const createBiomassPlot = useMemo(() => {
    return {
      conditions: monitoringPlot?.conditions,
      notes: monitoringPlot?.notes,
      monitoringPlotId: monitoringPlot?.monitoringPlotId || -1,
      biomassMeasurement,
      media: monitoringPlot?.media,
    };
  }, [biomassMeasurement, monitoringPlot]);
  const [record, setRecord] = useForm<Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>> | BiomassPlot>(
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
    void (async () => {
      const biomassRecord = record as BiomassPlot;
      const biomassPayload: BiomassUpdateOperationPayload = {
        type: 'Biomass',
        description: biomassRecord.biomassMeasurement?.description,
        soilAssessment: biomassRecord.biomassMeasurement?.soilAssessment,
        forestType: biomassRecord.biomassMeasurement?.forestType,
        ph: biomassRecord.biomassMeasurement?.ph,
        salinity: biomassRecord.biomassMeasurement?.salinity,
        smallTreeCountHigh: biomassRecord.biomassMeasurement?.smallTreeCountHigh,
        smallTreeCountLow: biomassRecord.biomassMeasurement?.smallTreeCountLow,
        tide: biomassRecord.biomassMeasurement?.tide,
        tideTime: biomassRecord.biomassMeasurement?.tideTime,
        waterDepth: biomassRecord.biomassMeasurement?.waterDepth,
        herbaceousCoverPercent: biomassRecord.biomassMeasurement?.herbaceousCoverPercent,
      };

      const plotPayload: ObservationPlotUpdateOperationPayload = {
        type: 'ObservationPlot',
        conditions: record.conditions,
        notes: record.notes,
      };

      if (monitoringPlot?.monitoringPlotId) {
        const result = await update({
          observationId,
          plotId: monitoringPlot?.monitoringPlotId,
          updateObservationRequestPayload: {
            updates: [biomassPayload, plotPayload],
          },
        });

        if ('error' in result) {
          snackbar.toastError();
          return;
        }
        reload();
        setShowConfirmationModalOpened(false);
      }
    })();
  }, [update, snackbar, record, monitoringPlot, observationId, reload]);

  const onEditQualitativeData = useCallback(() => {
    setEditQualitativeDataModalOpen(true);
  }, []);

  return (
    <Card radius='24px'>
      {showConfirmationModalOpened && (
        <EditQualitativeDataConfirmationModal onClose={closeConfirmationModal} onSubmit={saveEditedData} />
      )}
      {editQualitativeDataModalOpen && monitoringPlot && (
        <EditQualitativeDataModal
          record={record}
          setRecord={setRecord}
          onClose={closeEditQualitativeDataModal}
          onSubmit={showConfirmationModal}
          observationId={observationId}
        />
      )}
      <ObservationDataNumbers items={items} isCompleted={isCompleted} />
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
        {monitoringPlot && (
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
        <Box display='flex' alignItems={'center'} paddingTop={3}>
          <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} size='medium' />
          <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingLeft={1}>
            {strings.TREES_AND_SHRUBS_TABLE_INSTRUCTIONS}
          </Typography>
        </Box>
        <TreesAndShrubsEditableTable
          trees={biomassMeasurement?.trees}
          observationId={Number(observationId)}
          plotId={Number(monitoringPlot?.monitoringPlotId)}
          reload={reload}
        />
        {monitoringPlot?.monitoringPlotId && (
          <EventLog observationId={observationId} plotId={monitoringPlot.monitoringPlotId} isBiomass />
        )}
      </Box>
    </Card>
  );
};

export default BiomassObservationDataTab;
