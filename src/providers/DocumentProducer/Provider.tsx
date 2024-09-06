import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import { selectDocumentTemplate } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { selectGetDocument } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestGetDocument } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { requestListVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectAllVariablesWithValues,
  selectDocumentVariablesWithValues,
  selectVariablesOwners,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListAllVariables,
  requestListDocumentVariables,
  requestListVariablesOwners,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useMultiSelectorProcessor } from 'src/redux/hooks/useMultiSelectorProcessor';
import { RootState } from 'src/redux/rootReducer';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Document as DocumentType } from 'src/types/documentProducer/Document';
import {
  SectionVariableWithValues,
  VariableOwners,
  VariableWithValues,
  isSectionVariableWithValues,
} from 'src/types/documentProducer/Variable';

import { DocumentProducerContext, DocumentProducerData } from './Context';
import { getContainingSections } from './util';

export type Props = {
  children: React.ReactNode;
};

const DocumentProducerProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const pathParams = useParams<{ documentId: string }>();
  const documentId = Number(pathParams.documentId || -1);

  const [document, setDocument] = useState<DocumentType>();

  const projectId = document?.projectId ?? -1;
  const documentTemplateId = document?.documentTemplateId ?? -1;
  const documentTemplate = useAppSelector((state) => selectDocumentTemplate(state, documentTemplateId));

  const { status, data } = useMultiSelectorProcessor([
    ['allVariables', (state: RootState) => selectAllVariablesWithValues(state, projectId)],
    ['document', selectGetDocument(documentId), { onData: setDocument }],
    ['documentVariables', (state: RootState) => selectDocumentVariablesWithValues(state, documentId, projectId)],
    ['variablesOwners', (state: RootState) => selectVariablesOwners(state, projectId)],
  ]);

  const documentVariables = data.documentVariables as VariableWithValues[];
  const variablesOwners = data.variablesOwners as VariableOwners[];

  // Document variables may contain out-dated variables that are injected into sections within the document
  // They need to be added into the `allVariables` array so consumers can access out of date variables easily
  const allVariables = useMemo(
    () => ((data.allVariables || []) as VariableWithValues[]).concat(documentVariables || []),
    [data.allVariables, documentVariables]
  );

  const documentSectionVariables = useMemo(
    () => (documentVariables || []).filter(isSectionVariableWithValues) as SectionVariableWithValues[],
    [documentVariables]
  );

  const isLoading = status === 'pending';

  useEffect(() => {
    dispatch(requestListDocumentTemplates());
    dispatch(requestListAllVariables());
  }, [dispatch]);

  const reloadDocument = useCallback(() => {
    if (documentId !== -1) {
      dispatch(requestGetDocument(documentId));
    }
  }, [dispatch, documentId]);

  const loadDocument = useCallback(() => {
    if (documentId !== -1) {
      dispatch(requestGetDocument(documentId));
      dispatch(requestListDocumentVariables(documentId));
    }
  }, [dispatch, documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const loadVariables = useCallback(() => {
    if (projectId !== -1) {
      dispatch(requestListVariablesOwners(projectId));
      dispatch(requestListVariablesValues({ projectId }));
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    loadVariables();
  }, [loadVariables]);

  const reload = useCallback(() => {
    loadDocument();
    loadVariables();
  }, [loadDocument, loadVariables]);

  const reloadVariables = useCallback(() => {
    if (projectId !== -1) {
      dispatch(requestListVariablesValues({ projectId }));
    }
  }, [dispatch, projectId]);

  const getUsedSections = useCallback(
    (variableId: number) => documentSectionVariables.reduce(getContainingSections(variableId), []),
    [documentSectionVariables]
  );

  const [documentProducerData, setDocumentProducerData] = useState<DocumentProducerData>({
    allVariables,
    document,
    documentId,
    documentTemplate,
    documentVariables,
    getUsedSections,
    isLoading: true,
    projectId,
    // tslint:disable-next-line:no-empty
    reload: () => {},
    variablesOwners,
    reloadVariables: () => {},
    reloadDocument: () => {},
  });

  useEffect(() => {
    setDocumentProducerData({
      allVariables,
      document,
      documentId,
      documentSectionVariables,
      documentTemplate,
      documentVariables,
      getUsedSections,
      isLoading,
      projectId,
      reload,
      variablesOwners,
      reloadVariables,
      reloadDocument,
    });
  }, [
    allVariables,
    document,
    documentId,
    documentSectionVariables,
    documentTemplate,
    documentVariables,
    getUsedSections,
    isLoading,
    projectId,
    reload,
    variablesOwners,
    reloadVariables,
    reloadDocument,
  ]);

  if (isLoading) {
    return <BusySpinner withSkrim />;
  }

  return <DocumentProducerContext.Provider value={documentProducerData}>{children}</DocumentProducerContext.Provider>;
};

export default DocumentProducerProvider;
