import { Box, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from 'src/components/common/button/Button';
import DialogCloseButton from 'src/components/common/DialogCloseButton';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
    },
    paper: {
      minWidth: '500px',
    },
    spacing: {
      marginRight: theme.spacing(2),
    },
  })
);

type DeletePlantConfirmationModalProps = {
  onCancel: () => void;
  confirmDelete: () => void;
};

export default function DeletePlantConfirmationModal(props: DeletePlantConfirmationModalProps): JSX.Element {
  const classes = useStyles();
  const { onCancel, confirmDelete } = props;

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={true}
      maxWidth='sm'
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>{strings.DELETE_PLANT}</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent>
        <Typography variant='body2'>
          {strings.DELETE_PLANT_CONFIRMATION_MODAL_MAIN_TEXT}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box />
          <Box>
            <Button
              onClick={handleCancel}
              id='cancel'
              label={strings.CANCEL}
              priority='secondary'
              type='passive'
              className={classes.spacing}
            />
            <Button
              onClick={confirmDelete}
              id='delete'
              label={strings.DELETE}
              type='destructive'
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
