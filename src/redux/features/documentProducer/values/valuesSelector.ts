/* eslint-disable @typescript-eslint/no-unused-vars */
import createCachedSelector from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

export const selectVariablesValues = (state: RootState, docId: number | string) =>
  state.documentProducerVariableValuesList[docId];

export const selectGetVariableValues = createCachedSelector(
  (state: RootState, projectId: number | string, variableId: number) =>
    state.documentProducerVariableValuesList[projectId],
  (state: RootState, projectId: number | string, variableId: number) => projectId,
  (state: RootState, projectId: number | string, variableId: number) => variableId,
  (response, projectId, variableId) => {
    if (response?.data) {
      const variableValueToReturn = response.data.find(
        (variableValue: VariableValue) => variableValue.variableId === variableId
      );
      return {
        ...response,
        data: variableValueToReturn?.values,
      };
    } else {
      return response;
    }
  }
)((state: RootState, projectId: number | string, variableId: number) => variableId);

export const selectUpdateVariableValues = (requestId: string) => (state: RootState) =>
  state.documentProducerVariableValuesUpdate[requestId];

export const selectUploadImageValue = (requestId: string) => (state: RootState) =>
  state.documentProducerVariableValuesImageUpload[requestId];
