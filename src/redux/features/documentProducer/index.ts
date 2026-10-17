import { documentProducerDocumentTemplatesReducers } from './documentTemplates/documentTemplatesSlice';
import { documentProducerDocumentsReducers } from './documents/documentsSlice';

const documentProducerReducers = {
  ...documentProducerDocumentsReducers,
  ...documentProducerDocumentTemplatesReducers,
};

export default documentProducerReducers;
