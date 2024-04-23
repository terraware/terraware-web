/* eslint-disable @typescript-eslint/no-unused-vars */
import createCachedSelector from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { Methodology } from 'src/types/documentProducer/Methodology';

import { MethodologiesData } from './methodologiesSlice';

export const selectMethodologies = (state: RootState): MethodologiesData =>
  state.documentProducerMethodologies.listMethodologies;

export const selectMethodology = createCachedSelector(
  (state: RootState, methodologyId: number) => state.documentProducerMethodologies.listMethodologies as any,
  (state: RootState, methodologyId: number) => methodologyId,
  (response, methodologyId) => {
    if (response && response.methodologies) {
      return response.methodologies.find((m: Methodology) => m.id === methodologyId);
    }
    return null;
  }
)((state: RootState, methodologyId: number) => methodologyId);
