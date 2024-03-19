import { useEffect, useState } from 'react';

import { requestListParticipants } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantListRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import useSnackbar from 'src/utils/useSnackbar';

export const useParticipants = (participantId?: number) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState('');
  const participantListRequest = useAppSelector(selectParticipantListRequest(requestId));

  const [availableParticipants, setAvailableParticipants] = useState<Participant[] | undefined>();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant>();

  const isBusy = (participantListRequest || {}).status === 'pending';

  useEffect(() => {
    if (availableParticipants && participantId) {
      setSelectedParticipant(availableParticipants.find((participant) => participant.id === participantId));
    } else {
      setSelectedParticipant(undefined);
    }
  }, [availableParticipants, participantId]);

  useEffect(() => {
    if (!availableParticipants) {
      const request = dispatch(requestListParticipants({}));
      setRequestId(request.requestId);
    }
  }, [availableParticipants, dispatch]);

  useEffect(() => {
    if (!participantListRequest) {
      return;
    }

    if (participantListRequest.status === 'success' && participantListRequest.data?.participants) {
      setAvailableParticipants(participantListRequest.data.participants);
    } else if (participantListRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [participantListRequest, snackbar]);

  return { availableParticipants, selectedParticipant, isBusy };
};
