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
  onClose: () => void;
  onDontShowAgain?: () => void;
  title: string;
};

export default function BoundaryInstructionsModal(props: BoundaryInstructionsModalProps): JSX.Element {
  const { description, link, open, onClose, onDontShowAgain, title } = props;
  const classes = useStyles();

  const buttons = (): JSX.Element[] => {
    const dontShowAgainButton: JSX.Element = (
      <Button
        onClick={() => {
          if (onDontShowAgain) {
            onDontShowAgain();
          }
        }}
        id='dont-show-again'
        label={strings.DONT_SHOW_AGAIN}
        priority='secondary'
        type='passive'
        className={classes.buttonSpacing}
        key='button-1'
      />
    );

    const closeButton: JSX.Element = <Button onClick={onClose} id='close' label={strings.CLOSE} key='button-2' />;

    return onDontShowAgain ? [dontShowAgainButton, closeButton] : [closeButton];
  };

  return (
    <DialogBox scrolled onClose={onClose} open={open} title={title} size={'large'} middleButtons={buttons()}>
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
