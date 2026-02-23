import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DialogBox, Dropdown, Textfield } from '@terraware/web-components';

import { useLocalization, useOrganization } from 'src/providers';
import { useReplaceObservationPlotMutation } from 'src/queries/generated/observations';
import {
  MonitoringPlotSearchResult,
  useLazySearchMonitoringPlotsQuery,
  useSearchMonitoringPlotsQuery,
} from 'src/queries/search/plantingSites';
import { ReplaceObservationPlotDuration } from 'src/types/Observations';
import useSnackbar from 'src/utils/useSnackbar';

import { useReassignPlotModal } from '.';

export default function ReplaceObservationPlotModal(): JSX.Element {
  const { open, monitoringPlotId, observationId, closeReassignPlotModal } = useReassignPlotModal();

  const { strings } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const theme = useTheme();
  const [justification, setJustification] = useState<string>();
  const [duration, setDuration] = useState<ReplaceObservationPlotDuration | undefined>();
  const [validate, setValidate] = useState<boolean>(false);

  const { data: monitoringPlots } = useSearchMonitoringPlotsQuery(monitoringPlotId ? [monitoringPlotId] : [], {
    skip: !monitoringPlotId,
  });
  const [replacePlot, replacePlotResults] = useReplaceObservationPlotMutation();
  const [searchMonitoringPlots, { isLoading: searchPlotsLoading }] = useLazySearchMonitoringPlotsQuery();

  const monitoringPlot = useMemo(() => (monitoringPlots?.length ? monitoringPlots[0] : undefined), [monitoringPlots]);

  const stopPropagation = useCallback((e: React.MouseEvent | React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const replaceObservationPlot = useCallback(() => {
    setValidate(true);
    if (observationId && monitoringPlotId && justification && duration) {
      void replacePlot({
        observationId,
        plotId: monitoringPlotId,
        replaceObservationPlotRequestPayload: {
          justification,
          duration,
        },
      });
    }
  }, [duration, justification, monitoringPlotId, observationId, replacePlot]);

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
  }, [closeReassignPlotModal]);

  const onSuccess = useCallback(
    async (addedPlotIds: number[], removedPlotIds: number[]) => {
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
    },
    [searchMonitoringPlots, onClose, snackbar, strings]
  );

  useEffect(() => {
    if (replacePlotResults.isError) {
      snackbar.toastError();
    } else if (replacePlotResults.isSuccess) {
      const { addedMonitoringPlotIds, removedMonitoringPlotIds } = replacePlotResults.data;
      void onSuccess(addedMonitoringPlotIds, removedMonitoringPlotIds);
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
      {(replacePlotResults.isLoading || searchPlotsLoading) && <BusySpinner withSkrim={true} />}
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        <DialogBox
          onClose={onClose}
          open={open}
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
            {monitoringPlot && (
              <Grid item xs={12}>
                <Textfield
                  id='monitoringPlot'
                  value={monitoringPlot.plotNumber}
                  type='text'
                  label={strings.MONITORING_PLOT}
                  display={true}
                />
              </Grid>
            )}
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
