import { Box, Chip, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import strings from 'src/strings';
import { SpeciesType } from 'src/types/SpeciesType';
import useForm from 'src/utils/useForm';
import CancelButton from '../../common/CancelButton';
import DialogCloseButton from '../../common/DialogCloseButton';
import TextField from '../../common/TextField';

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
  onClose: (species?: SpeciesType) => void;
  value: SpeciesType;
}

export default function EditSpeciesModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<SpeciesType>(props.value);

  React.useEffect(() => {
    if (props.open) {
      setRecord(props.value);
    }
  }, [props.open]);

  const handleCancel = () => {
    setRecord(props.value);
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='md'
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>Edit Species</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id='name'
              value={record.name}
              onChange={onChange}
              label={strings.SPECIES_NAME}
              aria-label='Species Name'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveSpecies'
              className={classes.submit}
              label={strings.SAVE_CHANGES}
              clickable
              color='primary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
