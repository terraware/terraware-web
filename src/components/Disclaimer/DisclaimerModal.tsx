import React, { useCallback, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { DialogBoxSize } from '@terraware/web-components/components/DialogBox/DialogBox';
import { useDeviceInfo } from '@terraware/web-components/utils';

import Checkbox from 'src/components/common/Checkbox';
import DialogBox from 'src/components/common/ScrollableDialogBox';
import Button from 'src/components/common/button/Button';
import { useLocalization } from 'src/providers';
import { useDisclaimerData } from 'src/providers/Disclaimer/Context';
import strings from 'src/strings';

type DisclaimerModalProps = {
  onCancel?: () => void;
  onConfirm?: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DisclaimerModal = ({ open, setOpen, onCancel, onConfirm }: DisclaimerModalProps) => {
  const { activeLocale } = useLocalization();
  const { disclaimer } = useDisclaimerData();
  const { isMobile, isTablet } = useDeviceInfo();
  const theme = useTheme();

  const [agreed, setAgreed] = useState(false);

  const onClose = useCallback(() => {
    onCancel?.();
    setOpen(false);
  }, [setOpen, onCancel]);

  const dialogSize = useMemo((): DialogBoxSize => {
    if (isMobile) {
      return 'small';
    } else if (isTablet) {
      return 'large';
    } else {
      return 'xx-large';
    }
  }, [isMobile, isTablet]);

  const cancelButton = useMemo(() => {
    if (onCancel && activeLocale) {
      return [
        <Button
          id='disclaimer-cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onCancel}
          key='button-1'
        />,
      ];
    } else {
      return [];
    }
  }, [activeLocale, onCancel]);

  const confirmButton = useMemo(() => {
    if (onConfirm && activeLocale) {
      return [
        <Button
          id='disclaimer-confirm'
          disabled={!agreed}
          label={strings.CONFIRM}
          onClick={onConfirm}
          key='button-2'
        />,
      ];
    } else {
      return [];
    }
  }, [activeLocale, agreed, onConfirm]);

  return (
    <DialogBox
      onClose={onClose}
      open={open}
      title={strings.FUNDER_DISCLAIMER_TITLE}
      scrolled
      size={dialogSize}
      middleButtons={[...cancelButton, ...confirmButton]}
    >
      <Typography fontSize={'16px'} fontWeight={400} textAlign={'start'} whiteSpace='pre-wrap'>
        {disclaimer?.content}
      </Typography>

      {onConfirm && (
        <Box
          marginY={theme.spacing(4)}
          alignItems={'start'}
          justifyContent={'start'}
          alignSelf={'start'}
          textAlign={'start'}
        >
          <Checkbox
            id='disclaimer-agree'
            name={strings.FUNDER_DISCLAIMER_CHECKBOX}
            label={strings.FUNDER_DISCLAIMER_CHECKBOX}
            value={agreed}
            onChange={setAgreed}
          />
        </Box>
      )}
    </DialogBox>
  );
};

export default DisclaimerModal;
