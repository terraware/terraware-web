import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import Page from 'src/components/Page';
import useNavigateToParticipants from 'src/hooks/navigation/useNavigateToParticipants';
import { useParticipants } from 'src/hooks/useParticipants';
import { requestUpdateParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantUpdateRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ParticipantUpdateRequest } from 'src/types/Participant';
import useSnackbar from 'src/utils/useSnackbar';

import ParticipantForm from './ParticipantForm';

export default function ParticipantsNew(): JSX.Element {
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const pathParams = useParams<{ participantId: string }>();
  const participantId = Number(pathParams.participantId);
  const { isBusy, notFound, selectedParticipant } = useParticipants(participantId);

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantUpdateRequest(requestId));

  const goToParticipantsList = useNavigateToParticipants();

  const onSave = useCallback(
    (updateRequest: ParticipantUpdateRequest) => {
      const request = dispatch(requestUpdateParticipant(updateRequest));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const participant = useMemo<ParticipantUpdateRequest>(
    () => ({
      id: selectedParticipant?.id ?? 0,
      name: selectedParticipant?.name ?? '',
      cohort_id: selectedParticipant?.cohort_id ?? 0,
      project_ids: selectedParticipant?.projects.map((project) => project.id) ?? [],
    }),
    [selectedParticipant]
  );

  useEffect(() => {
    if (isNaN(participantId) || notFound) {
      goToParticipantsList();
    }
  }, [goToParticipantsList, notFound, participantId]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      goToParticipantsList();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [goToParticipantsList, result?.status, snackbar]);

  return (
    <Page title={participant?.name ?? ''} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {isBusy && <BusySpinner />}
      <ParticipantForm<ParticipantUpdateRequest>
        busy={result?.status === 'pending'}
        onCancel={goToParticipantsList}
        onSave={onSave}
        participant={participant}
      />
    </Page>
  );
}
