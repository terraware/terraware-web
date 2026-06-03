import { useGetAccessionQuery } from 'src/queries/generated/accessionsV2';
import { Accession } from 'src/types/Accession';

/**
 * Fetches a single accession via RTK Query. The query is cache-keyed by id, so multiple components
 * requesting the same accession share one cached result (no duplicate requests).
 */
const useAccession = (accessionId: number) => {
  const { currentData, isFetching, isSuccess, refetch } = useGetAccessionQuery(accessionId, {
    skip: !accessionId,
  });

  const accession: Accession | undefined = currentData?.accession;

  return { accession, refetch, isLoading: isFetching, isSuccess };
};

export default useAccession;
