import { selector, selectorFamily, waitForAll } from 'recoil';
import { getPhoto, getPhotos } from '../../api/photos';
import { Photo, PhotoFeature } from '../../api/types/photo';
import { plantsPlantedFeaturesSelector } from './plantsPlantedFeatures';
import sessionSelector from './session';

export const photoByFeatureIdSelector = selector<
  Record<number, string> | undefined
>({
  key: 'photosByFeatureId',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    const plantsPlantedFeatures = get(plantsPlantedFeaturesSelector);
    const photosByFeatureIdResponse: Record<number, string> = {};
    if (session && plantsPlantedFeatures) {
      const photosArrays = get(
        waitForAll(
          plantsPlantedFeatures.map((plantFeature) =>
            arrayPhotosQuery(plantFeature.id!)
          )
        )
      );

      const firstPhotos = get(
        waitForAll(
          photosArrays.map((photoArray) => firstPhotoQuery(photoArray))
        )
      );

      const urlCreator = window.URL || window.webkitURL;
      firstPhotos.forEach((firstPhoto) => {
        if (firstPhoto && firstPhoto.blobPhoto) {
          const imgSrc = urlCreator.createObjectURL(firstPhoto.blobPhoto);
          photosByFeatureIdResponse[firstPhoto?.featuredId] = imgSrc;
        }
      });
    }

    return photosByFeatureIdResponse;
  },
});

const arrayPhotosQuery = selectorFamily<Photo[] | undefined, number>({
  key: 'arrayPhotosQuery',
  get:
    (plantFeatureId: number) =>
    async ({ get }) => {
      const session = get(sessionSelector);
      if (session) {
        const photosOfFeature = await getPhotos(session, plantFeatureId);

        return photosOfFeature;
      }
    },
});

const firstPhotoQuery = selectorFamily<
  PhotoFeature | undefined,
  Photo[] | undefined
>({
  key: 'firstPhotoQuery',
  get:
    (photoArray: Photo[] | undefined) =>
    async ({ get }) => {
      const session = get(sessionSelector);
      if (session && photoArray && photoArray.length) {
        const photo = await getPhoto(session, photoArray[0].id);

        return {
          blobPhoto: photo,
          featuredId: photoArray[0].feature_id,
        };
      }
    },
});
