import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DialogBox, Dropdown, Textfield } from '@terraware/web-components';

import { useLocalization, useOrganization } from 'src/providers';
import { requestReplaceObservationPlot } from 'src/redux/features/observations/observationsAsyncThunks';
import {
  selectHasCompletedObservations,
  selectReplaceObservationPlot,
} from 'src/redux/features/observations/observationsSelectors';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { requestMonitoringPlots } from 'src/redux/features/tracking/trackingAsyncThunks';
import { selectMonitoringPlots } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  ObservationMonitoringPlotResultsPayload,
  ReplaceObservationPlotDuration,
  ReplaceObservationPlotResponsePayload,
} from 'src/types/Observations';
import useSnackbar from 'src/utils/useSnackbar';

export interface ReplaceObservationPlotModalProps {
  monitoringPlot: ObservationMonitoringPlotResultsPayload;
  observationId: number;
  onClose: () => void;
  plantingSiteId: number;
}

export default function ReplaceObservationPlotModal(props: ReplaceObservationPlotModalProps): JSX.Element {
  const { monitoringPlot, observationId, onClose, plantingSiteId } = props;
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [justification, setJustification] = useState<string>();
  const [duration, setDuration] = useState<ReplaceObservationPlotDuration | undefined>();
  const [validate, setValidate] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');
  const [monitoringPlotsRequestId, setMonitoringPlotsRequestId] = useState<string>('');
  const [addedPlotIds, setAddedPlotIds] = useState<number[]>([]);
  const [removedPlotIds, setRemovedPlotIds] = useState<number[]>([]);

  const result = useAppSelector((state) => selectReplaceObservationPlot(state, requestId));
  const plots = useAppSelector((state) => selectMonitoringPlots(state, monitoringPlotsRequestId));
  const hasCompletedObservations = useAppSelector((state) => selectHasCompletedObservations(state, plantingSiteId));

  const stopPropagation = useCallback((e: React.MouseEvent | React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const replaceObservationPlot = () => {
    setValidate(true);
    if (justification && duration) {
      const dispatched = dispatch(
        requestReplaceObservationPlot({
          observationId,
          plotId: monitoringPlot.monitoringPlotId,
          request: { justification, duration },
        })
      );
      setRequestId(dispatched.requestId);
    }
  };

  const durations = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      { label: strings.TEMPORARY, value: 'Temporary' },
      { label: strings.LONG_TERM_PERMANENT, value: 'LongTerm' },
    ];
  }, [activeLocale]);

  useEffect(() => {
    if (!result) {
      return;
    }

    if (result.status === 'error') {
      snackbar.toastError();
    } else if (result.status === 'success' && selectedOrganization) {
      const { addedMonitoringPlotIds, removedMonitoringPlotIds } = result.data as ReplaceObservationPlotResponsePayload;
      setAddedPlotIds(addedMonitoringPlotIds);
      setRemovedPlotIds(removedMonitoringPlotIds);
      snackbar.toastSuccess(strings.REASSIGNMENT_REQUEST_SENT);
      void dispatch(requestObservationsResults(selectedOrganization?.id || -1));
      const dispatched = dispatch(
        requestMonitoringPlots({
          plantingSiteId,
          monitoringPlotIds: [...addedMonitoringPlotIds, ...removedMonitoringPlotIds],
        })
      );
      setMonitoringPlotsRequestId(dispatched.requestId);
    }
  }, [dispatch, result, selectedOrganization, snackbar, plantingSiteId]);

  useEffect(() => {
    if (plots?.status === 'pending') {
      return;
    }
    if (plots && plots.status === 'success') {
      // show page message of status
      const addedPlotNumbers = addedPlotIds.map((id) => plots.data![Number(id)]?.plotNumber).join(', ');
      const removedPlotNumbers = removedPlotIds.map((id) => plots.data![Number(id)]?.plotNumber).join(', ');

      // we don't add new plots for a permanent plot if the site has completed observations
      const noReplacedPlotsFound = !addedPlotIds.length && (!monitoringPlot.isPermanent || !hasCompletedObservations);

      if (noReplacedPlotsFound) {
        snackbar.pageWarning(
          [
            strings.formatString(strings.REASSIGNMENT_REQUEST_PLOTS_REMOVED, removedPlotNumbers) as string,
            <br key='warn' />,
            strings.REASSIGNMENT_REQUEST_NO_PLOTS_ADDED_WARNING,
          ],
          strings.REASSIGNMENT_REQUEST_STATUS,
          { label: strings.CLOSE }
        );
      } else {
        snackbar.pageInfo(
          [
            strings.formatString(strings.REASSIGNMENT_REQUEST_PLOTS_REMOVED, removedPlotNumbers) as string,
            <br key='info' />,
            addedPlotIds.length
              ? (strings.formatString(strings.REASSIGNMENT_REQUEST_PLOTS_ADDED, addedPlotNumbers) as string)
              : strings.REASSIGNMENT_REQUEST_NO_PLOTS_ADDED,
          ],
          strings.REASSIGNMENT_REQUEST_STATUS,
          { label: strings.CLOSE }
        );
      }
      onClose();
    }
  }, [plots, onClose, snackbar, addedPlotIds, removedPlotIds, hasCompletedObservations, monitoringPlot]);

  return (
    <>
      {(result?.status === 'pending' || plots?.status === 'pending') && <BusySpinner withSkrim={true} />}
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        <DialogBox
          onClose={onClose}
          open={true}
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
            <Button
              id='replaceObservationPlot'
              onClick={replaceObservationPlot}
              label={strings.SEND_REQUEST}
              key='button-2'
            />,
          ]}
          scrolled={false}
        >
          <Grid container item xs={12} spacing={2} textAlign='left'>
            <Grid item xs={12}>
              <Typography
                fontSize='16px'
                lineHeight='24px'
                fontWeight={400}
                color={theme.palette.TwClrTxt}
                textAlign='center'
              >
                {strings.REQUEST_REASSIGNMENT_JUSTIFICATION}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Textfield
                id='monitoringPlot'
                value={monitoringPlot.monitoringPlotNumber}
                type='text'
                label={strings.MONITORING_PLOT}
                display={true}
              />
            </Grid>
            <Grid item xs={12}>
              <Textfield
                id='reason'
                value={justification}
                type='textarea'
                label={strings.REASON}
                onChange={(value) => {
                  setJustification(value as string);
                }}
                errorText={validate && !justification ? strings.REQUIRED_FIELD : ''}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Dropdown
                id='duration'
                label={strings.REASSIGNMENT_DURATION}
                onChange={(value: string) => setDuration(value as ReplaceObservationPlotDuration)}
                options={durations}
                selectedValue={duration}
                errorText={validate && !duration ? strings.REQUIRED_FIELD : ''}
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
