import { documentProducerDocumentsReducers } from './documents/documentsSlice';
import { documentProducerDocumentTemplatesReducers } from './documentTemplates/documentTemplatesSlice';
import { documentProducerVariableValuesReducers } from './values/valuesSlice';
import { documentProducerVariablesReducers } from './variables/variablesSlice';

const documentProducerReducers = {
  ...documentProducerDocumentsReducers,
  ...documentProducerDocumentTemplatesReducers,
  ...documentProducerVariablesReducers,
  ...documentProducerVariableValuesReducers,
};

export default documentProducerReducers;
