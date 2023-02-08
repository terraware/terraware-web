import { Box, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { useEffect, useState } from 'react';
import { NurseryWithdrawalService } from 'src/services';
import useSnackbar from 'src/utils/useSnackbar';
import ViewPhotosModal from 'src/components/common/ViewPhotosModal';

const NURSERY_WITHDRAWAL_PHOTO_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos/{photoId}';

type PhotosSectionProps = {
  withdrawalId?: number;
};

export default function Photos({ withdrawalId }: PhotosSectionProps): JSX.Element {
  const theme = useTheme();
  const snackbar = useSnackbar();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photosModalOpened, setPhotosModalOpened] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);

  useEffect(() => {
    const getPhotos = async () => {
      const photoListResponse = await NurseryWithdrawalService.getWithdrawalPhotosList(withdrawalId!!);
      if (!photoListResponse.requestSucceeded || photoListResponse.error) {
        setPhotoUrls([]);
        snackbar.toastError(photoListResponse.error);
      } else {
        const photoUrlArray: string[] = [];
        photoListResponse.photoIds?.forEach(({ id }) => {
          photoUrlArray.push(
            NURSERY_WITHDRAWAL_PHOTO_ENDPOINT.replace('{withdrawalId}', withdrawalId!!.toString()).replace(
              '{photoId}',
              id.toString()
            )
          );
        });
        setPhotoUrls(photoUrlArray);
      }
    };

    if (withdrawalId) {
      getPhotos();
    }
  }, [withdrawalId, snackbar]);

  return (
    <>
      <ViewPhotosModal
        photosUrls={photoUrls}
        open={photosModalOpened}
        onClose={() => setPhotosModalOpened(false)}
        selectedSlide={selectedSlide}
      />
      <Typography fontSize='20px' fontWeight={600}>
        {strings.PHOTOS}
      </Typography>
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
