import React from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

type PhotoPreviewProps = {
  imgUrl: string;
  imgAlt?: string;
  includeTrashIcon: boolean;
  onTrashClick: () => void;
};

const PhotoPreview = ({ imgUrl, imgAlt, includeTrashIcon, onTrashClick }: PhotoPreviewProps) => {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  return (
    <Box
      position='relative'
      height={122}
      width={122}
      marginRight={isMobile ? theme.spacing(2) : theme.spacing(3)}
      marginTop={theme.spacing(1)}
      border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
    >
      {includeTrashIcon && (
        <Button
          icon='iconTrashCan'
          onClick={onTrashClick}
          size='small'
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            backgroundColor: theme.palette.TwClrBgDanger,
          }}
        />
      )}
      <img
        height='120px'
        src={imgUrl}
        alt={imgAlt}
        style={{
          margin: 'auto auto',
          objectFit: 'contain',
          display: 'flex',
          maxWidth: '120px',
          maxHeight: '120px',
        }}
      />
    </Box>
  );
};

export default PhotoPreview;
