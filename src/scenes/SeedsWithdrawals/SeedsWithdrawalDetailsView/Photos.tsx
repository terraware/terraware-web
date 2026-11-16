import React, { type JSX, useEffect, useState } from 'react';

import { Box, Typography } from '@mui/material';

import PhotosList from 'src/components/common/PhotosList';
import { API_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useLazyListBatchPhotosQuery } from 'src/queries/generated/nurseryBatches';

type PhotosProps = {
  batchIds: number[];
};

const Photos = ({ batchIds }: PhotosProps): JSX.Element => {
  const { strings } = useLocalization();
  const [listBatchPhotos] = useLazyListBatchPhotosQuery();
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadPhotos = async () => {
      const responses = await Promise.all(
        batchIds.map(async (batchId) => {
          try {
            const response = await listBatchPhotos(batchId, true).unwrap();
            return response.photos.map((photo) =>
              API_PATHS.NURSERY_BATCH_PHOTO.replace('{batchId}', String(batchId)).replace('{photoId}', String(photo.id))
            );
          } catch {
            return [];
          }
        })
      );

      if (!cancelled) {
        setPhotoUrls(responses.flat());
      }
    };

    void loadPhotos();

    return () => {
      cancelled = true;
    };
  }, [batchIds, listBatchPhotos]);

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
};

export default Photos;
