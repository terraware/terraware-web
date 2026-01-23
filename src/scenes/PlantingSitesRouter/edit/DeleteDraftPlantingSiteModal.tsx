import React, { type JSX, useEffect, useState } from 'react';

import { Typography } from '@mui/material';
import { BusySpinner, Button, DialogBox } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { selectDraftPlantingSiteEdit } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestDeleteDraft } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import useSnackbar from 'src/utils/useSnackbar';

export type Props = {
  plantingSite: DraftPlantingSite;
  onClose: () => void;
};

export default function DeleteDraftPlantingSiteModal(props: Props): JSX.Element {
  const { onClose, plantingSite } = props;
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectDraftPlantingSiteEdit(requestId));

  const deleteHandler = () => {
    const request = dispatch(requestDeleteDraft(plantingSite.id));
    setRequestId(request.requestId);
  };

  useEffect(() => {
    if (result?.status === 'success') {
      snackbar.toastSuccess(strings.PLANTING_SITE_DELETED);
      navigate(APP_PATHS.PLANTING_SITES);
    } else if (result?.status === 'error') {
      snackbar.toastError();
    }
  }, [navigate, result?.status, snackbar]);

  return (
    <>
      {result?.status === 'pending' && <BusySpinner withSkrim={true} />}
      <DialogBox
        onClose={onClose}
        open={true}
        title={strings.DELETE_PLANTING_SITE}
        size='medium'
        middleButtons={[
          <Button
            id='cancelDeletePlantingSite'
            label={strings.CANCEL}
            type='passive'
            onClick={onClose}
            priority='secondary'
            key='button-1'
          />,
          <Button
            id='saveDeletePlantingSite'
            onClick={deleteHandler}
            type='destructive'
            label={strings.DELETE}
            key='button-2'
          />,
        ]}
        message={strings.formatString(strings.DELETE_PLANTING_SITE_MESSAGE, plantingSite.name)}
        skrim={true}
      >
        <Typography sx={{ paddingTop: 3 }}>{strings.ARE_YOU_SURE}</Typography>
      </DialogBox>
    </>
  );
}
