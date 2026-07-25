import { useCallback } from 'react';

import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';

import { useCreateNurseryTransferWithdrawalMutation } from 'src/queries/generated/accessionsV2';
import {
  BatchPayload,
  CreateBatchRequestPayload,
  UpdateBatchRequestPayload,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useUpdateBatchQuantitiesMutation,
} from 'src/queries/generated/nurseryBatches';
import { useLazyGetAccessionForSpeciesQuery } from 'src/queries/search/accessions';
import { Batch } from 'src/types/Batch';

export type UpdateBatchRequestPayloadWithId = UpdateBatchRequestPayload & { id: number };

export type SavableBatch = (CreateBatchRequestPayload | UpdateBatchRequestPayloadWithId) & Batch;

export type SaveBatchRequest = {
  batch: SavableBatch;
  organizationId: number;
  quantityNotes?: string;
  timezone?: string;
};

const NEW_BATCH_ID = -1;

/**
 * Saves a new or existing batch, returning the saved batch or undefined if any step failed.
 *
 * A new batch that came from an accession is created by the seed withdrawal rather than by the
 * batch endpoint, so that path transfers first and then updates the created batch to apply the
 * fields the transfer payload has no room for (sub locations, substrate, treatment, project).
 */
export const useSaveBatch = () => {
  const [createBatch] = useCreateBatchMutation();
  const [updateBatch] = useUpdateBatchMutation();
  const [updateBatchQuantities] = useUpdateBatchQuantitiesMutation();
  const [createNurseryTransfer] = useCreateNurseryTransferWithdrawalMutation();
  const [getAccessionForSpecies] = useLazyGetAccessionForSpeciesQuery();

  const updateBatchAndQuantities = useCallback(
    async (batch: SavableBatch, batchId: number, version: number, quantityNotes?: string): Promise<BatchPayload> => {
      const updated = await updateBatch({
        id: batchId,
        updateBatchRequestPayload: {
          germinationStartedDate: batch.germinationStartedDate,
          notes: batch.notes,
          projectId: batch.projectId,
          readyByDate: batch.readyByDate,
          seedsSownDate: batch.seedsSownDate,
          subLocationIds: batch.subLocationIds,
          substrate: batch.substrate,
          substrateNotes: batch.substrateNotes,
          treatment: batch.treatment,
          treatmentNotes: batch.treatmentNotes,
          version,
        },
      }).unwrap();

      const withQuantities = await updateBatchQuantities({
        id: batchId,
        updateBatchQuantitiesRequestPayload: {
          activeGrowthQuantity: Number(batch.activeGrowthQuantity),
          germinatingQuantity: Number(batch.germinatingQuantity),
          hardeningOffQuantity: Number(batch.hardeningOffQuantity),
          notes: quantityNotes,
          readyQuantity: Number(batch.readyQuantity),
          version: updated.batch.version,
        },
      }).unwrap();

      return withQuantities.batch;
    },
    [updateBatch, updateBatchQuantities]
  );

  return useCallback(
    async ({ batch, organizationId, quantityNotes, timezone }: SaveBatchRequest): Promise<BatchPayload | undefined> => {
      try {
        if (batch.id !== NEW_BATCH_ID) {
          return await updateBatchAndQuantities(batch, batch.id, batch.version, quantityNotes);
        }

        if (!batch.accessionId) {
          const created = await createBatch({
            activeGrowthQuantity: Number(batch.activeGrowthQuantity),
            addedDate: batch.addedDate,
            facilityId: Number(batch.facilityId),
            germinatingQuantity: Number(batch.germinatingQuantity),
            germinationStartedDate: batch.germinationStartedDate,
            hardeningOffQuantity: Number(batch.hardeningOffQuantity),
            notes: batch.notes,
            projectId: batch.projectId,
            readyByDate: batch.readyByDate,
            readyQuantity: Number(batch.readyQuantity),
            seedsSownDate: batch.seedsSownDate,
            speciesId: Number(batch.speciesId),
            subLocationIds: batch.subLocationIds,
            substrate: batch.substrate,
            substrateNotes: batch.substrateNotes,
            treatment: batch.treatment,
            treatmentNotes: batch.treatmentNotes,
          }).unwrap();

          return created.batch;
        }

        if (batch.speciesId) {
          const accessions = await getAccessionForSpecies(
            { organizationId, speciesId: batch.speciesId },
            true
          ).unwrap();

          if (!accessions.some((accession) => Number(accession.id) === batch.accessionId)) {
            // The species requested does not apply to this accession
            return undefined;
          }
        }

        const transfer = await createNurseryTransfer({
          accessionId: batch.accessionId,
          createNurseryTransferRequestPayload: {
            activeGrowthQuantity: Number(batch.activeGrowthQuantity),
            date: getTodaysDateFormatted(timezone),
            destinationFacilityId: Number(batch.facilityId),
            germinatingQuantity: Number(batch.germinatingQuantity),
            hardeningOffQuantity: Number(batch.hardeningOffQuantity),
            notes: batch.notes,
            readyByDate: batch.readyByDate,
            readyQuantity: Number(batch.readyQuantity),
          },
        }).unwrap();

        return await updateBatchAndQuantities(batch, transfer.batch.id, transfer.batch.version, quantityNotes);
      } catch {
        return undefined;
      }
    },
    [createBatch, createNurseryTransfer, getAccessionForSpecies, updateBatchAndQuantities]
  );
};
