import { Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type StatusChangeConfirmationDialogProps = {
  onClose: () => void;
  onConfirm: () => void;
};

export default function StatusChangeConfirmationDialog({
  onClose,
  onConfirm,
}: StatusChangeConfirmationDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      middleButtons={[
        <Button
          id='cancel'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button id='submit' key='button-2' label='Continue and Reset Status' onClick={onConfirm} priority='primary' />,
      ]}
      scrolled
      size='large'
      title={strings.SUBMIT_DOCUMENT}
    >
      <Typography fontSize='16px' fontWeight={400} marginBottom={theme.spacing(2)}>
        {strings.DELIVERABLE_STATUS_CHANGE_CONFIRMATION_1}
      </Typography>

      <Typography fontSize='16px' fontWeight={400}>
        {strings.DELIVERABLE_STATUS_CHANGE_CONFIRMATION_2}
      </Typography>
    </DialogBox>
  );
}
