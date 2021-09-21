import { selectorFamily } from 'recoil';
import { getPhotoBlob, getPhotos } from '../../api/plants/photos';

type PhotoFeature = {
  imgSrc: string;
  featuredId: number;
};

export const uniquePhotoForFeatureSelectorFamily = selectorFamily<
  (PhotoFeature | undefined) | undefined,
  number | undefined
>({
  key: 'uniquePhotoForFeatureSelectorFamily',
  get:
    (plantFeatureId?: number) =>
    async ({ get }) => {
      if (plantFeatureId) {
        const photosOfFeature = await getPhotos(plantFeatureId);
        const firstPhoto = photosOfFeature[0];
        if (firstPhoto) {
          const photoBlob = await getPhotoBlob(firstPhoto.id);

          const urlCreator = window.URL || window.webkitURL;

          return {
            imgSrc: urlCreator.createObjectURL(photoBlob),
            featuredId: firstPhoto.feature_id,
          };
        }
      }
    },
});
