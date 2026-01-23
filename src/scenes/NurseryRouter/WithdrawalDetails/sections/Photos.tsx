/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
import React, { type JSX, useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';

import PhotosList from 'src/components/common/PhotosList';
import { NurseryWithdrawalService } from 'src/services';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

const NURSERY_WITHDRAWAL_PHOTO_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos/{photoId}';

type PhotosSectionProps = {
  withdrawalId?: number;
};

export default function Photos({ withdrawalId }: PhotosSectionProps): JSX.Element {
  const snackbar = useSnackbar();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    const getPhotos = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const photoListResponse = await NurseryWithdrawalService.getWithdrawalPhotosList(withdrawalId!!);
      if (!photoListResponse.requestSucceeded || photoListResponse.error) {
        setPhotoUrls([]);
        snackbar.toastError();
      } else {
        const photoUrlArray: string[] = [];
        photoListResponse.photoIds?.forEach(({ id }: { id: number }) => {
          photoUrlArray.push(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
      void getPhotos();
    }
  }, [withdrawalId, snackbar]);

  return (
    <>
      <Typography fontSize='20px' fontWeight={600}>
        {strings.PHOTOS}
      </Typography>
      <Box display='flex' flexWrap='wrap'>
        <PhotosList photoUrls={photoUrls} />
      </Box>
    </>
  );
}
