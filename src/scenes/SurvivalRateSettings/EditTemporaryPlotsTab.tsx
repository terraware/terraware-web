import React, { useCallback, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { Checkbox, PageForm } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { PlotsWithObservationsSearchResult } from 'src/redux/features/tracking/trackingThunks';
import strings from 'src/strings';
import { PlotT0Data } from 'src/types/Tracking';

import ZoneT0EditBox from './ZoneT0EditBox';

type EditTemporaryPlotsTabProps = {
  plantingSiteId: number;
  temporaryPlotsWithObservations?: PlotsWithObservationsSearchResult[];
  withdrawnSpeciesPlots?: SpeciesPlot[];
  t0Plots?: PlotT0Data[];
};

const EditTemporaryPlotsTab = ({
  plantingSiteId,
  temporaryPlotsWithObservations,
  withdrawnSpeciesPlots,
  t0Plots,
}: EditTemporaryPlotsTabProps) => {
  const [isTemporaryPlotsChecked, setIsTemporaryPlotsChecked] = useState(false);
  const navigate = useSyncNavigate();

  const goToViewSettings = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()));
  }, [navigate, plantingSiteId]);

  const saveSettings = useCallback(() => {
    goToViewSettings();
  }, [goToViewSettings]);

  const onChangeTemporaryPlotsCheck = useCallback(
    (value: boolean) => {
      setIsTemporaryPlotsChecked(value);
    },
    [setIsTemporaryPlotsChecked]
  );

  const zonesWithObservations = useMemo(() => {
    if (!temporaryPlotsWithObservations) {
      return {};
    }
    return temporaryPlotsWithObservations.reduce(
      (acc, plot) => {
        const zoneId = plot.plantingSubzone_plantingZone_id;
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
      <Box
        paddingTop={1.5}
        sx={{
          '& .MuiFormControlLabel-label': {
            fontWeight: 500,
          },
        }}
      >
        <Checkbox
          id={'temporaryPlotsCheck'}
          name={'temporaryPlotsCheck'}
          label={strings.USE_TEMPORARY_PLOTS_IN_SURVIVAL_RATE}
          value={isTemporaryPlotsChecked}
          onChange={onChangeTemporaryPlotsCheck}
        />

        {isTemporaryPlotsChecked &&
          Object.entries(zonesWithObservations).map(([zoneId, plots]) => {
            const plotIds = plots.map((plot) => plot.id.toString());
            const filteredWithdrawnSpecies = withdrawnSpeciesPlots?.filter((wsp) =>
              plotIds.includes(wsp.monitoringPlotId.toString())
            );
            const filteredT0Plots = t0Plots?.filter((t0Plot) => plotIds.includes(t0Plot.monitoringPlotId.toString()));
            return (
              <ZoneT0EditBox
                key={zoneId}
                plotsWithObservations={plots}
                withdrawnSpeciesPlot={filteredWithdrawnSpecies}
                t0Plots={filteredT0Plots}
              />
            );
          })}
      </Box>
    </PageForm>
  );
};

export default EditTemporaryPlotsTab;
