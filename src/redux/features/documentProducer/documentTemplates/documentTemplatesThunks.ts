import { Dispatch } from 'redux';

import { RootState } from 'src/redux/rootReducer';
import DocumentTemplateService from 'src/services/documentProducer/DocumentTemplateService';

import { selectDocumentTemplates } from './documentTemplatesSelector';
import { setDocumentTemplates } from './documentTemplatesSlice';

const hasFetchedDocumentTemplates = (state: RootState): boolean =>
  (selectDocumentTemplates(state).documentTemplates || []).length > 0;

export const requestListDocumentTemplates = () => {
  return async (dispatch: Dispatch, _getState: () => RootState): Promise<void> => {
    if (hasFetchedDocumentTemplates(_getState())) {
      return;
    }

    try {
      const response = await DocumentTemplateService.getDocumentTemplates();

      const documentTemplates = response.data?.documentTemplates;
      const error = response.error;

      dispatch(setDocumentTemplates({ documentTemplates, error }));
    } catch (e) {
      // tslint:disable-next-line: no-console
      console.error('Error dispatching list documentTemplates', e);
    }
  };
};
