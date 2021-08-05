import { Box, Chip, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { PlantForTable } from '.';
import { deleteFeature } from '../../api/features';
import { deletePlant } from '../../api/plants';
import { plantsPlantedFeaturesSelector } from '../../state/selectors/plantsPlantedFeatures';
import sessionSelector from '../../state/selectors/session';
import speciesNamesSelector from '../../state/selectors/speciesNames';
import strings from '../../strings';
import CancelButton from '../common/CancelButton';
import DialogCloseButton from '../common/DialogCloseButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
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
  const session = useRecoilValue(sessionSelector);
  const resetSpecies = useResetRecoilState(speciesNamesSelector);
  const resetFeatures = useResetRecoilState(plantsPlantedFeaturesSelector);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = async () => {
    if (session && plant.featureId) {
      await deletePlant(session, plant.featureId);
      await deleteFeature(session, plant.featureId);
      resetSpecies();
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
            <CancelButton onClick={handleCancel} />
            <Chip
              id='delete'
              className={classes.submit}
              label={strings.DELETE}
              clickable
              color='secondary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
