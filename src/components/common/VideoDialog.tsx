import React, { type JSX } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';

export type VideoDialogProps = {
  description: string | JSX.Element[];
  link: string;
  open: boolean;
  onClose: () => void;
  onDontShowAgain?: () => void;
  title: string;
};

export default function VideoDialog(props: VideoDialogProps): JSX.Element {
  const { description, link, open, onClose, onDontShowAgain, title } = props;
  const theme = useTheme();

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
        key='button-1'
        style={{ marginRight: theme.spacing(2) }}
      />
    );

    const closeButton: JSX.Element = <Button onClick={onClose} id='close' label={strings.CLOSE} key='button-2' />;

    return onDontShowAgain ? [dontShowAgainButton, closeButton] : [closeButton];
  };

  return (
    <DialogBox scrolled onClose={onClose} open={open} title={title} size={'large'} middleButtons={buttons()}>
      <Box display='flex' flexDirection='column'>
        <Typography margin={theme.spacing(0, 'auto', 2)} display='inline-block'>
          {description}
        </Typography>
        <iframe
          width='100%'
          height='320px'
          src={link}
          title={title}
          frameBorder='0'
          allow='autoplay; fullscreen; picture-in-picture;'
          allowFullScreen
        />
      </Box>
    </DialogBox>
  );
}
