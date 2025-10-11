import React, { useCallback, useEffect } from 'react';

import { Box, IconButton, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

type ImageLightboxProps = {
  imageAlt?: string;
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
};

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageAlt = '', imageSrc, isOpen, onClose }) => {
  const theme = useTheme();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // close lightbox on ESC key press
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      // only close if clicking the backdrop, not the image
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      onClick={handleBackdropClick}
      sx={{
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        left: 0,
        padding: theme.spacing(2),
        position: 'fixed',
        right: 0,
        top: 0,
        zIndex: 9999,
      }}
    >
      <IconButton
        onClick={onClose}
        size='large'
        sx={{
          fill: '#ccc',
          height: '48px',
          position: 'absolute',
          right: '8px',
          top: '8px',
          width: '48px',
          '&:hover': { fill: '#fff' },
        }}
      >
        <Icon name='close' size='medium' />
      </IconButton>

      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          maxHeight: '90vh',
          maxWidth: '90vw',
        }}
      >
        <img
          alt={imageAlt}
          src={imageSrc}
          style={{
            // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            maxHeight: '90vh',
            maxWidth: '90vw',
            objectFit: 'contain',
          }}
        />
      </Box>
    </Box>
  );
};

export default ImageLightbox;
