import React, { type JSX, useCallback, useEffect, useMemo } from 'react';

import { Typography, useTheme } from '@mui/material';
import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import { useLocalization, useOrganization } from 'src/providers';
import { useAbandonObservationMutation, useLazyGetObservationQuery } from 'src/queries/generated/observations';
import { getShortDate } from 'src/utils/dateFormatter';
import useSnackbar from 'src/utils/useSnackbar';

import { useAbandonObservationModal } from '.';

export default function AbandonObservationModal(): JSX.Element {
  const { open, observationId, closeAbandonObservationModal } = useAbandonObservationModal();

  const { strings, activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const snackbar = useSnackbar();
  const theme = useTheme();

  const [getObservation, getObservationResults] = useLazyGetObservationQuery();
  const [abandonObservation, abandonObservationResults] = useAbandonObservationMutation();

  const observation = useMemo(() => getObservationResults.data?.observation, [getObservationResults.data?.observation]);

  const stopPropagation = useCallback((e: React.MouseEvent | React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    if (observationId) {
      void getObservation(observationId, true);
    }
  }, [getObservation, observationId]);

  const onSave = useCallback(() => {
    if (observationId) {
      void abandonObservation(observationId);
    }
  }, [abandonObservation, observationId]);

  useEffect(() => {
    if (abandonObservationResults.isError) {
      snackbar.toastError();
    } else if (abandonObservationResults.isSuccess) {
      if (observation) {
        snackbar.toastSuccess(
          strings.formatString(
            strings.OBSERVATION_ENDED_MESSAGE,
            getShortDate(observation.endDate, activeLocale),
            strings.OBSERVATION_ENDED
          )
        );
      }
      closeAbandonObservationModal();
    }
  }, [
    selectedOrganization,
    snackbar,
    abandonObservationResults.isError,
    abandonObservationResults.isSuccess,
    strings,
    activeLocale,
    closeAbandonObservationModal,
    observation,
  ]);

  return (
    <>
      {(getObservationResults.isFetching || abandonObservationResults.isLoading) && <BusySpinner withSkrim={true} />}
      <div onClick={stopPropagation} onMouseDown={stopPropagation}>
        <DialogBox
          onClose={closeAbandonObservationModal}
          open={open}
          title={strings.END_OBSERVATION}
          size='medium'
          message={strings.END_OBSERVATION_MODAL_MESSAGE}
          middleButtons={[
            <Button
              id='cancel'
              label={strings.CANCEL}
              type='passive'
              onClick={closeAbandonObservationModal}
              priority='secondary'
              key='button-1'
            />,
            <Button id='save' onClick={onSave} label={strings.END_OBSERVATION} key='button-2' />,
          ]}
          scrolled
        >
          {observation && (
            <Typography marginTop={3} color={theme.palette.TwClrTxt}>
              {strings.formatString(
                strings.END_OBSERVATION_MODAL_QUESTION,
                getShortDate(observation.endDate, activeLocale)
              )}
            </Typography>
          )}
        </DialogBox>
      </div>
    </>
  );
}
