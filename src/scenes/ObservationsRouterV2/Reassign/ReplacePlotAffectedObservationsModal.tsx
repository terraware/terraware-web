import React, { type JSX, useCallback } from 'react';

import { Box, Typography } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import { useLocalization } from 'src/providers/hooks';
import { AffectedUpcomingObservationPayload } from 'src/queries/generated/observations';

export type ReplacePlotAffectedObservationsModalProps = {
  affectedObservations: AffectedUpcomingObservationPayload[];
  onBack: () => void;
  onConfirm: () => void;
};

const ReplacePlotAffectedObservationsModal = ({
  affectedObservations,
  onBack,
  onConfirm,
}: ReplacePlotAffectedObservationsModalProps): JSX.Element => {
  const { strings } = useLocalization();

  const observationTypeLabel = useCallback(
    (observationType: AffectedUpcomingObservationPayload['observationType']): string => {
      switch (observationType) {
        case 'Baseline Survey':
          return strings.BASELINE_SURVEY;
        case 'Biomass Measurements':
          return strings.BIOMASS_MONITORING;
        case 'Monitoring':
          return strings.PLANT_MONITORING;
      }
    },
    [strings]
  );

  const affectedObservationText = useCallback(
    (observation: AffectedUpcomingObservationPayload): string => {
      const template =
        observation.outcome === 'ObservationDeleted'
          ? strings.REPLACE_PLOT_UPCOMING_OBSERVATION_DELETED
          : strings.REPLACE_PLOT_UPCOMING_OBSERVATION_PLOTS_REASSIGNED;

      return strings.formatString(
        template,
        observationTypeLabel(observation.observationType),
        observation.startDate
      ) as string;
    },
    [observationTypeLabel, strings]
  );

  return (
    <DialogBox
      onClose={onBack}
      open={true}
      title={strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_TITLE}
      size='medium'
      message={strings.REPLACE_PLOT_AFFECTED_OBSERVATIONS_MESSAGE}
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
      <Box component='ul' textAlign='left' marginBottom={0} marginTop={2}>
        {affectedObservations.map((observation) => (
          <Typography component='li' key={observation.observationId}>
            {affectedObservationText(observation)}
          </Typography>
        ))}
      </Box>
    </DialogBox>
  );
};

export default ReplacePlotAffectedObservationsModal;
