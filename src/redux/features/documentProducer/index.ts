import { documentProducerDocumentsReducers } from './documents/documentsSlice';
import { documentProducerMethodologiesReducers } from './methodologies/methodologiesSlice';
import { documentProducerVariableValuesReducers } from './values/valuesSlice';
import { documentProducerVariablesReducers } from './variables/variablesSlice';

const documentProducerReducers = {
  ...documentProducerDocumentsReducers,
  ...documentProducerMethodologiesReducers,
  ...documentProducerVariablesReducers,
  ...documentProducerVariableValuesReducers,
};

export default documentProducerReducers;
