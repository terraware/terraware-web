import { useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ViewPhotosDialog } from '@terraware/web-components';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type StyleProps = {
  isMobile: boolean;
};

const useStyles = makeStyles(() => ({
  thumbnail: {
    objectFit: 'cover',
    display: 'flex',
    width: (props: StyleProps) => (props.isMobile ? '105px' : '220px'),
    height: '120px',
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
  const classes = useStyles({ isMobile });

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
      <Box display='flex' flexWrap='wrap'>
        {photoUrls.map((photoUrl, index) => (
          <Box
            key={index}
            marginRight={theme.spacing(isMobile ? 2 : 3)}
            marginTop={theme.spacing(2)}
            width={isMobile ? '105px' : '220px'}
            height='120px'
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
