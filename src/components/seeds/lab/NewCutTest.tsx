import MomentUtils from '@date-io/moment';
import { Box, Chip, Grid, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Accession } from 'src/api/types/accessions';
import strings from 'src/strings';
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
    },
  })
);

export interface Props {
  accession: Accession;
  open: boolean;
  onClose: (value?: Accession) => void;
}

export default function NewCutTest(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<Accession>(props.accession);

  React.useEffect(() => {
    if (props.open) {
      setRecord(props.accession);
    }
  }, [props.accession, props.open, setRecord]);

  const handleCancel = () => {
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  return (
    <Dialog onClose={handleCancel} disableEscapeKeyDown open={open} maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6'>Cut test</Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                id='cutTestSeedsFilled'
                value={record.cutTestSeedsFilled}
                onChange={onChange}
                label={strings.FILLED_SEEDS}
                aria-label='Filled seeds'
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='cutTestSeedsEmpty'
                value={record.cutTestSeedsEmpty}
                onChange={onChange}
                label={strings.EMPTY_SEEDS}
                aria-label='Empty seeds'
                type='number'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id='cutTestSeedsCompromised'
                value={record.cutTestSeedsCompromised}
                onChange={onChange}
                label={strings.COMPROMISED_SEEDS}
                aria-label='Compromised seeds'
                type='number'
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveCutTest'
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
