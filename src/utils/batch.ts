import { Batch } from 'src/types/Batch';

export const batchToSpecies = (batches: Batch[]) => {
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
