import { useEffect, useMemo, useState } from 'react';

import { requestGetParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantGetRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  isError: boolean;
  isBusy: boolean;
  participant?: Participant;
};

export const useParticipant = (participantId: number) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState('');
  const result = useAppSelector(selectParticipantGetRequest(requestId));

  useEffect(() => {
    const request = dispatch(requestGetParticipant(participantId));
    setRequestId(request.requestId);
  }, [dispatch, participantId]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [result, snackbar]);

  return useMemo(
    () => ({
      isError: result?.status === 'error',
      isBusy: result?.status === 'pending',
      participant: result?.data,
    }),
    [result]
  );
};
