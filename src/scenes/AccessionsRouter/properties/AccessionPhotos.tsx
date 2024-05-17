import React from 'react';

import { Box, useTheme } from '@mui/material';

import SelectPhotos from 'src/components/common/SelectPhotos';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const MAX_PHOTOS = 10;

type Props = {
  onPhotosChanged: (photos: File[]) => void;
};

export default function AccessionPhotos({ onPhotosChanged }: Props): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  return (
    <>
      <label
        htmlFor='photo-chooser'
        style={{
          color: theme.palette.TwClrTxtSecondary,
          display: 'block',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: '20px',
          marginBottom: '4px',
          maxWidth: '100%',
          width: '100%',
        }}
      >
        {strings.PHOTOS}
      </label>
      <Box sx={{ margin: `-${theme.spacing(3)}` }}>
        <SelectPhotos multipleSelection={true} onPhotosChanged={onPhotosChanged} maxPhotos={MAX_PHOTOS} />
      </Box>
    </>
  );
}
