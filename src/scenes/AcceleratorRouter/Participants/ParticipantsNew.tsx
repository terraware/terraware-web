import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { requestCreateParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantCreateRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ParticipantCreateRequest } from 'src/types/Participant';
import useSnackbar from 'src/utils/useSnackbar';

import ParticipantForm from './ParticipantForm';

export default function ParticipantsNew(): JSX.Element {
  const history = useHistory();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantCreateRequest(requestId));

  const goToParticipantsList = useCallback(() => {
    history.push({
      pathname: APP_PATHS.ACCELERATOR_OVERVIEW,
      search: 'tab=participants',
    });
  }, [history]);

  const onSave = useCallback(
    (createRequest: ParticipantCreateRequest) => {
      const request = dispatch(requestCreateParticipant(createRequest));
      setRequestId(request.requestId);
    },
    [dispatch]
  );

  const participant = useMemo<ParticipantCreateRequest>(
    () => ({
      name: '',
      cohort_id: 0,
      project_ids: [],
    }),
    []
  );

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      goToParticipantsList();
      snackbar.toastSuccess(strings.CHANGES_SAVED);
    }
  }, [goToParticipantsList, result?.status, snackbar]);

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
