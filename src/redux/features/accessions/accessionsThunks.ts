import { Dispatch } from 'redux';
import { RootState } from 'src/redux/rootReducer';
import { SearchNodePayload } from 'src/types/Search';
import strings from 'src/strings';
import SeedBankService from 'src/services/SeedBankService';
import { setAccessionsAction } from './accessionsSlice';

const SEARCH_FIELDS_ACCESSIONS = ['id', 'accessionNumber', 'speciesName'];

export type SearchResponseAccession = {
  id: string;
  accessionNumber: string;
  speciesName: string;
};

export const requestAccessions = (organizationId: number, speciesId?: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    const stateSpeciesId = speciesId ?? -1;
    const orgIdSpeciesId = `${organizationId}-${stateSpeciesId}`;

    try {
      const searchCriteria: { [key: string]: SearchNodePayload } = {};
      searchCriteria.excludeUsedUp = {
        operation: 'not',
        child: {
          operation: 'field',
          field: 'state',
          type: 'Exact',
          values: [strings.USED_UP],
        },
      };

      if (stateSpeciesId !== -1) {
        searchCriteria.speciesIds = {
          operation: 'field',
          field: 'species_id',
          type: 'Exact',
          values: [stateSpeciesId.toString()],
        };
      }

      const results: SearchResponseAccession[] | null = await SeedBankService.searchAccessions({
        organizationId,
        fields: SEARCH_FIELDS_ACCESSIONS,
        searchCriteria,
      });

      if (!results?.length) {
        dispatch(setAccessionsAction({ orgIdSpeciesId, data: { error: true } }));
        return;
      }

      dispatch(setAccessionsAction({ orgIdSpeciesId, data: { accessions: results } }));
    } catch (e: unknown) {
      // should not happen, the response above captures any http request errors
      // tslint:disable-next-line: no-console
      const errorMessage = (e as Error).message ?? e;
      dispatch(
        setAccessionsAction({
          orgIdSpeciesId,
          data: { error: `Error dispatching request accessions - ${errorMessage}` },
        })
      );
    }
  };
};
