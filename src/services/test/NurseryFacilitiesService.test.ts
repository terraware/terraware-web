import { clearHttpServiceMocks, setHttpServiceMocks } from './HttpServiceMocks';
import NurseryFacilitiesService from '../NurseryFacilitiesService';

describe('Nursery Facilities service', () => {
  beforeEach(() => {
    clearHttpServiceMocks();
  });

  describe('get nursery summary', () => {
    it('should return a summary of the nursery', async () => {
      const mockResponse = {
        requestSucceeded: true,
        statusCode: 200,
        summary: {
          germinatingQuantity: 100,
          germinationRate: 100,
          lossRate: 50,
          notReadyQuantity: 0,
          readyQuantity: 10,
          species: [
            {
              id: 1,
              scientificName: 'Picea pungens',
            },
            {
              id: 2,
              scientificName: 'Picea Glaucus',
            },
          ],
          totalDead: 100,
          totalQuantity: 10,
          totalWithdrawn: 200,
        },
        status: 'ok',
      };

      setHttpServiceMocks({
        get: () => Promise.resolve(mockResponse),
      });

      expect(await NurseryFacilitiesService.getNurserySummary(1)).toEqual(mockResponse);
    });
  });
});
