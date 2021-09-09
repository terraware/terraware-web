import { Box, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useResetRecoilState } from 'recoil';
import { PlantForTable } from '.';
import { deleteFeature } from '../../api/features';
import { deletePlant } from '../../api/plants';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import strings from '../../strings';
import Button from '../common/button/Button';
import DialogCloseButton from '../common/DialogCloseButton';

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

export interface Props {
  open: boolean;
  onClose: (deleted?: boolean) => void;
  plant: PlantForTable;
}

export default function DeletePlantConfirmationModal(
  props: Props
): JSX.Element {
  const classes = useStyles();
  const { onClose, open, plant } = props;
  const resetFeatures = useResetRecoilState(plantsPlantedFeaturesSelector);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = async () => {
    if (plant.featureId) {
      await deletePlant(plant.featureId);
      await deleteFeature(plant.featureId);
      resetFeatures();
    }
    onClose(true);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
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
              onClick={handleOk}
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
