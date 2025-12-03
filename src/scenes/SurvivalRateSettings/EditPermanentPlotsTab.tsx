import React, { useCallback, useEffect, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { PageForm } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectAssignT0SiteData } from 'src/redux/features/tracking/trackingSelectors';
import { PlotsWithObservationsSearchResult, requestAssignT0SiteData } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AssignSiteT0Data, PlotT0Data, SpeciesPlot } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import PlotT0EditBox from './PlotT0EditBox';
import SpeciesDensityWarningMessage from './SpeciesDensityWarningMessage';

type EditPermanentPlotsTabProps = {
  plantingSiteId: number;
  reload: () => void;
  plotsWithObservations?: PlotsWithObservationsSearchResult[];
  t0Plots?: PlotT0Data[];
  withdrawnSpeciesPlots?: SpeciesPlot[];
};

const EditPermanentPlotsTab = ({
  plantingSiteId,
  plotsWithObservations,
  t0Plots,
  withdrawnSpeciesPlots,
  reload,
}: EditPermanentPlotsTabProps) => {
  const snackbar = useSnackbar();
  const [showSpeciesDensityWarningMessage, setShowSpeciesDensityWarningMessage] = useState(false);
  const [assignRequestId, setAssignRequestId] = useState('');
  const saveResponse = useAppSelector(selectAssignT0SiteData(assignRequestId));
  const navigate = useSyncNavigate();
  const dispatch = useAppDispatch();
  const { reload: reloadPlantingSiteData } = usePlantingSiteData();
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

    const saveRequest = dispatch(requestAssignT0SiteData({ ...record, plots: filteredPlots }));
    setAssignRequestId(saveRequest.requestId);
  }, [dispatch, goToViewSettings, record, withdrawnSpeciesPlots, getFilteredPlots]);

  useEffect(() => {
    if (saveResponse?.status === 'success') {
      reload();
      reloadPlantingSiteData();
      goToViewSettings();
    }
    if (saveResponse?.status === 'error') {
      snackbar.toastError();
    }
  }, [goToViewSettings, reload, saveResponse, snackbar, reloadPlantingSiteData]);

  const cancelWarningHandler = useCallback(() => {
    setShowSpeciesDensityWarningMessage(false);
  }, []);

  const saveWithDefaultDensity = useCallback(() => {
    const filteredPlots = getFilteredPlots();
    const saveRequest = dispatch(requestAssignT0SiteData({ ...record, plots: filteredPlots }));
    setAssignRequestId(saveRequest.requestId);
  }, [dispatch, record, getFilteredPlots]);

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
