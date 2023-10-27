import { useEffect, useState, useMemo } from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import { Button, BusySpinner, DialogBox, Dropdown, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';
import {
  ObservationMonitoringPlotResultsPayload,
  ReplaceObservationPlotDuration,
  ReplaceObservationPlotResponsePayload,
} from 'src/types/Observations';
import { useLocalization, useOrganization } from 'src/providers';
import { useAppSelector, useAppDispatch } from 'src/redux/store';
import { selectReplaceObservationPlot } from 'src/redux/features/observations/observationsSelectors';
import { requestReplaceObservationPlot } from 'src/redux/features/observations/observationsAsyncThunks';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';

export interface ReplaceObservationPlotModalProps {
  onClose: () => void;
  observationId: number;
  monitoringPlot: ObservationMonitoringPlotResultsPayload;
}

export default function ReplaceObservationPlotModal(props: ReplaceObservationPlotModalProps): JSX.Element {
  const { onClose, observationId, monitoringPlot } = props;
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [justification, setJustification] = useState<string>();
  const [duration, setDuration] = useState<ReplaceObservationPlotDuration | undefined>();
  const [validate, setValidate] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');

  const result = useAppSelector((state) => selectReplaceObservationPlot(state, requestId));

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
    } else if (result.status === 'success') {
      const { addedMonitoringPlotIds, removedMonitoringPlotIds } = result.data as ReplaceObservationPlotResponsePayload;
      snackbar.toastInfo(strings.REASSIGNMENT_REQUEST_SENT);
      dispatch(requestObservationsResults(selectedOrganization.id));
      onClose();
    }
  }, [dispatch, onClose, result, selectedOrganization.id, snackbar]);

  return (
    <>
      {result?.status === 'pending' && <BusySpinner withSkrim={true} />}
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
              value={monitoringPlot.monitoringPlotName}
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
    </>
  );
}
