import { Box, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import useSnackbar from 'src/utils/useSnackbar';
import ViewPhotosModal from 'src/components/common/ViewPhotosModal';
import ReportService, { REPORT_PHOTO_ENDPOINT } from 'src/services/ReportService';

type PhotosSectionProps = {
  reportId: number;
};

export default function ViewPhotos({ reportId }: PhotosSectionProps): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photosModalOpened, setPhotosModalOpened] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);

  useEffect(() => {
    const getPhotos = async () => {
      const photoListResponse = await ReportService.getReportPhotos(reportId);
      if (!photoListResponse.requestSucceeded || photoListResponse.error) {
        setPhotoUrls([]);
        snackbar.toastError();
      } else {
        const photoUrlArray: string[] = [];
        photoListResponse.photos?.forEach((photo) => {
          photoUrlArray.push(
            REPORT_PHOTO_ENDPOINT.replace('{reportId}', reportId.toString()).replace('{photoId}', photo.id.toString())
          );
        });

        setPhotoUrls(photoUrlArray);
      }
    };

    getPhotos();
  }, [reportId, snackbar]);

  return (
    <>
      <ViewPhotosModal
        photosUrls={photoUrls}
        open={photosModalOpened}
        onClose={() => setPhotosModalOpened(false)}
        selectedSlide={selectedSlide}
      />
      <Box display='flex' flexWrap='wrap'>
        {photoUrls.map((photoUrl, index) => (
          <Box
            key={index}
            marginRight={theme.spacing(3)}
            marginTop={theme.spacing(2)}
            maxWidth='500px'
            overflow='hidden'
            sx={{ cursor: 'pointer' }}
          >
            <img
              src={`${photoUrl}?maxHeight=250`}
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
