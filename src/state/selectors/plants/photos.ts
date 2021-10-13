import { selectorFamily } from 'recoil';
import { getPhotoBlob, getPhotos } from 'src/api/plants/photos';

type PhotoFeature = {
  imgSrc: string;
  featuredId: number;
};

export const uniquePhotoForFeatureSelectorFamily = selectorFamily<(PhotoFeature | undefined) | undefined, number | undefined>({
  key: 'uniquePhotoForFeatureSelectorFamily',
  get: (plantFeatureId?: number) => async () => {
    if (plantFeatureId) {
      const photosOfFeature = await getPhotos(plantFeatureId);
      const firstPhoto = photosOfFeature[0];
      if (firstPhoto) {
        const photoBlob = await getPhotoBlob(firstPhoto.featureId, firstPhoto.id);

        if (photoBlob) {
          const urlCreator = window.URL || window.webkitURL;

          return {
            imgSrc: urlCreator.createObjectURL(photoBlob),
            featuredId: firstPhoto.featureId,
          };
        }
      }
    }
  },
});
