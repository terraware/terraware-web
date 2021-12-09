import { Snackbar, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { DeleteOutline } from '@material-ui/icons';
import CheckIcon from '@material-ui/icons/Check';
import { useRecoilState } from 'recoil';
import snackbarAtom from 'src/state/snackbar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    success: {
      backgroundColor: theme.palette.green[50],
      display: 'flex',
      border: `1px solid ${theme.palette.green[600]}`,
      padding: '8px',
      width: '1000px',
    },
    delete: {
      backgroundColor: theme.palette.red[50],
      display: 'flex',
      border: `1px solid ${theme.palette.red[600]}`,
      padding: '8px',
      width: '1000px',
    },
    snackbarText: {
      paddingLeft: '5px',
    },
  })
);

export default function SnackbarMessage(): JSX.Element {
  const classes = useStyles();

  const [snackbar, setSnackbar] = useRecoilState(snackbarAtom);

  const handleClose = () => {
    if (snackbar) {
      setSnackbar({ ...snackbar, msg: '' });
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      open={Boolean(snackbar.msg && snackbar.type)}
      onClose={handleClose}
      autoHideDuration={3000}
      id='snackbar'
    >
      <div className={classes[snackbar.type]}>
        {snackbar.type === 'success' && <CheckIcon />}
        {snackbar.type === 'delete' && <DeleteOutline />}
        <Typography component='p' variant='body1' className={classes.snackbarText}>
          {snackbar.msg}
        </Typography>
      </div>
    </Snackbar>
  );
}
