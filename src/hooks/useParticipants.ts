import { useEffect, useMemo, useState } from 'react';

import { requestListParticipants } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantListRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import useSnackbar from 'src/utils/useSnackbar';

export type Response = {
  availableParticipants?: Participant[];
  isBusy: boolean;
  notFound: boolean;
  selectedParticipant?: Participant;
};

export const useParticipants = (participantId?: number) => {
  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();

  const [requestId, setRequestId] = useState('');
  const participantListRequest = useAppSelector(selectParticipantListRequest(requestId));

  const [notFound, setNotFound] = useState<boolean>(false);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[] | undefined>();
  const [selectedParticipant, setSelectedParticipant] = useState<Participant>();

  const isBusy = (participantListRequest || {}).status === 'pending';

  useEffect(() => {
    if (availableParticipants && participantId) {
      const foundData = availableParticipants.find((participant) => participant.id === participantId);
      setSelectedParticipant(foundData);
      if (!foundData) {
        setNotFound(true);
      }
    } else {
      setSelectedParticipant(undefined);
    }
  }, [availableParticipants, participantId]);

  useEffect(() => {
    const request = dispatch(requestListParticipants({}));
    setRequestId(request.requestId);
  }, [dispatch]);

  useEffect(() => {
    if (!participantListRequest) {
      return;
    }

    if (participantListRequest.status === 'success' && participantListRequest.data) {
      setAvailableParticipants(participantListRequest.data);
    } else if (participantListRequest.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [participantListRequest, snackbar]);

  return useMemo(
    () => ({ availableParticipants, isBusy, notFound, selectedParticipant }),
    [availableParticipants, isBusy, notFound, selectedParticipant]
  );
};
