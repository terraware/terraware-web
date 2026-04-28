/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
import React, { type JSX, useEffect, useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import PhotosList from 'src/components/common/PhotosList';
import { useLazyListWithdrawalPhotosQuery } from 'src/queries/generated/nurseryWithdrawals';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

const NURSERY_WITHDRAWAL_PHOTO_ENDPOINT = '/api/v1/nursery/withdrawals/{withdrawalId}/photos/{photoId}';

type PhotosSectionProps = {
  withdrawalId?: number;
};

export default function Photos({ withdrawalId }: PhotosSectionProps): JSX.Element {
  const snackbar = useSnackbar();
  const [listPhotos, listPhotosResponse] = useLazyListWithdrawalPhotosQuery();
  const photoUrls = useMemo(() => {
    if (withdrawalId && listPhotosResponse.currentData) {
      return listPhotosResponse.currentData?.photos.map((photo) =>
        NURSERY_WITHDRAWAL_PHOTO_ENDPOINT.replace('{withdrawalId}', `${withdrawalId}`).replace(
          '{photoId}',
          `${photo.id}`
        )
      );
    } else {
      return [];
    }
  }, [listPhotosResponse.currentData, withdrawalId]);

  useEffect(() => {
    if (withdrawalId) {
      void listPhotos(withdrawalId, true);
    }
  }, [withdrawalId, snackbar, listPhotos]);

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
