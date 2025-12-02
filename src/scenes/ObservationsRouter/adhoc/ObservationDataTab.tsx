import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, IconTooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import isEnabled from 'src/features';
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
import SpeciesTotalPlantsChart from '../common/SpeciesMortalityRateChart';
import SpeciesMortalityRateChart from '../common/SpeciesMortalityRateChart';
import SpeciesSurvivalRateChart from '../common/SpeciesSurvivalRateChart';
import ExtraData from './ExtraData';
import ObservationDataNumbers from './ObservationDataNumbers';

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
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');
  const { plantingSite } = usePlantingSiteData();
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();
  const [editQualitativeDataModalOpen, setEditQualitativeDataModalOpen] = useState(false);
  const [showConfirmationModalOpened, setShowConfirmationModalOpened] = useState(false);
  const [update] = useUpdateCompletedObservationPlotMutation();
  const snackbar = useSnackbar();

  const [record, setRecord] = useForm(monitoringPlot);

  const livePlants = useMemo(() => getObservationSpeciesLivePlantsCount(species), [species]);
  const deadPlants = useMemo(() => getObservationSpeciesDeadPlantsCount(species), [species]);

  const items = [
    {
      label: strings.TOTAL_PLANTS,
      tooltip: strings.PLOT_TOTAL_PLANTS_TOOLTIP,
      value: monitoringPlot?.totalPlants,
    },
    {
      label: strings.LIVE_PLANTS,
      tooltip: strings.PLOT_LIVE_PLANTS_TOOLTIP,
      value: livePlants,
    },
    {
      label: strings.DEAD_PLANTS,
      tooltip: strings.PLOT_DEAD_PLANTS_TOOLTIP,
      value: deadPlants,
    },
    {
      label: strings.SPECIES,
      tooltip: strings.PLOT_SPECIES_TOOLTIP,
      value: monitoringPlot?.totalSpecies,
    },
    {
      label: strings.PLANT_DENSITY,
      tooltip: strings.PLOT_PLANT_DENSITY_TOOLTIP,
      value: monitoringPlot?.plantingDensity,
    },
    ...(monitoringPlot?.survivalRate !== undefined
      ? [
          {
            label: strings.SURVIVAL_RATE,
            tooltip: strings.PLOT_SURVIVAL_RATE_TOOLTIP,
            value: `${monitoringPlot?.survivalRate}%`,
          },
        ]
      : []),
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
        setShowConfirmationModalOpened(false);
      }
    })();
  }, [monitoringPlot, observationId, record, update, snackbar]);

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
        />
      )}
      <ObservationDataNumbers items={items} />
      {species && (
        <Box>
          <Box display='flex' alignContent={'center'}>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
            </Typography>
            <IconTooltip title={strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP} />
          </Box>

          <Box height='360px'>
            <SpeciesTotalPlantsChart minHeight='360px' species={species} />
          </Box>
        </Box>
      )}

      {monitoringPlot?.isPermanent &&
        (isSurvivalRateCalculationEnabled ? (
          <Box>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.SURVIVAL_RATE_PER_SPECIES}
            </Typography>
            <Box height='360px'>
              <SpeciesSurvivalRateChart minHeight='360px' species={species} />
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.MORTALITY_RATE_PER_SPECIES}
            </Typography>

            <Box height='360px'>
              <SpeciesMortalityRateChart minHeight='360px' species={species} />
            </Box>
          </Box>
        ))}
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

export default ObservationDataTab;
