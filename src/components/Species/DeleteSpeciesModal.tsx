import { makeStyles } from '@mui/styles';
import React from 'react';
import strings from 'src/strings';
import Button from '../common/button/Button';
import DialogBox from '../common/DialogBox/DialogBox';

const useStyles = makeStyles(() => ({
  mainContent: {
    color: '#3A4445',
    fontSize: '16px',
  },
}));

export interface DeleteSpeciesDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function DeleteSpeciesDialog(props: DeleteSpeciesDialogProps): JSX.Element {
  const classes = useStyles();
  const { onClose, open, onSubmit } = props;

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.DELETE_SPECIES}
      size='medium'
      middleButtons={[
        <Button
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          size='medium'
          key='button-1'
        />,
        <Button label={strings.DELETE} type='destructive' onClick={onSubmit} size='medium' key='button-2' />,
      ]}
    >
      <p className={classes.mainContent}>{strings.DELETE_CONFIRMATION_MODAL_MAIN_TEXT}</p>
    </DialogBox>
  );
}
