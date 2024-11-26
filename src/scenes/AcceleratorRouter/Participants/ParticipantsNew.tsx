import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Page from 'src/components/Page';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { requestUpdateParticipantProject } from 'src/redux/features/participantProjects/participantProjectsAsyncThunks';
import { requestCreateParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantCreateRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ParticipantCreateRequest } from 'src/types/Participant';
import { ParticipantProject } from 'src/types/ParticipantProject';
import useSnackbar from 'src/utils/useSnackbar';

import ParticipantForm from './ParticipantForm';

export default function ParticipantsNew(): JSX.Element {
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantCreateRequest(requestId));

  const { goToParticipant, goToParticipantsList } = useNavigateTo();

  const onSave = useCallback(
    (createRequest: ParticipantCreateRequest, projectsDetails: ParticipantProject[]) => {
      const request = dispatch(requestCreateParticipant(createRequest));
      setRequestId(request.requestId);
      projectsDetails.forEach((pd) => {
        dispatch(requestUpdateParticipantProject(pd));
      });
    },
    [dispatch]
  );

  const participant = useMemo<ParticipantCreateRequest>(
    () => ({
      name: '',
      cohortId: 0,
      projectIds: [],
    }),
    []
  );

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      goToParticipant(result.data!.id);
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [goToParticipant, result, snackbar]);

  return (
    <Page title={strings.ADD_PARTICIPANT} contentStyle={{ display: 'flex', flexDirection: 'column' }}>
      <ParticipantForm<ParticipantCreateRequest>
        busy={result?.status === 'pending'}
        onCancel={goToParticipantsList}
        onSave={onSave}
        participant={participant}
      />
    </Page>
  );
}
