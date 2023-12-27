import strings from 'src/strings';
import { Box, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DialogBox } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
  icon: {
    width: '150px',
    height: '150px',
  },
}));

export type BoundaryInstructionsModalProps = {
  description: string;
  link: string;
  open: boolean;
  onClose: (dontShowAgain?: boolean) => void;
  title: string;
};

export default function BoundaryInstructionsModal(props: BoundaryInstructionsModalProps): JSX.Element {
  const { description, link, open, onClose, title } = props;
  const classes = useStyles();

  return (
    <DialogBox
      scrolled
      onClose={() => onClose()}
      open={open}
      title={title}
      size={'large'}
      middleButtons={[
        <Button
          onClick={() => onClose(true)}
          id='dont-show-again'
          label={strings.DONT_SHOW_AGAIN}
          priority='secondary'
          type='passive'
          className={classes.buttonSpacing}
          key='button-1'
        />,
        <Button onClick={() => onClose()} id='next' label={strings.CLOSE} key='button-2' />,
      ]}
    >
      <Box display='flex' flexDirection='column'>
        <Typography textAlign='center' marginBottom={2}>
          {description}
        </Typography>
        <iframe
          width='100%'
          height='320px'
          src={link}
          title={title}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
        />
      </Box>
    </DialogBox>
  );
}
