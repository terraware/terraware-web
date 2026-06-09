import { useGetAccessionQuery } from 'src/queries/generated/accessionsV2';
import { Accession } from 'src/types/Accession';

const useAccession = (accessionId: number) => {
  const { currentData, isFetching, isSuccess, refetch } = useGetAccessionQuery(accessionId, {
    skip: !accessionId,
  });

  const accession: Accession | undefined = currentData?.accession;

  return { accession, refetch, isLoading: isFetching, isSuccess };
};

export default useAccession;
