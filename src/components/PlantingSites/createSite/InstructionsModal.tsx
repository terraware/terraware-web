import strings from 'src/strings';
import { Box, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Button, DialogBox } from '@terraware/web-components';
import { useDocLinks } from 'src/docLinks';

const useStyles = makeStyles((theme: Theme) => ({
  buttonSpacing: {
    marginRight: theme.spacing(2),
  },
  icon: {
    width: '150px',
    height: '150px',
  },
}));

export type InstructionsModalProps = {
  open: boolean;
  onClose: (dontShowAgain: boolean) => void;
};

export default function InstructionsModal(props: InstructionsModalProps): JSX.Element {
  const { open, onClose } = props;
  const classes = useStyles();
  const docLinks = useDocLinks();

  return (
    <DialogBox
      scrolled
      onClose={() => onClose(false)}
      open={open}
      title={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
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
        <Button onClick={() => onClose(false)} id='next' label={strings.CLOSE} key='button-2' />,
      ]}
    >
      <Box display='flex' flexDirection='column'>
        <Typography textAlign='center' marginBottom={2}>
          {strings.PLANTING_SITE_CREATE_INSTRUCTIONS_DESCRIPTION}
        </Typography>
        <iframe
          width='100%'
          height='320px'
          src={docLinks.planting_site_create_instructions_video}
          title={strings.PLANTING_SITE_CREATE_INSTRUCTIONS_TITLE}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
        />
      </Box>
    </DialogBox>
  );
}
