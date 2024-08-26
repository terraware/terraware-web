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
};

// default values pointing to nothing
export const DocumentProducerContext = createContext<DocumentProducerData>({
  documentId: -1,
  getUsedSections: () => [],
  isLoading: false,
  projectId: -1,
  // tslint:disable-next-line:no-empty
  reload: () => {},
});

export const useDocumentProducerData = () => useContext(DocumentProducerContext);
