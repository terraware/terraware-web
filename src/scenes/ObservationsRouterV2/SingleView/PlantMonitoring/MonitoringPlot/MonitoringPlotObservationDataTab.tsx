import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon, IconTooltip } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { getConditionString } from 'src/redux/features/observations/utils';
import ExtraData from 'src/scenes/ObservationsRouter/adhoc/ExtraData';
import ObservationDataNumbers from 'src/scenes/ObservationsRouter/adhoc/ObservationDataNumbers';
import EventLog from 'src/scenes/ObservationsRouter/common/EventLog';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouter/common/UnrecognizedSpeciesPageMessage';
import useObservationExports from 'src/scenes/ObservationsRouterV2/useObservationExports';
import { useOnSaveMergedSpeciesRtk } from 'src/scenes/ObservationsRouterV2/useOnSaveMergedSpeciesRtk';
import { getShortTime } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import SpeciesSurvivalRateChart from '../SpeciesSurvivalRateChart';
import SpeciesTotalPlantsChart from '../SpeciesTotalPlantsChart';
import useObservationSpecies from '../useObservationSpecies';
import EditMonitoringPlotQualitativeDataModal, {
  MonitoringPlotQualitativeFormData,
} from './EditMonitoringPlotQualitativeDataModal';
import MonitoringPlotSpeciesEditableTable from './MonitoringPlotSpeciesEditableTable';

const MonitoringPlotObservationDataTab = () => {
  const { isDesktop } = useDeviceInfo();
  const { strings } = useLocalization();
  const theme = useTheme();
  const params = useParams<{ observationId: string; monitoringPlotId: string }>();
  const observationId = Number(params.observationId);
  const monitoringPlotId = Number(params.monitoringPlotId);

  const [getPlantingSite, plantingSiteResponse] = useLazyGetPlantingSiteQuery();
  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const monitoringPlot = useMemo(
    () =>
      results?.isAdHoc
        ? results?.adHocPlot
        : results?.strata
            .flatMap((stratum) => stratum.substrata)
            ?.flatMap((substratum) => substratum?.monitoringPlots)
            .find((plot) => plot.monitoringPlotId === monitoringPlotId),
    [monitoringPlotId, results?.adHocPlot, results?.isAdHoc, results?.strata]
  );
  const livePlants = useMemo(
    () => getObservationSpeciesLivePlantsCount(monitoringPlot?.species),
    [monitoringPlot?.species]
  );
  const deadPlants = useMemo(
    () => getObservationSpeciesDeadPlantsCount(monitoringPlot?.species),
    [monitoringPlot?.species]
  );

  const monitoringPlotSpecies = useObservationSpecies(monitoringPlot?.species ?? [], monitoringPlot?.unknownSpecies);
  const { downloadObservationResults } = useObservationExports();

  const unrecognizedSpecies = useMemo(() => {
    if (monitoringPlot?.species) {
      const speciesWithNoIds = monitoringPlot.species.filter((plotSpecies) => plotSpecies.speciesId === undefined);
      const combinedNames = Array.from(
        new Set(
          speciesWithNoIds.map((plotSpecies) => plotSpecies.speciesName).filter((s): s is string => s !== undefined)
        )
      ).toSorted();

      return combinedNames;
    } else {
      return [];
    }
  }, [monitoringPlot?.species]);

  const items = [
    {
      label: strings.TOTAL_PLANTS,
      tooltip: results?.isAdHoc ? strings.AD_HOC_PLOT_TOTAL_PLANTS_TOOLTIP : strings.PLOT_TOTAL_PLANTS_TOOLTIP,
      value: monitoringPlot?.totalPlants,
    },
    {
      label: strings.LIVE_PLANTS,
      tooltip: results?.isAdHoc ? strings.AD_HOC_PLOT_LIVE_PLANTS_TOOLTIP : strings.PLOT_LIVE_PLANTS_TOOLTIP,
      value: livePlants,
    },
    {
      label: strings.DEAD_PLANTS,
      tooltip: strings.PLOT_DEAD_PLANTS_TOOLTIP,
      value: deadPlants,
    },
    {
      label: strings.SPECIES,
      tooltip: results?.isAdHoc ? strings.AD_HOC_PLOT_SPECIES_TOOLTIP : strings.PLOT_SPECIES_TOOLTIP,
      value: monitoringPlot?.totalSpecies,
    },
    {
      label: strings.PLANT_DENSITY,
      tooltip: results?.isAdHoc ? strings.AD_HOC_PLOT_PLANT_DENSITY_TOOLTIP : strings.PLOT_PLANT_DENSITY_TOOLTIP,
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

  useEffect(() => {
    if (results) {
      void getPlantingSite(results.plantingSiteId, true);
    }
  }, [getPlantingSite, results]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);

  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();
  const [editQualitativeDataModalOpen, setEditQualitativeDataModalOpen] = useState(false);
  const [showPageMessage, setShowPageMessage] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);

  const initialQualitativeData = useMemo((): MonitoringPlotQualitativeFormData | undefined => {
    if (monitoringPlot) {
      return {
        conditions: monitoringPlot.conditions,
        notes: monitoringPlot.notes,
      };
    } else {
      return undefined;
    }
  }, [monitoringPlot]);

  const onEditQualitativeData = useCallback(() => {
    setEditQualitativeDataModalOpen(true);
  }, []);

  const onSaveMergedSpecies = useOnSaveMergedSpeciesRtk({
    observationId,
    onComplete: () => setShowMatchSpeciesModal(false),
  });

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

  return (
    <Card radius='24px'>
      {editQualitativeDataModalOpen && initialQualitativeData && (
        <EditMonitoringPlotQualitativeDataModal
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
      <ObservationDataNumbers items={items} isCompleted={!!monitoringPlot?.completedTime} />
      <Box display='flex' gap={3} flexDirection={isDesktop ? 'row' : 'column'} flexWrap='wrap'>
        <Box flex={1} minWidth='500px'>
          <Box display='flex' alignContent={'center'}>
            <Typography fontSize={'20px'} fontWeight={600}>
              {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
            </Typography>
            <IconTooltip
              title={
                results?.isAdHoc
                  ? strings.AD_HOC_NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP
                  : strings.ASSIGNED_NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP
              }
            />
          </Box>

          <Box height='245px'>
            <SpeciesTotalPlantsChart
              chartId={'plotSpeciesTotalChart'}
              minHeight='245px'
              species={monitoringPlotSpecies}
            />
          </Box>
        </Box>

        {monitoringPlot?.isPermanent && (
          <Box flex={1} minWidth='500px'>
            <Box display='flex' alignItems={'center'}>
              <Typography fontSize={'20px'} fontWeight={600}>
                {strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION}
              </Typography>
              <IconTooltip title={strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION_TOOLTIP} />
            </Box>
            <Box height='245px'>
              <SpeciesSurvivalRateChart
                chartId={'plotSpeciesSurvivalRate'}
                minHeight='245px'
                species={monitoringPlotSpecies}
                isCompleted={!!monitoringPlot.completedTime}
              />
            </Box>
          </Box>
        )}
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
          onClick={() => void downloadObservationResults(observationId)}
          sx={{ fontWeight: '400 !important' }}
        />
      </Box>
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
        <MonitoringPlotSpeciesEditableTable />
      </Box>
      {monitoringPlot?.monitoringPlotId && (
        <EventLog observationId={observationId} plotId={monitoringPlot?.monitoringPlotId} />
      )}
    </Card>
  );
};
export default MonitoringPlotObservationDataTab;
