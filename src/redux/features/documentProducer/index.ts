import { documentProducerDocumentTemplatesReducers } from './documentTemplates/documentTemplatesSlice';
import { documentProducerDocumentsReducers } from './documents/documentsSlice';
import { documentProducerVariableValuesReducers } from './values/valuesSlice';
import { documentProducerVariablesReducers } from './variables/variablesSlice';

const documentProducerReducers = {
  ...documentProducerDocumentsReducers,
  ...documentProducerDocumentTemplatesReducers,
  ...documentProducerVariablesReducers,
  ...documentProducerVariableValuesReducers,
};

export default documentProducerReducers;
