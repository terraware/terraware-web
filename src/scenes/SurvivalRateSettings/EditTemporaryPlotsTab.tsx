import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { Checkbox, Icon, PageForm, Tooltip } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import {
  UpdatePlantingSiteApiArg,
  useGetPlantingSiteQuery,
  useUpdatePlantingSiteMutation,
} from 'src/queries/generated/plantingSites';
import { useAssignT0TempSiteDataMutation } from 'src/queries/generated/t0';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { AssignSiteT0TempData, SpeciesPlot, StratumT0Data } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import SpeciesDensityWarningMessage from './SpeciesDensityWarningMessage';
import StratumT0EditBox from './StratumT0EditBox';

type EditTemporaryPlotsTabProps = {
  plantingSiteId: number;
  temporaryPlotsWithObservations?: PlotsWithObservationsSearchResult[];
  withdrawnSpeciesPlots?: SpeciesPlot[];
  zones?: StratumT0Data[];
  alreadyIncluding?: boolean;
};

const EditTemporaryPlotsTab = ({
  plantingSiteId,
  temporaryPlotsWithObservations,
  withdrawnSpeciesPlots,
  zones,
  alreadyIncluding,
}: EditTemporaryPlotsTabProps) => {
  const [isTemporaryPlotsChecked, setIsTemporaryPlotsChecked] = useState(false);
  const [showSpeciesDensityWarningMessage, setShowSpeciesDensityWarningMessage] = useState(false);
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [updatePlantingSite] = useUpdatePlantingSiteMutation();
  const [updateT0, updateT0Result] = useAssignT0TempSiteDataMutation();
  const { data: plantingSiteData } = useGetPlantingSiteQuery(plantingSiteId);
  const plantingSite = useMemo(() => plantingSiteData?.site, [plantingSiteData]);

  const [record, setRecord] = useForm<AssignSiteT0TempData>({
    plantingSiteId,
    strata: zones ?? [],
  });

  useEffect(() => {
    if (alreadyIncluding) {
      setIsTemporaryPlotsChecked(true);
    }
  }, [alreadyIncluding]);

  useEffect(() => {
    if (zones) {
      setRecord({ plantingSiteId, strata: zones });
    }
  }, [plantingSiteId, setRecord, zones]);

  const goToViewSettings = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()));
  }, [navigate, plantingSiteId]);

  const updatePlantingSiteSetting = useCallback(() => {
    if (alreadyIncluding !== isTemporaryPlotsChecked) {
      const payload: UpdatePlantingSiteApiArg = {
        id: plantingSiteId,
        updatePlantingSiteRequestPayload: {
          ...plantingSite,
          name: plantingSite?.name || '',
          survivalRateIncludesTempPlots: isTemporaryPlotsChecked,
        },
      };
      void updatePlantingSite(payload);
    }
  }, [alreadyIncluding, isTemporaryPlotsChecked, plantingSite, plantingSiteId, updatePlantingSite]);

  const zonesWithObservations = useMemo(() => {
    if (!temporaryPlotsWithObservations) {
      return {};
    }
    return temporaryPlotsWithObservations.reduce(
      (acc, plot) => {
        const zoneId = plot.substratum_stratum_id;
        if (!zoneId) {
          return acc;
        }
        if (!acc[zoneId]) {
          acc[zoneId] = [];
        }
        acc[zoneId].push(plot);
        return acc;
      },
      {} as Record<string, PlotsWithObservationsSearchResult[]>
    );
  }, [temporaryPlotsWithObservations]);

  const saveSettings = useCallback(() => {
    if (Object.entries(zonesWithObservations).length === 0) {
      goToViewSettings();
      return;
    }
    let shouldShowWarning = false;

    Object.entries(zonesWithObservations).forEach(([zoneId, plots]) => {
      const plotIds = plots.map((plot) => plot.id.toString());
      const withdrawnSpeciesOfZone = withdrawnSpeciesPlots?.filter((wsp) =>
        plotIds.includes(wsp.monitoringPlotId.toString())
      );

      const speciesMap = new Map<number, { density?: number; speciesId: number }>();
      withdrawnSpeciesOfZone?.forEach((plot) => {
        plot.species.forEach((wdSpecies) => {
          if (!speciesMap.has(wdSpecies.speciesId)) {
            speciesMap.set(wdSpecies.speciesId, wdSpecies);
          }
        });
      });
      const allWithdrawnSpeciesForZone = Array.from(speciesMap.values());

      allWithdrawnSpeciesForZone.forEach((spec) => {
        const correspondingZone = (record.strata || []).find((z) => z.stratumId.toString() === zoneId.toString());
        const correspondingSpecies = correspondingZone?.densityData.find(
          (denData) => denData.speciesId.toString() === spec.speciesId.toString()
        );
        if (!correspondingSpecies) {
          shouldShowWarning = true;
        }
      });
    });

    (record.strata || []).forEach((zone) => {
      zone.densityData.forEach((denData) => {
        if (denData.density === undefined || denData.density === null) {
          shouldShowWarning = true;
        }
      });
    });

    if (isTemporaryPlotsChecked && shouldShowWarning) {
      setShowSpeciesDensityWarningMessage(true);
      return;
    }

    updatePlantingSiteSetting();
    if (record.strata && record.strata.length > 0) {
      void updateT0(record);
    } else {
      goToViewSettings();
    }
  }, [
    updateT0,
    goToViewSettings,
    isTemporaryPlotsChecked,
    record,
    updatePlantingSiteSetting,
    withdrawnSpeciesPlots,
    zonesWithObservations,
  ]);

  const onChangeTemporaryPlotsCheck = useCallback(
    (value: boolean) => {
      setIsTemporaryPlotsChecked(value);
    },
    [setIsTemporaryPlotsChecked]
  );

  useEffect(() => {
    if (updateT0Result.isSuccess) {
      goToViewSettings();
    }
    if (updateT0Result.isError) {
      snackbar.toastError();
    }
  }, [goToViewSettings, updateT0Result, snackbar]);

  const cancelWarningHandler = useCallback(() => {
    setShowSpeciesDensityWarningMessage(false);
  }, []);

  const saveWithDefaultDensity = useCallback(() => {
    updatePlantingSiteSetting();
    if (record.strata && record.strata.length > 0) {
      void updateT0(record);
    } else {
      goToViewSettings();
    }
  }, [updateT0, goToViewSettings, record, updatePlantingSiteSetting]);

  if (Object.entries(zonesWithObservations).length === 0) {
    return <Box padding={theme.spacing(2)}>{strings.NO_TEMPORARY_PLOTS_WITHIN_ZONES}</Box>;
  }

  return (
    <PageForm
      cancelID='cancelSettings'
      saveID='saveSettings'
      onCancel={goToViewSettings}
      onSave={saveSettings}
      saveButtonText={strings.SAVE}
      cancelButtonText={strings.CANCEL}
      desktopOffset={'266px'}
    >
      {showSpeciesDensityWarningMessage && (
        <SpeciesDensityWarningMessage onClose={cancelWarningHandler} onSave={saveWithDefaultDensity} type='temporary' />
      )}
      <Box
        paddingTop={1.5}
        sx={{
          '& .MuiFormControlLabel-label': {
            fontWeight: 500,
          },
        }}
      >
        <Box display={'flex'} alignItems={'center'}>
          <Checkbox
            id={'temporaryPlotsCheck'}
            name={'temporaryPlotsCheck'}
            label={strings.USE_TEMPORARY_PLOTS_IN_SURVIVAL_RATE}
            value={isTemporaryPlotsChecked}
            onChange={onChangeTemporaryPlotsCheck}
          />
          <Box marginTop={1} paddingLeft={1}>
            <Tooltip title={strings.USE_TEMPORARY_PLOTS_IN_SURVIVAL_RATE_TOOLTIP}>
              <Box display='flex'>
                <Icon fillColor={theme.palette.TwClrIcnInfo} name='info' size='small' />
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {isTemporaryPlotsChecked &&
          Object.entries(zonesWithObservations).map(([zoneId, plots]) => {
            const plotIds = plots.map((plot) => plot.id.toString());
            const filteredWithdrawnSpecies = withdrawnSpeciesPlots?.filter((wsp) =>
              plotIds.includes(wsp.monitoringPlotId.toString())
            );
            return (
              <StratumT0EditBox
                key={zoneId}
                plotsWithObservations={plots}
                withdrawnSpeciesPlot={filteredWithdrawnSpecies}
                zoneData={zones?.find((z) => z.stratumId.toString() === zoneId.toString())}
                record={record}
                setRecord={setRecord}
              />
            );
          })}
      </Box>
    </PageForm>
  );
};

export default EditTemporaryPlotsTab;
