/* eslint-disable @typescript-eslint/no-unused-vars */
import createCachedSelector from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

import { variableListCompositeKeyFn } from './valuesSlice';

export const selectVariablesValues = (state: RootState, docId: number | string, maxValueId?: number) =>
  state.documentProducerVariableValuesList[docId];

export const selectGetVariableValues = createCachedSelector(
  (state: RootState, projectId: number | string, variableId: number, maxValueId?: number) =>
    state.documentProducerVariableValuesList[variableListCompositeKeyFn({ projectId, maxValueId })],
  (state: RootState, projectId: number | string, variableId: number, maxValueId?: number) => projectId,
  (state: RootState, projectId: number | string, variableId: number, maxValueId?: number) => variableId,
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
