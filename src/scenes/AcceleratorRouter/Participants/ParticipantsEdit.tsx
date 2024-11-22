import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import PageWithModuleTimeline from 'src/components/common/PageWithModuleTimeline';
import useListCohortModules from 'src/hooks/useListCohortModules';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useParticipant } from 'src/hooks/useParticipant';
import { requestUpdateParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { requestUpdateParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantUpdateRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ParticipantUpdateRequest } from 'src/types/Participant';
import { ParticipantProject } from 'src/types/ParticipantProject';
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

  const { cohortModules, listCohortModules } = useListCohortModules();

  useEffect(() => {
    if (participant && participant.cohortId) {
      void listCohortModules(participant.cohortId);
    }
  }, [participant, listCohortModules]);

  const onSave = useCallback(
    (updateRequest: ParticipantUpdateRequest, projectsDetails: ParticipantProject[]) => {
      const request = dispatch(requestUpdateParticipant({ participantId, request: updateRequest }));
      setRequestId(request.requestId);
      projectsDetails.forEach((pd) => {
        dispatch(requestUpdateParticipantProject(pd));
      });
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
    <PageWithModuleTimeline
      title={participant?.name ?? ''}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
      modules={cohortModules ?? []}
      cohortPhase={participant?.cohortPhase}
    >
      {isBusy && <BusySpinner />}
      <ParticipantForm<ParticipantUpdateRequest>
        busy={result?.status === 'pending'}
        onCancel={() => goToParticipant(participantId)}
        onSave={onSave}
        participant={updateData}
        existingProjects={participant?.projects}
      />
    </PageWithModuleTimeline>
  );
}
