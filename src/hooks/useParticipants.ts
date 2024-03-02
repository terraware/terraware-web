import { useEffect, useState } from 'react';

import { requestParticipantsList } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantsListRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import useSnackbar from 'src/utils/useSnackbar';

export const useParticipants = (participantId?: number) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState('');
  const participantsListRequest = useAppSelector(selectParticipantsListRequest(requestId));

  const [availableParticipants, setAvailableParticipants] = useState<Participant[] | undefined>();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant>();

  const isBusy = (participantsListRequest || {}).status === 'pending';

  useEffect(() => {
    if (availableParticipants && participantId) {
      setSelectedParticipant(availableParticipants.find((participant) => participant.id === participantId));
    } else {
      setSelectedParticipant(undefined);
    }
  }, [availableParticipants, participantId]);

  useEffect(() => {
    if (!availableParticipants) {
      const request = dispatch(requestParticipantsList());
      setRequestId(request.requestId);
    }
  }, [availableParticipants, dispatch]);

  useEffect(() => {
    if (!participantsListRequest) {
      return;
    }

    if (participantsListRequest.status === 'success' && participantsListRequest.data) {
      setAvailableParticipants(participantsListRequest.data);
    } else if (participantsListRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [participantsListRequest, snackbar]);

  return { availableParticipants, selectedParticipant, isBusy };
};
