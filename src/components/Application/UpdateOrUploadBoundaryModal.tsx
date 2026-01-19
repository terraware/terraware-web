import React, { type JSX, useCallback, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';

import strings from 'src/strings';
import { getRgbaFromHex } from 'src/utils/color';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type UpdateOrUploadBoundaryModalProps = {
  open: boolean;
  onClose: () => void;
  onNext: (type: 'Upload' | 'Update') => void;
};

export default function UpdateOrUploadBoundaryModal(props: UpdateOrUploadBoundaryModalProps): JSX.Element {
  const { open, onClose, onNext } = props;
  const theme = useTheme();
  const [type, setType] = useState<'Upload' | 'Update'>();
  const { isMobile } = useDeviceInfo();

  const handleClose = useCallback(() => {
    setType(undefined);
    onClose();
  }, [setType, onClose]);

  const handleNext = useCallback(() => {
    if (type !== undefined) {
      onNext(type);
    }
    handleClose();
  }, [handleClose, onNext, type]);

  return (
    <DialogBox
      scrolled
      onClose={handleClose}
      open={open}
      title={strings.ADD_PROPOSED_PROJECT_BOUNDARY}
      size={'x-large'}
      middleButtons={[
        <Button
          onClick={handleClose}
          id='cancel'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          key='button-1'
          style={{ marginRight: theme.spacing(2) }}
        />,
        <Button onClick={handleNext} id='next' label={strings.NEXT} key='button-2' disabled={type === undefined} />,
      ]}
    >
      <Box display='flex' flexDirection='column'>
        <Box display='flex' flexDirection={isMobile ? 'column' : 'row'} gap={3}>
          <BoundaryTypeSelector
            imageName='upload-cloud@2x.png'
            description={strings.UPLOAD_SPATIAL_FILES}
            isSelected={type === 'Upload'}
            onClick={() => setType('Upload')}
            title={strings.UPLOAD_A_MAP_OF_THE_PROJECT_BOUNDARY}
          />
          <BoundaryTypeSelector
            imageName='select-planting-site-simple@2x.png'
            description={strings.DRAW_BOUNDARY_WITHIN_MAP}
            isSelected={type === 'Update'}
            onClick={() => setType('Update')}
            title={strings.DRAW_PROPOSED_PROJECT_BOUNDARY}
          />
        </Box>
      </Box>
    </DialogBox>
  );
}

type BoundaryTypeButtonProps = {
  imageName: string;
  isSelected: boolean;
  onClick: () => void;
};

const BoundaryTypeButton = ({ imageName, isSelected, onClick }: BoundaryTypeButtonProps): JSX.Element => {
  const theme = useTheme();

  const rgb = useCallback(
    (opacity: number): string => getRgbaFromHex(theme.palette.TwClrBgSelected as string, opacity / 100),
    [theme]
  );

  return (
    <Box
      width='192px'
      height='192px'
      padding='10px'
      borderRadius={theme.spacing(3)}
      border={`2px solid ${theme.palette.TwClrBrdrTertiary}`}
      margin='0 auto'
      display='flex'
      justifyContent='center'
      sx={{
        cursor: 'pointer',
        backgroundColor: rgb(isSelected ? 100 : 0),
        '&:hover': { backgroundColor: rgb(isSelected ? 100 : 10) },
        '&:active': { backgroundColor: rgb(isSelected ? 100 : 20) },
      }}
      onClick={onClick}
    >
      <Box
        width='160px'
        height='160px'
        margin='auto'
        borderRadius='8px'
        sx={{
          backgroundImage: `url(/assets/${imageName})`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          '&:active': { border: `1px solid ${theme.palette.TwClrBgSelected}` },
        }}
      />
    </Box>
  );
};

type BoundaryTypeSelectorProps = BoundaryTypeButtonProps & {
  description: string;
  title: string;
};

const BoundaryTypeSelector = (props: BoundaryTypeSelectorProps): JSX.Element => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const { description, title } = props;
  const { ...buttonProps }: BoundaryTypeButtonProps = props;

  return (
    <Box minWidth={isMobile ? 'auto' : '350px'} display='flex' flexDirection='column'>
      <BoundaryTypeButton {...buttonProps} />
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} textAlign='center' margin={theme.spacing(2, 0, 3)}>
        {title}
      </Typography>
      <Typography fontSize='16px' lineHeight='24px' fontWeight={400} textAlign='center' whiteSpace='pre-wrap'>
        {description}
      </Typography>
    </Box>
  );
};
