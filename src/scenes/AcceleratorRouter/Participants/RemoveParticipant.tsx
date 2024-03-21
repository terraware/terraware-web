import { useCallback, useEffect, useState } from 'react';

import { BusySpinner, Confirm } from '@terraware/web-components';

import useNavigateTo from 'src/hooks/useNavigateTo';
import { requestDeleteParticipant } from 'src/redux/features/participants/participantsAsyncThunks';
import { selectParticipantDeleteRequest } from 'src/redux/features/participants/participantsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Participant } from 'src/types/Participant';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  onClose: () => void;
  participant: Participant;
};

export default function RemoveParticipant({ onClose, participant }: Props): JSX.Element {
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const { goToParticipantsList } = useNavigateTo();

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantDeleteRequest(requestId));

  const onConfirm = useCallback(() => {
    const request = dispatch(requestDeleteParticipant(participant.id));
    setRequestId(request.requestId);
  }, [dispatch, participant.id]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      goToParticipantsList();
    }
  }, [goToParticipantsList, result?.status, snackbar]);

  return (
    <>
      {result?.status === 'pending' && <BusySpinner withSkrim={true} />}
      <Confirm
        closeButtonText={strings.CANCEL}
        confirmButtonIcon='iconTrashCan'
        confirmButtonText={strings.REMOVE}
        confirmButtonType='destructive'
        message={strings.formatString(strings.REMOVE_PARTICIPANT_CONFIRMATION, participant.name)}
        onClose={onClose}
        onConfirm={onConfirm}
        title={strings.REMOVE_PARTICIPANT}
      />
    </>
  );
}
