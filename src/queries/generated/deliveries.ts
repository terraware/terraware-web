import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDelivery: build.query<GetDeliveryApiResponse, GetDeliveryApiArg>({
      query: (queryArg) => ({ url: `/api/v1/tracking/deliveries/${queryArg}` }),
    }),
    reassignDelivery: build.mutation<ReassignDeliveryApiResponse, ReassignDeliveryApiArg>({
      query: (queryArg) => ({
        url: `/api/v1/tracking/deliveries/${queryArg.id}/reassign`,
        method: 'POST',
        body: queryArg.reassignDeliveryRequestPayload,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as api };
export type GetDeliveryApiResponse = /** status 200 OK */ GetDeliveryResponsePayload;
export type GetDeliveryApiArg = number;
export type ReassignDeliveryApiResponse = /** status 200 OK */ SimpleSuccessResponsePayload;
export type ReassignDeliveryApiArg = {
  id: number;
  reassignDeliveryRequestPayload: ReassignDeliveryRequestPayload;
};
export type PlantingPayload = {
  id: number;
  /** If type is "Reassignment To", the reassignment notes, if any. */
  notes?: string;
  /** Number of plants planted or reassigned. If type is "Reassignment From", this will be negative. */
  numPlants: number;
  /** Use substratumId instead. */
  plantingSubzoneId?: number;
  speciesId: number;
  substratumId?: number;
  type: 'Delivery' | 'Reassignment From' | 'Reassignment To' | 'Undo';
};
export type DeliveryPayload = {
  id: number;
  plantingSiteId: number;
  plantings: PlantingPayload[];
  withdrawalId: number;
};
export type SuccessOrError = 'ok' | 'error';
export type GetDeliveryResponsePayload = {
  delivery: DeliveryPayload;
  status: SuccessOrError;
};
export type SimpleSuccessResponsePayload = {
  status: SuccessOrError;
};
export type ReassignmentPayload = {
  fromPlantingId: number;
  notes?: string;
  /** Number of plants to reassign from the planting's original substratum to the new one. Must be less than or equal to the number of plants in the original planting. */
  numPlants: number;
  /** Use toSubstratumId instead */
  toPlantingSubzoneId?: number;
  toSubstratumId?: number;
};
export type ReassignDeliveryRequestPayload = {
  reassignments: ReassignmentPayload[];
};
export const { useGetDeliveryQuery, useLazyGetDeliveryQuery, useReassignDeliveryMutation } = injectedRtkApi;
