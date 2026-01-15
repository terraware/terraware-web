import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon, IconTooltip } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import {
  ObservationPlotUpdateOperationPayload,
  UpdateCompletedObservationPlotApiArg,
  useUpdateCompletedObservationPlotMutation,
} from 'src/queries/generated/observations';
import { getConditionString } from 'src/redux/features/observations/utils';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload, ObservationSpeciesResults } from 'src/types/Observations';
import { getShortTime } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlotActions from '../biomass/PlotActions';
import EditQualitativeDataConfirmationModal from '../common/EditQualitativeDataConfirmationModal';
import EditQualitativeDataModal from '../common/EditQualitativeDataModal';
import EventLog from '../common/EventLog';
import SpeciesSurvivalRateChart from '../common/SpeciesSurvivalRateChart';
import SpeciesTotalPlantsChart from '../common/SpeciesTotalPlantsChart';
import ExtraData from './ExtraData';
import ObservationDataNumbers from './ObservationDataNumbers';
import SpeciesEditableTable from './SpeciesEditableTable';

type ObservationDataTabProps = {
  monitoringPlot: Partial<Omit<ObservationMonitoringPlotResultsPayload, 'species'>>;
  observationId: number;
  species?: ObservationSpeciesResults[];
  type?: string;
  unrecognizedSpecies?: string[];
  onExportData?: () => void;
  onMatchSpecies?: () => void;
};

const ObservationDataTab = ({
  monitoringPlot,
  species,
  type,
  unrecognizedSpecies,
  onExportData,
  onMatchSpecies,
  observationId,
}: ObservationDataTabProps) => {
  const { plantingSite, reload } = usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();
  const [editQualitativeDataModalOpen, setEditQualitativeDataModalOpen] = useState(false);
  const [showConfirmationModalOpened, setShowConfirmationModalOpened] = useState(false);
  const [update] = useUpdateCompletedObservationPlotMutation();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const { isDesktop } = useDeviceInfo();

  const [record, setRecord] = useForm(monitoringPlot);

  const livePlants = useMemo(() => getObservationSpeciesLivePlantsCount(species), [species]);
  const deadPlants = useMemo(() => getObservationSpeciesDeadPlantsCount(species), [species]);

  const items = [
    {
      label: strings.TOTAL_PLANTS,
      tooltip: type === 'adHoc' ? strings.AD_HOC_PLOT_TOTAL_PLANTS_TOOLTIP : strings.PLOT_TOTAL_PLANTS_TOOLTIP,
      value: monitoringPlot?.totalPlants,
    },
    {
      label: strings.LIVE_PLANTS,
      tooltip: type === 'adHoc' ? strings.AD_HOC_PLOT_LIVE_PLANTS_TOOLTIP : strings.PLOT_LIVE_PLANTS_TOOLTIP,
      value: livePlants,
    },
    {
      label: strings.DEAD_PLANTS,
      tooltip: strings.PLOT_DEAD_PLANTS_TOOLTIP,
      value: deadPlants,
    },
    {
      label: strings.SPECIES,
      tooltip: type === 'adHoc' ? strings.AD_HOC_PLOT_SPECIES_TOOLTIP : strings.PLOT_SPECIES_TOOLTIP,
      value: monitoringPlot?.totalSpecies,
    },
    {
      label: strings.PLANT_DENSITY,
      tooltip: type === 'adHoc' ? strings.AD_HOC_PLOT_PLANT_DENSITY_TOOLTIP : strings.PLOT_PLANT_DENSITY_TOOLTIP,
      value: monitoringPlot?.plantingDensity,
    },
    {
      label: strings.SURVIVAL_RATE,
      tooltip: strings.PLOT_SURVIVAL_RATE_TOOLTIP,
      value: monitoringPlot?.isPermanent
        ? `${monitoringPlot.survivalRate ?? '-'}%`
        : strings.NOT_CALCULATED_FOR_TEMPORARY_PLOTS,
    },
  ];

  const onEditQualitativeData = useCallback(() => {
    setEditQualitativeDataModalOpen(true);
  }, []);

  const extraItems = [
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
    setRecord(monitoringPlot);
  }, [monitoringPlot, setRecord]);

  const showConfirmationModal = useCallback(() => {
    setEditQualitativeDataModalOpen(false);
    setShowConfirmationModalOpened(true);
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setShowConfirmationModalOpened(false);
    setRecord(monitoringPlot);
  }, [monitoringPlot, setRecord]);

  const saveEditedData = useCallback(() => {
    void (async () => {
      if (monitoringPlot.monitoringPlotId) {
        const updatePayload: UpdateCompletedObservationPlotApiArg = {
          observationId,
          plotId: monitoringPlot.monitoringPlotId,
          updateObservationRequestPayload: {
            updates: [
              {
                type: 'ObservationPlot',
                conditions: record.conditions,
                notes: record.notes,
              } as ObservationPlotUpdateOperationPayload,
            ],
          },
        };

        const result = await update(updatePayload);

        if ('error' in result) {
          snackbar.toastError();
          return;
        }
        reload();
        setShowConfirmationModalOpened(false);
      }
    })();
  }, [monitoringPlot, observationId, record, update, snackbar, reload]);

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
      <ObservationDataNumbers items={items} isCompleted={!!monitoringPlot.completedTime} />
      <Box display='flex' gap={3} flexDirection={isDesktop ? 'row' : 'column'} flexWrap='wrap'>
        {species && (
          <Box flex={1} minWidth='500px'>
            <Box display='flex' alignContent={'center'}>
              <Typography fontSize={'20px'} fontWeight={600}>
                {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
              </Typography>
              <IconTooltip
                title={
                  type === 'adHoc'
                    ? strings.AD_HOC_NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP
                    : strings.ASSIGNED_NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP
                }
              />
            </Box>

            <Box height='245px'>
              <SpeciesTotalPlantsChart
                minHeight='245px'
                species={species}
                isNotCompleted={!monitoringPlot.completedTime}
              />
            </Box>
          </Box>
        )}

        <Box flex={1} minWidth='500px'>
          <Box display='flex' alignItems={'center'}>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION}
            </Typography>
            <IconTooltip title={strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION_TOOLTIP} />
          </Box>
          <Box height='245px'>
            <SpeciesSurvivalRateChart
              minHeight='245px'
              species={species}
              isNotCompleted={!monitoringPlot.completedTime}
              isTemporary={!monitoringPlot.isPermanent}
            />
          </Box>
        </Box>
      </Box>
      {type === 'adHoc' && onExportData && onMatchSpecies && (
        <PlotActions
          unrecognizedSpecies={unrecognizedSpecies}
          onExportData={onExportData}
          onMatchSpecies={onMatchSpecies}
        />
      )}
      <Box paddingY={2} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        {monitoringPlot?.claimedByName && monitoringPlot?.completedTime && (
          <Typography fontSize={'14px'}>
            {strings.formatString(
              strings.OBSERVED_BY_ON,
              monitoringPlot.claimedByName,
              getDateDisplayValue(monitoringPlot.completedTime, plantingSite?.timeZone),
              getShortTime(
                monitoringPlot.completedTime,
                activeLocale,
                plantingSite?.timeZone || defaultTimeZone.get().id
              )
            )}
          </Typography>
        )}
        {monitoringPlot && !!monitoringPlot.completedTime && (
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
        <Box display='flex' alignItems={'self-start'} paddingTop={3}>
          <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} size='medium' />
          <Box>
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingLeft={1}>
              {strings.SPECIES_TABLE_INSTRUCTIONS}
            </Typography>
            <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' paddingLeft={1}>
              {strings.SPECIES_TABLE_INSTRUCTIONS_NOTE}
            </Typography>
          </Box>
        </Box>
        <SpeciesEditableTable
          species={species}
          observationId={Number(observationId)}
          plotId={Number(monitoringPlot?.monitoringPlotId)}
          isCompleted={!!monitoringPlot.completedTime}
          type={type}
          unknownSpecies={monitoringPlot.unknownSpecies}
        />
      </Box>
      {monitoringPlot.monitoringPlotId && (
        <EventLog observationId={observationId} plotId={monitoringPlot.monitoringPlotId} />
      )}
    </Card>
  );
};

export default ObservationDataTab;
