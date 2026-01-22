import React, { type JSX, useState } from 'react';

import { Box, useTheme } from '@mui/material';
import { ViewPhotosDialog } from '@terraware/web-components';

import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type PhotosListProps = {
  photoUrls: string[];
  initialSlide?: number;
  fillSpace?: boolean;
};

export default function PhotosList({ photoUrls, initialSlide, fillSpace }: PhotosListProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const [selectedSlide, setSelectedSlide] = useState<number>(initialSlide ?? 0);
  const [photosModalOpened, setPhotosModalOpened] = useState<boolean>(false);
  const theme = useTheme();

  return (
    <>
      <ViewPhotosDialog
        photos={photoUrls.map((url) => ({ url }))}
        open={photosModalOpened}
        onClose={() => setPhotosModalOpened(false)}
        initialSelectedSlide={selectedSlide}
        nextButtonLabel={strings.NEXT}
        prevButtonLabel={strings.PREVIOUS}
        title={strings.PHOTOS}
      />
      <Box display='flex' flexDirection='row' flexWrap='wrap' marginBottom={2} minHeight={fillSpace ? 122 : 'auto'}>
        {photoUrls.map((photoUrl, index) => (
          <Box
            key={index}
            display='flex'
            position='relative'
            height={122}
            width={122}
            marginRight={isMobile ? 2 : 3}
            marginTop={1}
            border={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
            sx={{ cursor: 'pointer' }}
          >
            <img
              src={`${photoUrl}?maxHeight=120`}
              alt={`${index}`}
              onClick={() => {
                setSelectedSlide(index);
                setPhotosModalOpened(true);
              }}
              style={{
                margin: 'auto auto',
                objectFit: 'contain',
                display: 'flex',
                maxWidth: '120px',
                maxHeight: '120px',
              }}
            />
          </Box>
        ))}
      </Box>
    </>
  );
}
