import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import DialogBox, { Props as DialogBoxProps } from '@terraware/web-components/components/DialogBox/DialogBox';

const useStyles = makeStyles(() => ({
  dialogBox: {
    '& .dialog-box-container': {
      overflow: 'auto',
    },
    '& .dialog-box': {
      maxHeight: 'none',
    },
  },
}));

export default function ScrollableDialogBox(props: DialogBoxProps): JSX.Element {
  const classes = useStyles();
  return (
    <Box display='flex' flexDirection='row' className={classes.dialogBox}>
      <DialogBox {...props} />
    </Box>
  );
}
