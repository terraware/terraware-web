import { readData } from './utils';
import SearchService from '../SearchService';
import NurseryWithdrawalService from '../NurseryWithdrawalService';
jest.mock('../SearchService');

const search = SearchService.search as jest.MockedFunction<typeof SearchService.search>;

describe('Nursery withdrawals service', () => {
  describe('list withdrawals', () => {
    it('should return species names as a flattened array in the withdrawals list', async () => {
      search.mockImplementation(() =>
        Promise.resolve([
          {
            id: '56',
            delivery_id: '24',
            withdrawnDate: '2023-02-14',
            purpose: 'Out Plant',
            facility_name: 'testOutplant',
            destinationName: 'testSite',
            substratumNames: 'STR2-A9 (STR2-B9)',
            totalWithdrawn: '1,005',
            hasReassignments: 'true',
            batchWithdrawals: [
              {
                batch_species_scientificName: 'Abelia macrotera var. deutziaefolia',
              },
              {
                batch_species_scientificName: 'Abarema asplenifoliaasdfasdasdfa',
              },
            ],
            project_names: [undefined],
          },
        ])
      );

      expect(await NurseryWithdrawalService.listNurseryWithdrawals(1, [])).toEqual([
        {
          id: '56',
          delivery_id: '24',
          withdrawnDate: '2023-02-14',
          purpose: 'Out Plant',
          facility_name: 'testOutplant',
          destinationName: 'testSite',
          substratumNames: 'STR2-A9 (STR2-B9)',
          totalWithdrawn: '1,005',
          hasReassignments: 'true',
          speciesScientificNames: ['Abarema asplenifoliaasdfasdasdfa', 'Abelia macrotera var. deutziaefolia'],
          project_names: [undefined],
        },
      ]);
    });

    it('should handle multiple items in the results list', async () => {
      search.mockImplementation(() => Promise.resolve(readData('nurseryWithdrawalsRaw.json')));
      expect(await NurseryWithdrawalService.listNurseryWithdrawals(1, [])).toEqual([
        {
          id: '59',
          withdrawnDate: '2023-02-23',
          purpose: 'Other',
          facility_name: 'testOther',
          totalWithdrawn: '1',
          hasReassignments: 'false',
          speciesScientificNames: ['Abarema asplenifoliaasdfasdasdfa'],
          project_names: [undefined],
        },
        {
          id: '56',
          delivery_id: '24',
          withdrawnDate: '2023-02-14',
          purpose: 'Out Plant',
          facility_name: 'testOutplant',
          destinationName: 'testSite',
          substratumNames: 'STR2-A9 (STR2-B9)',
          totalWithdrawn: '1,005',
          hasReassignments: 'true',
          speciesScientificNames: ['Abarema asplenifoliaasdfasdasdfa', 'Abelia macrotera var. deutziaefolia'],
          project_names: [undefined],
        },
      ]);
    });

    it('should return null if search returned null data due to an error', async () => {
      search.mockImplementation(() => Promise.resolve(null));
      expect(await NurseryWithdrawalService.listNurseryWithdrawals(1, [])).toBe(null);
    });
  });

  describe('has withdrawals checks', () => {
    it('should return true if there are withdrawals', async () => {
      search.mockImplementation(() => Promise.resolve([{}]));
      expect(await NurseryWithdrawalService.hasNurseryWithdrawals(1)).toBe(true);
    });

    it('should return false if there are no withdrawals', async () => {
      search.mockImplementation(() => Promise.resolve([]));
      expect(await NurseryWithdrawalService.hasNurseryWithdrawals(1)).toBe(false);
    });

    it('should return false if the withdrawals list is null due to an error', async () => {
      search.mockImplementation(() => Promise.resolve(null));
      expect(await NurseryWithdrawalService.hasNurseryWithdrawals(1)).toBe(false);
    });
  });
});
