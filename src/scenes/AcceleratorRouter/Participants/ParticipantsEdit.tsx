import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipant } from 'src/hooks/useParticipant';
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
  const { isBusy, isError, participant } = useParticipant(participantId);

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantUpdateRequest(requestId));

  const { goToParticipant, goToParticipantsList } = useNavigateTo();

  const onSave = useCallback(
    (updateRequest: ParticipantUpdateRequest) => {
      const request = dispatch(requestUpdateParticipant({ participantId, request: updateRequest }));
      setRequestId(request.requestId);
    },
    [dispatch, participantId]
  );

  const updateData = useMemo<ParticipantUpdateRequest>(
    () => ({
      name: participant?.name ?? '',
      cohortId: participant?.cohortId ?? 0,
      projectIds: participant?.projects.map((project) => project.projectId) ?? [],
    }),
    [participant]
  );

  useEffect(() => {
    if (isNaN(participantId) || isError) {
      goToParticipantsList();
    }
  }, [goToParticipantsList, isError, participantId]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      goToParticipant(participantId);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [goToParticipant, participantId, result?.status, snackbar]);

  return (
    <Page title={participant?.name ?? ''} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      {isBusy && <BusySpinner />}
      <ParticipantForm<ParticipantUpdateRequest>
        busy={result?.status === 'pending'}
        onCancel={goToParticipantsList}
        onSave={onSave}
        participant={updateData}
        existingProjects={participant?.projects}
      />
    </Page>
  );
}
