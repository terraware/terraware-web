import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, useTheme } from '@mui/material';

import { APP_PATHS } from 'src/constants';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useAssignT0SiteDataMutation } from 'src/queries/generated/t0';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { AssignSiteT0Data, PlotT0Data, SpeciesPlot } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { SurvivalRateFormRegistration } from './EditSurvivalRateSettings';
import PlotT0EditBox from './PlotT0EditBox';
import SpeciesDensityWarningMessage from './SpeciesDensityWarningMessage';

const normalizePlots = (plots?: PlotT0Data[]): string =>
  JSON.stringify(
    (plots ?? [])
      .map((plot) => ({
        monitoringPlotId: plot.monitoringPlotId,
        observationId: plot.observationId ?? null,
        densityData: (plot.densityData ?? [])
          .map((d) => ({ speciesId: d.speciesId, density: d.density ?? null, plotDensity: d.plotDensity ?? null }))
          .sort((a, b) => a.speciesId - b.speciesId),
      }))
      .sort((a, b) => a.monitoringPlotId - b.monitoringPlotId)
  );

type EditPermanentPlotsTabProps = {
  plantingSiteId: number;
  plotsWithObservations?: PlotsWithObservationsSearchResult[];
  t0Plots?: PlotT0Data[];
  withdrawnSpeciesPlots?: SpeciesPlot[];
  onRegister: (registration: SurvivalRateFormRegistration) => void;
};

const EditPermanentPlotsTab = ({
  plantingSiteId,
  plotsWithObservations,
  t0Plots,
  withdrawnSpeciesPlots,
  onRegister,
}: EditPermanentPlotsTabProps) => {
  const snackbar = useSnackbar();
  const [showSpeciesDensityWarningMessage, setShowSpeciesDensityWarningMessage] = useState(false);
  const navigate = useSyncNavigate();
  const { reload: reloadPlantingSiteData } = useOrganizationPlantingSites();
  const [updateT0, updateT0Result] = useAssignT0SiteDataMutation();
  const theme = useTheme();

  const [record, setRecord] = useForm<AssignSiteT0Data>({
    plantingSiteId,
    plots: t0Plots ?? [],
  });

  useEffect(() => {
    if (t0Plots) {
      setRecord({ plantingSiteId, plots: t0Plots });
    }
  }, [plantingSiteId, setRecord, t0Plots]);

  const isDirty = useMemo(
    () => normalizePlots(record.plots) !== normalizePlots(t0Plots ?? []),
    [record.plots, t0Plots]
  );

  const goToViewSettings = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS_V2.replace(':plantingSiteId', plantingSiteId.toString()));
  }, [navigate, plantingSiteId]);

  const getFilteredPlots = useCallback(() => {
    return record.plots.filter((plot) => {
      const isPlotInOb =
        withdrawnSpeciesPlots?.find((wp) => wp.monitoringPlotId.toString() === plot.monitoringPlotId.toString()) &&
        plotsWithObservations?.find((pl) => pl.id.toString() === plot.monitoringPlotId.toString());
      return isPlotInOb !== undefined;
    });
  }, [plotsWithObservations, record.plots, withdrawnSpeciesPlots]);

  const saveSettings = useCallback(() => {
    const filteredPlots = getFilteredPlots();
    if (!filteredPlots || filteredPlots.length === 0) {
      goToViewSettings();
      return;
    }
    let shouldShowWarning = false;

    withdrawnSpeciesPlots?.forEach((withdrawnPlot) => {
      const correspondingPlot = record.plots.find(
        (plot) => plot.monitoringPlotId.toString() === withdrawnPlot.monitoringPlotId.toString()
      );
      if (correspondingPlot && !correspondingPlot.observationId) {
        withdrawnPlot.species.forEach((withdrawnSpecies) => {
          const correspondingSpecies = correspondingPlot.densityData.find(
            (denData) => denData.speciesId.toString() === withdrawnSpecies.speciesId.toString()
          );
          if (!correspondingSpecies) {
            shouldShowWarning = true;
          }
        });
      }
    });

    filteredPlots.forEach((plot) => {
      if (!plot.observationId) {
        plot.densityData.forEach((denData) => {
          if (denData.plotDensity === undefined || denData.plotDensity === null) {
            shouldShowWarning = true;
          }
        });
      }
    });

    if (shouldShowWarning) {
      setShowSpeciesDensityWarningMessage(true);
      return;
    }

    const payload = { ...record, plots: filteredPlots };
    void updateT0(payload);
  }, [getFilteredPlots, withdrawnSpeciesPlots, record, updateT0, goToViewSettings]);

  useEffect(() => {
    if (updateT0Result.isSuccess) {
      reloadPlantingSiteData();
      goToViewSettings();
    }
    if (updateT0Result.isError) {
      snackbar.toastError();
    }
  }, [goToViewSettings, updateT0Result, snackbar, reloadPlantingSiteData]);

  useEffect(() => {
    onRegister({ isDirty, saving: updateT0Result.isLoading, save: saveSettings });
  }, [onRegister, isDirty, updateT0Result.isLoading, saveSettings]);

  const cancelWarningHandler = useCallback(() => {
    setShowSpeciesDensityWarningMessage(false);
  }, []);

  const saveWithDefaultDensity = useCallback(() => {
    const filteredPlots = getFilteredPlots();
    const payload = { ...record, plots: filteredPlots };
    void updateT0(payload);
  }, [getFilteredPlots, record, updateT0]);

  return (
    <>
      {showSpeciesDensityWarningMessage && (
        <SpeciesDensityWarningMessage onClose={cancelWarningHandler} onSave={saveWithDefaultDensity} />
      )}

      {!plotsWithObservations ||
        (plotsWithObservations.length === 0 && (
          <Box padding={theme.spacing(2)}>{strings.NO_PERMANENT_PLOTS_FOR_SURVIVAL_RATE_CALCULATION}</Box>
        ))}

      {plantingSiteId &&
        plotsWithObservations?.map((plot) => (
          <PlotT0EditBox
            plot={plot}
            key={plot.id}
            plantingSiteId={plantingSiteId}
            t0Plot={t0Plots?.find((t0Plot) => t0Plot.monitoringPlotId.toString() === plot.id.toString())}
            record={record}
            setRecord={setRecord}
            withdrawnSpeciesPlot={withdrawnSpeciesPlots?.find(
              (spPlot) => spPlot.monitoringPlotId.toString() === plot.id.toString()
            )}
          />
        ))}
    </>
  );
};

export default EditPermanentPlotsTab;
