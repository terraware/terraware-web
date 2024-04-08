import { Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type ApproveDialogProps = {
  onClose: () => void;
  onSubmit: () => void;
};

export default function ApproveDeliverableDialog({ onClose, onSubmit }: ApproveDialogProps): JSX.Element {
  const theme = useTheme();

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      size='medium'
      title={strings.APPROVE_DELIVERABLE}
      middleButtons={[
        <Button
          id='cancelApprove'
          key='button-1'
          label={strings.CANCEL}
          onClick={onClose}
          priority='secondary'
          type='passive'
        />,
        <Button
          id='confirmApprove'
          key='button-2'
          label={strings.APPROVE}
          onClick={onSubmit}
          priority='primary'
          type='productive'
        />,
      ]}
    >
      <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
        {strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_DELIVERABLE}
      </Typography>

      <Typography fontSize='16px' fontWeight={400} lineHeight='24px' marginBottom={theme.spacing(2)}>
        {strings.ARE_YOU_SURE}
      </Typography>
    </DialogBox>
  );
}
