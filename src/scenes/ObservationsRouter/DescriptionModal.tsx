import React from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

export type DescriptionModal = {
  onClose: () => void;
  description?: string;
};

const DescriptionModal = ({ onClose, description }: DescriptionModal) => {
  const theme = useTheme();
  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.DESCRIPTION_NOTES}
      size='small'
      middleButtons={[<Button id='close' label={strings.CLOSE} onClick={onClose} key='close-button' />]}
    >
      <Box textAlign='left'>
        <Typography fontSize='14px' lineHeight='28px' fontWeight={400} color={theme.palette.TwClrTxt}>
          {strings.DESCRIPTION_NOTES}
        </Typography>
        <Typography fontSize='16px' lineHeight='24px' fontWeight={500} color={theme.palette.TwClrTxt}>
          {description}
        </Typography>
      </Box>
    </DialogBox>
  );
};

export default DescriptionModal;
