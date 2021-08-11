import { selector, selectorFamily, waitForAll } from 'recoil';
import { getPhotoBlob, getPhotos } from '../../api/photos';
import { plantsPlantedFeaturesSelector } from './plantsPlantedFeatures';
import sessionSelector from './session';

type PhotoFeature = {
  imgSrc: string;
  featuredId: number;
};

export const photoByFeatureIdSelector = selector<Record<number, string> | undefined>({
  key: 'photosByFeatureId',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    const plantsPlantedFeatures = get(plantsPlantedFeaturesSelector);
    const photosByFeatureIdResponse: Record<number, string> = {};
    if (session && plantsPlantedFeatures) {
      const firstPhotos = get(
        waitForAll(
          plantsPlantedFeatures.map((plantFeature) =>
            uniquePhotoForFeatureSelectorFamily(plantFeature.id!)
          )
        )
      );

      firstPhotos.forEach((firstPhoto) => {
        if (firstPhoto && firstPhoto.imgSrc) {
          const imgSrc = firstPhoto.imgSrc;
          photosByFeatureIdResponse[firstPhoto?.featuredId] = imgSrc;
        }
      });
    }

    return photosByFeatureIdResponse;
  },
});

export const uniquePhotoForFeatureSelectorFamily = selectorFamily<(PhotoFeature | undefined) | undefined, number | undefined>({
  key: 'uniquePhotoForFeatureSelectorFamily',
  get: (plantFeatureId?: number) => async ({ get }) => {
    const session = get(sessionSelector);
    if (session && plantFeatureId) {
      const photosOfFeature = await getPhotos(session, plantFeatureId);
      const firstPhoto = photosOfFeature[0];
      if (firstPhoto) {
        const photoBlob = await getPhotoBlob(session, firstPhoto.id);

        const urlCreator = window.URL || window.webkitURL;

        return {
          imgSrc: urlCreator.createObjectURL(photoBlob),
          featuredId: firstPhoto.feature_id,
        };
      }
    }
  },
});
