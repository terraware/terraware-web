import { createAsyncThunk } from '@reduxjs/toolkit';
import { getTodaysDateFormatted } from '@terraware/web-components/utils/date';
import { Response } from 'src/services/HttpService';
import strings from 'src/strings';
import { Batch, CreateBatchRequestPayload, NurseryTransfer } from 'src/types/Batch';
import { BatchData, UpdateBatchRequestPayloadWithId } from 'src/services/NurseryBatchService';
import AccessionService from 'src/services/AccessionService';
import { NurseryBatchService } from 'src/services';
import { RootState } from 'src/redux/rootReducer';
import { SearchResponseAccession } from 'src/services/SeedBankService';

export type SavableBatch = (CreateBatchRequestPayload | UpdateBatchRequestPayloadWithId) & Batch;

export const requestSaveBatch = createAsyncThunk(
  'batches/save',
  async (
    request: { batch: SavableBatch; organizationId: number; timezone?: string },
    { rejectWithValue, getState }
  ) => {
    const { batch, organizationId, timezone } = request;

    let response: (Response & BatchData) | undefined;
    let responseQuantities: Partial<Response> = { requestSucceeded: true, error: undefined };

    if (batch.id === -1) {
      if (batch.accessionId) {
        // Extra validation to ensure an accession ID matches the given species
        if (batch.accessionId && batch.speciesId) {
          const orgIdSpeciesId = `${organizationId}-${batch.speciesId}`;
          const accessionsResponseData = (getState() as RootState).accessions[orgIdSpeciesId] || {};
          if (
            !(accessionsResponseData.accessions || []).find(
              (accession: SearchResponseAccession) => Number(accession.id) === batch.accessionId
            )
          ) {
            // The species requested does not apply to this accession
            return rejectWithValue(strings.GENERIC_ERROR);
          }
        }

        const nurseryTransferRecord: NurseryTransfer = {
          date: getTodaysDateFormatted(timezone),
          destinationFacilityId: Number(batch.facilityId),
          germinatingQuantity: Number(batch.germinatingQuantity),
          notReadyQuantity: Number(batch.notReadyQuantity),
          notes: batch.notes,
          readyByDate: batch.readyByDate,
          readyQuantity: Number(batch.readyQuantity),
        };

        const accessionResponse = await AccessionService.transferToNursery(nurseryTransferRecord, batch.accessionId);

        if (!accessionResponse.requestSucceeded || !accessionResponse.data) {
          return rejectWithValue(strings.GENERIC_ERROR);
        }

        batch.id = accessionResponse.data.batch.id;
        batch.version = accessionResponse.data.batch.version;

        // This is where the sub locations are associated to the batch created through the nursery transfer
        response = await NurseryBatchService.updateBatch(batch as Batch);
        if (response.batch) {
          responseQuantities = await NurseryBatchService.updateBatchQuantities({
            ...(batch as Batch),
            version: response.batch.version,
          });
        }
      } else {
        response = await NurseryBatchService.createBatch(batch as CreateBatchRequestPayload);
      }
    } else {
      response = await NurseryBatchService.updateBatch(batch as UpdateBatchRequestPayloadWithId);
      if (response.batch) {
        responseQuantities = await NurseryBatchService.updateBatchQuantities({
          ...batch,
          version: response.batch.version,
        } as Batch);
      }
    }

    if (response && response.requestSucceeded && responseQuantities.requestSucceeded) {
      return {
        ...response.data,
      };
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);

export const requestFetchBatch = createAsyncThunk(
  'batches/fetch-one',
  async (request: { batchId: number | string }, { rejectWithValue }) => {
    const { batchId } = request;

    const response = await NurseryBatchService.getBatch(Number(`${batchId}`));
    if (response && response.requestSucceeded) {
      return response.batch;
    }

    return rejectWithValue(strings.GENERIC_ERROR);
  }
);
