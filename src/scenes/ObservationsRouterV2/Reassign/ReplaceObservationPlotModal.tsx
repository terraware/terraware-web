import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import { BusySpinner, Button, DialogBox, Dropdown, Textfield } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import {
  PreviewReplaceObservationPlotResponsePayload,
  ReplaceObservationPlotRequestPayload,
  usePreviewReplaceObservationPlotMutation,
  useReplaceObservationPlotMutation,
} from 'src/queries/generated/observations';
import {
  MonitoringPlotSearchResult,
  useLazySearchMonitoringPlotsQuery,
  useSearchMonitoringPlotsQuery,
} from 'src/queries/search/plantingSites';
import { ReplaceObservationPlotDuration } from 'src/types/Observations';
import useSnackbar from 'src/utils/useSnackbar';

import { useReassignPlotModal } from '.';
import ReplacePlotAffectedObservationsModal from './ReplacePlotAffectedObservationsModal';

export default function ReplaceObservationPlotModal(): JSX.Element {
  const { open, monitoringPlotId, observationId, isPermanent, closeReassignPlotModal } = useReassignPlotModal();

  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const navigate = useSyncNavigate();
  const [justification, setJustification] = useState<string>();
  const [duration, setDuration] = useState<ReplaceObservationPlotDuration | undefined>();
  const [validate, setValidate] = useState<boolean>(false);
  const [replaceRequest, setReplaceRequest] = useState<ReplaceObservationPlotRequestPayload | undefined>();
  // Set when the user needs to confirm the replacement's effects before it is sent.
  const [preview, setPreview] = useState<PreviewReplaceObservationPlotResponsePayload>();

  const { data: monitoringPlots } = useSearchMonitoringPlotsQuery(monitoringPlotId ? [monitoringPlotId] : [], {
    skip: !monitoringPlotId,
  });
  const [replacePlot, replacePlotResults] = useReplaceObservationPlotMutation();
  const [previewReplacePlot, { isLoading: previewLoading }] = usePreviewReplaceObservationPlotMutation();
  const [searchMonitoringPlots, { isLoading: searchPlotsLoading }] = useLazySearchMonitoringPlotsQuery();

  const monitoringPlot = useMemo(() => (monitoringPlots?.length ? monitoringPlots[0] : undefined), [monitoringPlots]);

  const stopPropagation = useCallback((e: React.MouseEvent | React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const sendReplaceRequest = useCallback(() => {
    if (observationId && monitoringPlotId && justification && duration) {
      const requestPayload = { justification, duration };
      setPreview(undefined);
      setReplaceRequest(requestPayload);
      void replacePlot({
        observationId,
        plotId: monitoringPlotId,
        replaceObservationPlotRequestPayload: requestPayload,
      });
    }
  }, [duration, justification, monitoringPlotId, observationId, replacePlot]);

  const replaceObservationPlot = useCallback(async () => {
    setValidate(true);
    if (!observationId || !monitoringPlotId || !justification || !duration) {
      return;
    }

    // Ask for confirmation first if the replacement could change other upcoming observations (long-term
    // replacements only) or delete this one (if the plot is its only plot and can't be replaced).
    try {
      const previewResult = await previewReplacePlot({
        observationId,
        plotId: monitoringPlotId,
        previewReplaceObservationPlotRequestPayload: { duration },
      }).unwrap();
      if (previewResult.affectedObservations.length || previewResult.mayDeleteObservation) {
        setPreview(previewResult);
        return;
      }
    } catch {
      snackbar.toastError();
      return;
    }

    sendReplaceRequest();
  }, [duration, justification, monitoringPlotId, observationId, previewReplacePlot, sendReplaceRequest, snackbar]);

  const onSendRequest = useCallback(() => void replaceObservationPlot(), [replaceObservationPlot]);

  const onBackFromAffectedObservations = useCallback(() => setPreview(undefined), []);

  const durations = useMemo(() => {
    return [
      { label: strings.TEMPORARY, value: 'Temporary' },
      { label: strings.LONG_TERM_PERMANENT, value: 'LongTerm' },
    ];
  }, [strings]);

  const onClose = useCallback(() => {
    closeReassignPlotModal();
    setDuration(undefined);
    setJustification(undefined);
    setValidate(false);
    setPreview(undefined);
  }, [closeReassignPlotModal]);

  const onSuccess = useCallback(
    async (
      addedPlotIds: number[],
      removedPlotIds: number[],
      reassignedObservationIds: number[],
      deletedObservationIds: number[],
      observationDeleted: boolean
    ) => {
      const modifiedPlots = [...addedPlotIds, ...removedPlotIds];
      const plots = modifiedPlots.length ? await searchMonitoringPlots(modifiedPlots).unwrap() : [];

      const addedPlots = addedPlotIds
        .map((plotId) => plots.find((plot) => plot.id === plotId))
        .filter((plot): plot is MonitoringPlotSearchResult => plot !== undefined);

      const removedPlots = removedPlotIds
        .map((plotId) => plots.find((plot) => plot.id === plotId))
        .filter((plot): plot is MonitoringPlotSearchResult => plot !== undefined);

      // show page message of status
      const addedPlotNumbers = addedPlots.map((plot) => plot.plotNumber).join(', ');
      const removedPlotNumbers = removedPlots.map((plot) => plot.plotNumber).join(', ');

      // we don't add new plots for a permanent plot if the site has completed observations
      const noReplacedPlotsFound = !addedPlotIds.length;

      const lineItems: (string | JSX.Element)[] = [];
      if (isPermanent) {
        if (replaceRequest?.duration === 'LongTerm') {
          lineItems.push(
            strings.formatString(
              strings.REASSIGNMENT_REQUEST_PERMANENT_PLOT_REMOVED_LONG_TERM,
              removedPlotNumbers
            ) as string
          );
        } else {
          lineItems.push(
            strings.formatString(
              strings.REASSIGNMENT_REQUEST_PERMANENT_PLOT_REMOVED_TEMPORARY,
              removedPlotNumbers
            ) as string
          );
        }
      } else {
        if (replaceRequest?.duration === 'LongTerm') {
          lineItems.push(
            strings.formatString(
              strings.REASSIGNMENT_REQUEST_TEMPORARY_PLOT_REMOVED_LONG_TERM,
              removedPlotNumbers
            ) as string
          );
        } else {
          lineItems.push(
            strings.formatString(
              strings.REASSIGNMENT_REQUEST_TEMPORARY_PLOT_REMOVED_TEMPORARY,
              removedPlotNumbers
            ) as string
          );
        }
      }

      const upcomingObservationLineItems: (string | JSX.Element)[] = [];
      if (reassignedObservationIds.length) {
        upcomingObservationLineItems.push(
          <br key='reassigned' />,
          strings.formatString(
            strings.REASSIGNMENT_REQUEST_UPCOMING_OBSERVATIONS_REASSIGNED,
            reassignedObservationIds.length
          ) as string
        );
      }
      if (deletedObservationIds.length) {
        upcomingObservationLineItems.push(
          <br key='deleted' />,
          strings.formatString(
            strings.REASSIGNMENT_REQUEST_UPCOMING_OBSERVATIONS_DELETED,
            deletedObservationIds.length
          ) as string
        );
      }

      if (noReplacedPlotsFound) {
        snackbar.pageWarning(
          lineItems.concat(
            [<br key='warn' />, strings.REASSIGNMENT_REQUEST_NO_PLOTS_ADDED_WARNING],
            observationDeleted
              ? [<br key='observation-deleted' />, strings.REASSIGNMENT_REQUEST_OBSERVATION_DELETED]
              : [],
            upcomingObservationLineItems
          ),
          strings.REASSIGNMENT_REQUEST_STATUS,
          { label: strings.CLOSE }
        );
      } else {
        lineItems.push(<br key='info' />);

        if (addedPlotIds.length) {
          if (isPermanent && replaceRequest?.duration === 'LongTerm') {
            // Replacing a permanent plot long-term will cause a new permanent plot to be added.
            lineItems.push(
              strings.formatString(strings.REASSIGNMENT_REQUEST_PERMANENT_PLOT_ADDED, addedPlotNumbers) as string
            );
          } else {
            lineItems.push(
              strings.formatString(strings.REASSIGNMENT_REQUEST_TEMPORARY_PLOT_ADDED, addedPlotNumbers) as string
            );
          }
        } else {
          lineItems.push(strings.REASSIGNMENT_REQUEST_NO_PLOTS_ADDED);
        }

        lineItems.push(...upcomingObservationLineItems);
        snackbar.pageInfo(lineItems, strings.REASSIGNMENT_REQUEST_STATUS, { label: strings.CLOSE });
      }
      onClose();

      // The observation no longer exists, so its page can't be shown.
      if (observationDeleted) {
        navigate(APP_PATHS.OBSERVATIONS);
      }
    },
    [isPermanent, navigate, onClose, replaceRequest, searchMonitoringPlots, snackbar, strings]
  );

  useEffect(() => {
    if (replacePlotResults.isError) {
      snackbar.toastError();
    } else if (replacePlotResults.isSuccess) {
      const {
        addedMonitoringPlotIds,
        removedMonitoringPlotIds,
        reassignedObservationIds,
        deletedObservationIds,
        observationDeleted,
      } = replacePlotResults.data;
      void onSuccess(
        addedMonitoringPlotIds,
        removedMonitoringPlotIds,
        reassignedObservationIds,
        deletedObservationIds,
        observationDeleted
      );
    }
  }, [
    selectedOrganization,
    snackbar,
    replacePlotResults.isError,
    replacePlotResults.isSuccess,
    replacePlotResults.data,
    strings.REASSIGNMENT_REQUEST_SENT,
    onSuccess,
  ]);
  return (
    <>
      {(replacePlotResults.isLoading || previewLoading || searchPlotsLoading) && <BusySpinner withSkrim={true} />}
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        {open && preview && (
          <ReplacePlotAffectedObservationsModal
            affectedObservations={preview.affectedObservations}
            mayDeleteObservation={preview.mayDeleteObservation}
            onBack={onBackFromAffectedObservations}
            onConfirm={sendReplaceRequest}
          />
        )}
        <DialogBox
          onClose={onClose}
          open={open && !preview}
          title={strings.REQUEST_REASSIGNMENT}
          size='medium'
          middleButtons={[
            <Button
              id='cancelReplaceObservationPlot'
              label={strings.CANCEL}
              type='passive'
              onClick={onClose}
              priority='secondary'
              key='button-1'
            />,
            <Button id='replaceObservationPlot' onClick={onSendRequest} label={strings.SEND_REQUEST} key='button-2' />,
          ]}
          scrolled={false}
        >
          <Grid container spacing={2} textAlign='left' size={12}>
            {monitoringPlot && (
              <Grid size={12}>
                <Textfield
                  id='monitoringPlot'
                  value={monitoringPlot.plotNumber}
                  type='text'
                  label={strings.MONITORING_PLOT}
                  display={true}
                />
              </Grid>
            )}
            <Grid size={12}>
              <Textfield
                id='reason'
                value={justification}
                type='textarea'
                label={strings.REASON}
                onChange={(value) => {
                  setJustification(value as string);
                }}
                errorText={validate && !justification ? strings.REQUIRED_FIELD : ''}
                tooltipTitle={strings.REQUEST_REASSIGNMENT_REASON_TOOLTIP}
                required
              />
            </Grid>
            <Grid size={12}>
              <Dropdown
                id='duration'
                label={strings.REASSIGNMENT_DURATION}
                onChange={(value: string) => setDuration(value as ReplaceObservationPlotDuration)}
                options={durations}
                selectedValue={duration}
                errorText={validate && !duration ? strings.REQUIRED_FIELD : ''}
                tooltipTitle={strings.REQUEST_REASSIGNMENT_DURATION_TOOLTIP}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogBox>
      </div>
    </>
  );
}
