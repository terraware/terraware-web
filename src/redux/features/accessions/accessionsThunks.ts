import { Dispatch } from 'redux';
import { RootState } from 'src/redux/rootReducer';
import SeedBankService, { SearchResponseAccession } from 'src/services/SeedBankService';
import { setAccessionsAction } from 'src/redux/features/accessions/accessionsSlice';

export const requestAccessions = (organizationId: number, speciesId?: number) => {
  return async (dispatch: Dispatch, _getState: () => RootState) => {
    const stateSpeciesId = speciesId ?? -1;
    const orgIdSpeciesId = `${organizationId}-${stateSpeciesId}`;

    try {
      const results: SearchResponseAccession[] | null = await SeedBankService.getAccessionForSpecies(
        organizationId,
        stateSpeciesId
      );

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
