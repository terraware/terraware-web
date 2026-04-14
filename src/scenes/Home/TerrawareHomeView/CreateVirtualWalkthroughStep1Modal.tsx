import React, { type JSX, useState } from 'react';

import { Box, List, ListItem, ListItemText, Typography, useTheme } from '@mui/material';
import { FileChooser, Icon } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import Button from 'src/components/common/button/Button';
import strings from 'src/strings';

import CreateVirtualWalkthroughStep2Modal from './CreateVirtualWalkthroughStep2Modal';

type CreateVirtualWalkthroughStep1ModalProps = {
  open: boolean;
  onClose: () => void;
};

const CreateVirtualWalkthroughStep1Modal = ({
  open,
  onClose,
}: CreateVirtualWalkthroughStep1ModalProps): JSX.Element => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [showStep2, setShowStep2] = useState(false);

  const handleSetFiles = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setShowStep2(true);
    }
  };

  const handleCloseStep2 = () => {
    setShowStep2(false);
    setSelectedFile(undefined);
  };

  const handleUpload = () => {
    // TODO: wire up upload API (upload video, associate with planting site, generate splat)
    handleCloseStep2();
    onClose();
  };

  return (
    <>
      <DialogBox
        onClose={onClose}
        open={open}
        title={strings.CREATE_VIRTUAL_WALKTHROUGH}
        size='large'
        middleButtons={[
          <Button key='cancel' label={strings.CANCEL} priority='secondary' type='passive' onClick={onClose} />,
          <Button key='upload' label={strings.UPLOAD} onClick={onClose} disabled />,
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
          <Typography sx={{ color: theme.palette.TwClrTxt, fontSize: '16px' }}>
            {strings.CREATE_VIRTUAL_WALKTHROUGH_DESCRIPTION}
          </Typography>

          {/* Recording instructions */}
          <Box
            sx={{
              background: theme.palette.TwClrBgSecondary,
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 2,
              padding: 2,
              border: `1px solid ${theme.palette.TwClrBrdrInfo}`,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, marginBottom: 1 }}>
                <Icon name='info' style={{ fill: theme.palette.TwClrIcnSecondary }} />
                <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                  {strings.HOW_TO_RECORD_A_GREAT_VIDEO}
                </Typography>
              </Box>
              <List dense disablePadding sx={{ listStyleType: 'decimal', paddingLeft: 3 }}>
                {[
                  strings.VIRTUAL_WALKTHROUGH_STEP_1,
                  strings.VIRTUAL_WALKTHROUGH_STEP_2,
                  strings.VIRTUAL_WALKTHROUGH_STEP_3,
                ].map((step, i) => (
                  <ListItem key={i} disablePadding sx={{ display: 'list-item', span: { fontSize: '16px' } }}>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </Box>

            <img alt='video diagram' src='/assets/video-diagram.svg' style={{ height: '123px', width: '123px' }} />
          </Box>

          {/* FileChooser opens the native file picker; after selection Step 2 opens automatically */}
          <FileChooser
            acceptFileType='video/mp4, video/quicktime'
            chooseFileText={strings.CHOOSE_FILES}
            multipleSelection={false}
            setFiles={handleSetFiles}
            uploadDescription={strings.UPLOAD_FILES_DESCRIPTION_FORMATS}
            uploadText={strings.UPLOAD_FILES}
          />
        </Box>
      </DialogBox>

      {showStep2 && selectedFile && (
        <CreateVirtualWalkthroughStep2Modal file={selectedFile} onClose={handleCloseStep2} onUpload={handleUpload} />
      )}
    </>
  );
};

export default CreateVirtualWalkthroughStep1Modal;
