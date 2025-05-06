import React, { useMemo } from 'react';

import { Box, SxProps, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

type PhotoPreviewProps = {
  imgUrl: string;
  imgAlt?: string;
  includeTrashIcon: boolean;
  onTrashClick: () => void;
  imageWidth?: number;
  aspectRatio?: number; // height / width
};

const PhotoPreview = ({
  imgUrl,
  imgAlt,
  imageWidth,
  aspectRatio,
  includeTrashIcon,
  onTrashClick,
}: PhotoPreviewProps) => {
  const theme = useTheme();

  const imgSx = useMemo((): SxProps => {
    if (aspectRatio) {
      return {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        objectFit: 'cover',
      };
    } else {
      return {
        objectFit: 'contain',
        width: imageWidth ? imageWidth : '100%',
        display: 'flex',
      };
    }
  }, [aspectRatio, imageWidth]);

  return (
    <Box
      position='relative'
      width={imageWidth ? imageWidth + 2 : 122}
      height={aspectRatio && imageWidth ? aspectRatio * imageWidth + 2 : 122}
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
            zIndex: 1000,
          }}
        />
      )}
      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          height: '100%',
          paddingTop: aspectRatio && `${aspectRatio * 100}%`,
        }}
      >
        <Box
          component={'img'}
          src={imgUrl}
          alt={imgAlt}
          sx={{
            margin: 'auto auto',
            height: '100%',
            ...imgSx,
          }}
        />
      </Box>
    </Box>
  );
};

export default PhotoPreview;
