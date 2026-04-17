import React, { type JSX, useCallback, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

type CreateVirtualWalkthroughStep2ModalProps = {
  file: File;
  isUploading: boolean;
  onClose: () => void;
  onUpload: () => void;
};

const CreateVirtualWalkthroughStep2Modal = ({
  file,
  isUploading,
  onClose,
  onUpload,
}: CreateVirtualWalkthroughStep2ModalProps): JSX.Element => {
  const theme = useTheme();

  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);

  const handleUpload = useCallback(() => {
    onUpload();
  }, [onUpload]);

  return (
    <DialogBox
      onClose={onClose}
      open
      title={strings.CREATE_VIRTUAL_WALKTHROUGH}
      size='large'
      middleButtons={[
        <Button
          key='cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          disabled={isUploading}
        />,
        <Button key='upload' label={strings.UPLOAD} onClick={handleUpload} disabled={isUploading} />,
      ]}
    >
      {isUploading && <BusySpinner withSkrim={true} />}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
        <Typography sx={{ color: theme.palette.TwClrTxt, fontSize: '16px' }}>
          {strings.CREATE_VIRTUAL_WALKTHROUGH_STEP2_DESCRIPTION}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <video
            src={previewUrl}
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }}
          />
        </Box>
      </Box>
    </DialogBox>
  );
};

export default CreateVirtualWalkthroughStep2Modal;
