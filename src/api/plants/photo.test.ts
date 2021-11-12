import axios from 'axios';
import {getPlantPhoto, GetPlantPhotoResponse} from './photo';
import {PlantRequestError} from 'src/types/Plant';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const TODAY = new Date(1989, 12, 13);
const FEATURE_ID = 12;

test( `getPlantPhoto() creates URL from image data when the API calls succeeded`, async() => {
  // This file content is bogus, but it works because we're mocking the functions that interpret
  // the server response and create an image URL. The alternative would be to hardcode the data
  // from a real photo in the form of an ArrayBuffer or to open a real image file and read its
  // data into this test. Both options seem unnecessarily complicated/slow.
  const fileContent = 'some file content here';

  mockedAxios.get.mockImplementation((url) => {
    // The order in which we check for url.includes() matters here. One URL is a subset of another,
    // so we must check for the more specific url first.
    if (url.includes(`features/${FEATURE_ID}/photos/121`)) {
      return Promise.resolve({data: {fileContent}});
    } else if (url.includes(`features/${FEATURE_ID}/photos/131`)) {
      console.error('Unexpected URL. No need to fetch more than one photo');
      throw Error('Unexpected URL. No need to fetch more than one photo');
    } else if (url.includes(`features/${FEATURE_ID}/photos`)) {
      return Promise.resolve({data:
          {
            photos: [
              {
                capturedTime: TODAY.toISOString(),
                contentType: 'image/jpeg',
                featureId: FEATURE_ID,
                fileName: 'koa tree photo',
                id: 121,
                size: 3000000,
              },
              {
                capturedTime: TODAY.toISOString(),
                contentType: 'image/png',
                featureId: FEATURE_ID,
                fileName: 'ohia tree photo',
                id: 131,
                size: 4000000,
              }
            ],
            status: 'ok',
          }
      });
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  // @ts-ignore since our mock return data is bogus, aka not the correct type for a new Blob() instantiation.
  const blobSpy = jest.spyOn(global, 'Blob').mockImplementation(() => ({data: 'mocked data'}));

  const photoURL = 'https://test/photo.com';
  // Need to mock this since our Blob data is bogus. Also, mocking the return gives us a predictable URL.
  global.URL.createObjectURL = jest.fn(() => photoURL);

  const expected: GetPlantPhotoResponse = {
    photo: {
      featureId: FEATURE_ID,
      imgSrc: photoURL,
    },
    error: null,
  };

  await expect(getPlantPhoto(FEATURE_ID)).resolves.toEqual(expected);
  expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  expect(blobSpy).toHaveBeenCalledTimes(1);
  expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
});

function constructErrorResponse(featureId: number, error: PlantRequestError): GetPlantPhotoResponse {
  return { photo: { featureId, imgSrc: null }, error };
}

test('getPlantPhoto() returns error when server could not find the feature ID', async() => {
  mockedAxios.get.mockImplementation((url) => {
    if (url.includes(`features/${FEATURE_ID}/photos`)) {
      return Promise.reject({response: {status: 404}});
    }
    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });
  mockedAxios.isAxiosError.mockReturnValue(true);

  const expected = constructErrorResponse(FEATURE_ID, PlantRequestError.FeatureIdNotFound);
  await expect(getPlantPhoto(FEATURE_ID)).resolves.toEqual(expected);
  expect(mockedAxios.get).toHaveBeenCalledTimes(1);
});

test( `getPlantPhoto() returns error when the there are no photos associated with the feature ID`, async() => {
  mockedAxios.get.mockImplementation((url) => {
    if (url.includes(`features/${FEATURE_ID}/photos`)) {
      return Promise.resolve({ data: { photos: [], status:'ok' }});
    }
    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });
  mockedAxios.isAxiosError.mockReturnValue(true);

  const expected = constructErrorResponse(FEATURE_ID, PlantRequestError.NoPhotosFound);
  await expect(getPlantPhoto(FEATURE_ID)).resolves.toEqual(expected);
  expect(mockedAxios.get).toHaveBeenCalledTimes(1);
});

test('getPlantPhoto() returns error when we failed to fetch the photo blob', async() => {
  mockedAxios.get.mockImplementation((url) => {
    // The order in which we check for url.includes() matters here. One URL is a subset of another,
    // so we must check for the more specific url first.
    if (url.includes(`features/${FEATURE_ID}/photos/121`)) {
      return Promise.reject({ response: {status: 500 }});
    } else if (url.includes(`features/${FEATURE_ID}/photos`)) {
      return Promise.resolve({
        data:
          {
            photos: [{
              capturedTime: TODAY.toISOString(),
              contentType: 'image/jpeg',
              featureId: FEATURE_ID,
              fileName: 'koa tree photo',
              id: 121,
              size: 3000000,
            }],
            status: 'ok',
          }
      });
    }
    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });
  mockedAxios.isAxiosError.mockReturnValue(true);

  const expected = constructErrorResponse(FEATURE_ID, PlantRequestError.RequestFailed);
  await expect(getPlantPhoto(FEATURE_ID)).resolves.toEqual(expected);
  expect(mockedAxios.get).toHaveBeenCalledTimes(2);
});
