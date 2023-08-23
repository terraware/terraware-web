import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ViewPhotosDialog } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles(() => ({
  thumbnail: {
    margin: 'auto auto',
    objectFit: 'contain',
    display: 'flex',
    maxWidth: '120px',
    maxHeight: '120px',
  },
}));

export type PhotosListProps = {
  photoUrls: string[];
  initialSlide?: number;
};

export default function PhotosList({ photoUrls, initialSlide }: PhotosListProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const [selectedSlide, setSelectedSlide] = useState<number>(initialSlide ?? 0);
  const [photosModalOpened, setPhotosModalOpened] = useState<boolean>(false);
  const theme = useTheme();
  const classes = useStyles();

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
      <Box display='flex' flexDirection='row' flexWrap='wrap' marginBottom={2}>
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
              className={classes.thumbnail}
              src={`${photoUrl}?maxHeight=120`}
              alt={`${index}`}
              onClick={() => {
                setSelectedSlide(index);
                setPhotosModalOpened(true);
              }}
            />
          </Box>
        ))}
      </Box>
    </>
  );
}
