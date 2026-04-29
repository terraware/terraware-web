import { BatchPayload } from 'src/queries/generated/nurseryWithdrawals';

export const batchToSpecies = (batches: BatchPayload[]) => {
  return (
    batches?.reduce<{ [key: string]: { speciesId: number; batchNumber: string } }>(
      (acc, batch) => ({
        ...acc,
        [batch.id.toString()]: { speciesId: batch.speciesId, batchNumber: batch.batchNumber },
      }),
      {}
    ) ?? {}
  );
};
