import { Box, Theme, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import useSnackbar from 'src/utils/useSnackbar';
import ReportService, { REPORT_PHOTO_ENDPOINT } from 'src/services/ReportService';
import { Button, ViewPhotosDialog } from '@terraware/web-components';
import { makeStyles } from '@mui/styles';
import { ReportPhoto } from 'src/types/Report';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';

type PhotosSectionProps = {
  reportId: number;
  onPhotoRemove?: (id: number) => void;
  editable: boolean;
};

type ReportPhotoWithUrl = ReportPhoto & { url: string };

const useStyles = makeStyles((theme: Theme) => ({
  removePhoto: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: theme.palette.TwClrBgDanger,
  },
  thumbnail: {
    margin: 'auto auto',
    objectFit: 'contain',
    display: 'flex',
    maxWidth: '120px',
    maxHeight: '120px',
  },
}));

export default function ViewPhotos({ reportId, onPhotoRemove, editable }: PhotosSectionProps): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [photos, setPhotos] = useState<ReportPhotoWithUrl[]>([]);
  const [photosModalOpened, setPhotosModalOpened] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const classes = useStyles();
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const getPhotos = async () => {
      const photoListResponse = await ReportService.getReportPhotos(reportId);
      if (!photoListResponse.requestSucceeded || photoListResponse.error) {
        setPhotos([]);
        snackbar.toastError();
      } else {
        const photosWithUrl: ReportPhotoWithUrl[] =
          photoListResponse.photos?.map((photo) => {
            return {
              ...photo,
              url: REPORT_PHOTO_ENDPOINT.replace('{reportId}', reportId.toString()).replace(
                '{photoId}',
                photo.id.toString()
              ),
            };
          }) || [];

        setPhotos(photosWithUrl);
      }
    };

    getPhotos();
  }, [reportId, snackbar]);

  const closeHandler = () => {
    setPhotosModalOpened(false);
    setSelectedSlide(0);
  };

  const removePhoto = (id: number, index: number) => {
    photos.splice(index, 1);
    if (onPhotoRemove) {
      onPhotoRemove(id);
    }
  };

  return (
    <>
      <ViewPhotosDialog
        photos={photos.map((photo) => ({ url: photo.url }))}
        open={photosModalOpened}
        onClose={closeHandler}
        initialSelectedSlide={selectedSlide}
        nextButtonLabel={strings.NEXT}
        prevButtonLabel={strings.PREVIOUS}
        title={strings.PHOTOS}
      />
      <Box display='flex' flexWrap='wrap' flexDirection='row'>
        {photos.map((photo, index) => (
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
            {editable && (
              <Button
                icon='iconTrashCan'
                onClick={() => removePhoto(photo.id, index)}
                size='small'
                className={classes.removePhoto}
              />
            )}
            <img
              className={classes.thumbnail}
              src={`${photo.url}?maxHeight=120&maxWidth=120`}
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
