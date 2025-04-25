import { createContext, useContext } from 'react';

import { Document as DocumentType } from 'src/types/documentProducer/Document';
import { DocumentTemplate } from 'src/types/documentProducer/DocumentTemplate';
import { SectionVariableWithValues, VariableOwners, VariableWithValues } from 'src/types/documentProducer/Variable';

export type DocumentProducerData = {
  allVariables?: VariableWithValues[];
  document?: DocumentType;
  documentId: number;
  documentSectionVariables?: SectionVariableWithValues[];
  documentTemplate?: DocumentTemplate;
  documentVariables?: VariableWithValues[];
  getUsedSections: (variableId: number) => string[];
  isLoading: boolean;
  projectId: number;
  reload: () => void;
  variablesOwners?: VariableOwners[];
  reloadVariables: () => void;
  reloadDocument: () => void;
};

// default values pointing to nothing
export const DocumentProducerContext = createContext<DocumentProducerData>({
  documentId: -1,
  getUsedSections: () => [],
  isLoading: false,
  projectId: -1,
  /* eslint-disable @typescript-eslint/no-empty-function */
  reload: () => {},
  reloadVariables: () => {},
  reloadDocument: () => {},
  /* eslint-enable @typescript-eslint/no-empty-function */
});

export const useDocumentProducerData = () => useContext(DocumentProducerContext);
