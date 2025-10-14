import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { Checkbox, PageForm } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { SpeciesPlot } from 'src/redux/features/nurseryWithdrawals/nurseryWithdrawalsThunks';
import { selectAssignT0TempSiteData } from 'src/redux/features/tracking/trackingSelectors';
import {
  PlotsWithObservationsSearchResult,
  requestAssignT0TempSiteData,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { AssignSiteT0TempData, ZoneT0Data } from 'src/types/Tracking';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import SpeciesDensityWarningMessage from './SpeciesDensityWarningMessage';
import ZoneT0EditBox from './ZoneT0EditBox';

type EditTemporaryPlotsTabProps = {
  plantingSiteId: number;
  reload: () => void;
  temporaryPlotsWithObservations?: PlotsWithObservationsSearchResult[];
  withdrawnSpeciesPlots?: SpeciesPlot[];
  zones?: ZoneT0Data[];
  alreadyIncluding?: boolean;
};

const EditTemporaryPlotsTab = ({
  plantingSiteId,
  temporaryPlotsWithObservations,
  withdrawnSpeciesPlots,
  zones,
  reload,
  alreadyIncluding,
}: EditTemporaryPlotsTabProps) => {
  const [isTemporaryPlotsChecked, setIsTemporaryPlotsChecked] = useState(false);
  const [showSpeciesDensityWarningMessage, setShowSpeciesDensityWarningMessage] = useState(false);
  const [assignRequestId, setAssignRequestId] = useState('');
  const saveResponse = useAppSelector(selectAssignT0TempSiteData(assignRequestId));
  const navigate = useSyncNavigate();
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [record, setRecord] = useForm<AssignSiteT0TempData>({
    plantingSiteId,
    zones: zones ?? [],
  });

  useEffect(() => {
    if (alreadyIncluding) {
      setIsTemporaryPlotsChecked(true);
    }
  }, [alreadyIncluding]);

  useEffect(() => {
    if (zones) {
      setRecord({ plantingSiteId, zones });
    }
  }, [plantingSiteId, setRecord, zones]);

  const goToViewSettings = useCallback(() => {
    navigate(APP_PATHS.SURVIVAL_RATE_SETTINGS.replace(':plantingSiteId', plantingSiteId.toString()));
  }, [navigate, plantingSiteId]);

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

  const saveSettings = useCallback(() => {
    if (!record.zones || record.zones.length === 0) {
      goToViewSettings();
      return;
    }
    let shouldShowWarning = false;

    record.zones.forEach((zone) => {
      const plots = zonesWithObservations[zone.plantingZoneId.toString()];
      const plotIds = plots.map((plot) => plot.id.toString());
      const withdrawnSpeciesOfZone = withdrawnSpeciesPlots?.filter((wsp) =>
        plotIds.includes(wsp.monitoringPlotId.toString())
      );

      const speciesMap = new Map<number, { density: number; speciesId: number }>();
      withdrawnSpeciesOfZone?.forEach((plot) => {
        plot.species.forEach((wdSpecies) => {
          if (!speciesMap.has(wdSpecies.speciesId)) {
            speciesMap.set(wdSpecies.speciesId, wdSpecies);
          }
        });
      });
      const allWithdrawnSpeciesForZone = Array.from(speciesMap.values());

      allWithdrawnSpeciesForZone.forEach((spec) => {
        const correspondingSpecies = zone.densityData.find(
          (denData) => denData.speciesId.toString() === spec.speciesId.toString()
        );
        if (!correspondingSpecies) {
          shouldShowWarning = true;
        }
      });
    });

    record.zones.forEach((zone) => {
      zone.densityData.forEach((denData) => {
        if (denData.density === undefined || denData.density === null) {
          shouldShowWarning = true;
        }
      });
    });

    if (shouldShowWarning) {
      setShowSpeciesDensityWarningMessage(true);
      return;
    }

    const saveRequest = dispatch(requestAssignT0TempSiteData(record));
    setAssignRequestId(saveRequest.requestId);
  }, [dispatch, goToViewSettings, record, withdrawnSpeciesPlots, zonesWithObservations]);

  const onChangeTemporaryPlotsCheck = useCallback(
    (value: boolean) => {
      setIsTemporaryPlotsChecked(value);
    },
    [setIsTemporaryPlotsChecked]
  );

  useEffect(() => {
    if (saveResponse?.status === 'success') {
      reload();
      goToViewSettings();
    }
    if (saveResponse?.status === 'error') {
      snackbar.toastError();
    }
  }, [goToViewSettings, reload, saveResponse, snackbar]);

  const cancelWarningHandler = useCallback(() => {
    setShowSpeciesDensityWarningMessage(false);
  }, []);

  const saveWithDefaultDensity = useCallback(() => {
    const saveRequest = dispatch(requestAssignT0TempSiteData(record));
    setAssignRequestId(saveRequest.requestId);
  }, [dispatch, record]);

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
            return (
              <ZoneT0EditBox
                key={zoneId}
                plotsWithObservations={plots}
                withdrawnSpeciesPlot={filteredWithdrawnSpecies}
                zoneData={zones?.find((z) => z.plantingZoneId.toString() === zoneId.toString())}
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
