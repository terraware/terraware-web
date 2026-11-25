import React, { type JSX, useCallback } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import { AffectedUpcomingObservationPayload } from 'src/queries/generated/observations';
import { getObservationTypeLabel } from 'src/types/Observations';

export type ReplacePlotAffectedObservationsModalProps = {
  affectedObservations: AffectedUpcomingObservationPayload[];
  mayDeleteObservation: boolean;
  onBack: () => void;
  onConfirm: () => void;
};

const ReplacePlotAffectedObservationsModal = ({
  affectedObservations,
  mayDeleteObservation,
  onBack,
  onConfirm,
}: ReplacePlotAffectedObservationsModalProps): JSX.Element => {
  const { strings } = useLocalization();

  const affectedObservationText = useCallback(
    (observation: AffectedUpcomingObservationPayload): string => {
      const template =
        observation.outcome === 'ObservationDeleted'
          ? strings.REPLACE_PLOT_UPCOMING_OBSERVATION_DELETED
          : strings.REPLACE_PLOT_UPCOMING_OBSERVATION_PLOTS_REASSIGNED;

      return strings.formatString(
        template,
        getObservationTypeLabel(observation.observationType, strings),
        observation.startDate
      ) as string;
    },
    [strings]
  );

  return (
    <DialogBox
      onClose={onBack}
      open={true}
      title={
        affectedObservations.length
          ? strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE
          : strings.REPLACE_PLOT_CONFIRM_TITLE
      }
      size='medium'
      message={affectedObservations.length ? strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_MESSAGE : undefined}
      middleButtons={[
        <Button
          id='back-replace-plot-affected-observations'
          key='back'
          label={strings.BACK}
          onClick={onBack}
          priority='secondary'
          type='passive'
        />,
        <Button
          id='confirm-replace-plot-affected-observations'
          key='confirm'
          label={strings.CONFIRM}
          onClick={onConfirm}
        />,
      ]}
    >
      {affectedObservations.length > 0 && (
        <Box component='ul' textAlign='left' marginBottom={0} marginTop={2}>
          {affectedObservations.map((observation) => (
            <Typography component='li' key={observation.observationId}>
              {affectedObservationText(observation)}
            </Typography>
          ))}
        </Box>
      )}
      {mayDeleteObservation && <Typography marginTop={2}>{strings.REPLACE_PLOT_ONLY_PLOT_WARNING}</Typography>}
    </DialogBox>
  );
};

export default ReplacePlotAffectedObservationsModal;
