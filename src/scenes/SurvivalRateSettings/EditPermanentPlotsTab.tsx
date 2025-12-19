import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { PageForm } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { useAssignT0SiteDataMutation } from 'src/queries/generated/t0';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { AssignSiteT0Data, PlotT0Data, SpeciesPlot } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import PlotT0EditBox from './PlotT0EditBox';
import SpeciesDensityWarningMessage from './SpeciesDensityWarningMessage';

type EditPermanentPlotsTabProps = {
  plantingSiteId: number;
  plotsWithObservations?: PlotsWithObservationsSearchResult[];
  t0Plots?: PlotT0Data[];
  withdrawnSpeciesPlots?: SpeciesPlot[];
};

const EditPermanentPlotsTab = ({
  plantingSiteId,
  plotsWithObservations,
  t0Plots,
  withdrawnSpeciesPlots,
}: EditPermanentPlotsTabProps) => {
  const snackbar = useSnackbar();
  const [showSpeciesDensityWarningMessage, setShowSpeciesDensityWarningMessage] = useState(false);
  const navigate = useSyncNavigate();
  const { reload: reloadPlantingSiteData } = usePlantingSiteData();
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

  const goToViewSettings = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()));
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

  const cancelWarningHandler = useCallback(() => {
    setShowSpeciesDensityWarningMessage(false);
  }, []);

  const saveWithDefaultDensity = useCallback(() => {
    const filteredPlots = getFilteredPlots();
    const payload = { ...record, plots: filteredPlots };
    void updateT0(payload);
  }, [getFilteredPlots, record, updateT0]);

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
    </PageForm>
  );
};

export default EditPermanentPlotsTab;
