/* eslint-disable @typescript-eslint/no-unused-vars */
import createCachedSelector from 're-reselect';

import { RootState } from 'src/redux/rootReducer';
import { DocumentTemplate } from 'src/types/documentProducer/DocumentTemplate';

import { DocumentTemplatesData } from './documentTemplatesSlice';

export const selectDocumentTemplates = (state: RootState): DocumentTemplatesData =>
  state.documentProducerDocumentTemplates.listDocumentTemplates;

export const selectDocumentTemplate = createCachedSelector(
  (state: RootState, documentTemplateId: number) => state.documentProducerDocumentTemplates.listDocumentTemplates as any,
  (state: RootState, documentTemplateId: number) => documentTemplateId,
  (response, documentTemplateId) => {
    if (response && response.documentTemplates) {
      return response.documentTemplates.find((m: DocumentTemplate) => m.id === documentTemplateId);
    }
    return null;
  }
)((state: RootState, documentTemplateId: number) => documentTemplateId);
