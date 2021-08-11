import { selectorFamily } from 'recoil';
import { getPhotoBlob, getPhotos } from '../../api/photos';
import sessionSelector from './session';

type PhotoFeature = {
  imgSrc: string;
  featuredId: number;
};

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
