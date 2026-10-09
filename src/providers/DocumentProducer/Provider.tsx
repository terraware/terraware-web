import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { skipToken } from '@reduxjs/toolkit/query';
import { BusySpinner } from '@terraware/web-components';
import _ from 'lodash';

import useDocumentVariablesWithValues from 'src/hooks/variables/useDocumentVariablesWithValues';
import useProjectVariablesWithValues from 'src/hooks/variables/useProjectVariablesWithValues';
import { useListVariableOwnersQuery } from 'src/queries/generated/documentProducerVariables';
import { selectDocumentTemplate } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesSelector';
import { requestListDocumentTemplates } from 'src/redux/features/documentProducer/documentTemplates/documentTemplatesThunks';
import { selectGetDocument } from 'src/redux/features/documentProducer/documents/documentsSelector';
import { requestGetDocument } from 'src/redux/features/documentProducer/documents/documentsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document as DocumentType } from 'src/types/documentProducer/Document';
import {
  SectionVariableWithValues,
  VariableWithValues,
  isSectionVariableWithValues,
} from 'src/types/documentProducer/Variable';
import useSnackbar from 'src/utils/useSnackbar';

import { DocumentProducerContext, DocumentProducerData } from './Context';
import { getContainingSections } from './util';

type Props = {
  children: React.ReactNode;
};

const DocumentProducerProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const pathParams = useParams<{ documentId: string; projectId: string }>();
  const documentId = Number(pathParams.documentId || -1);

  const [document, setDocument] = useState<DocumentType>();

  const projectId = (pathParams.projectId ? Number(pathParams.projectId) : document?.projectId) ?? -1;
  const documentTemplateId = document?.documentTemplateId ?? -1;
  const documentTemplate = useAppSelector((state) => selectDocumentTemplate(state, documentTemplateId));

  const snackbar = useSnackbar();
  const documentResult = useAppSelector(selectGetDocument(documentId));
  useEffect(() => {
    if (documentResult?.status === 'success') {
      setDocument(documentResult.data);
    } else if (documentResult?.status === 'error') {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [documentResult, snackbar]);

  const hasDocument = documentId !== -1;
  const hasProject = projectId !== -1;

  const projectVariables = useProjectVariablesWithValues(hasProject ? projectId : undefined);
  const documentVariablesResult = useDocumentVariablesWithValues(
    hasDocument ? documentId : undefined,
    hasProject ? projectId : undefined
  );
  const ownersQuery = useListVariableOwnersQuery(hasProject ? projectId : skipToken);

  const documentVariables = documentVariablesResult.variablesWithValues as VariableWithValues[] | undefined;
  const variablesOwners = ownersQuery.currentData?.variables;

  useEffect(() => {
    if (projectVariables.isError || documentVariablesResult.isError || ownersQuery.isError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [documentVariablesResult.isError, ownersQuery.isError, projectVariables.isError, snackbar]);

  // Document variables may contain out-dated variables that are injected into sections within the document
  // They need to be added into the `allVariables` array so consumers can access out of date variables easily
  const allVariables = useMemo(() => {
    const _allVariables = (projectVariables.variablesWithValues ?? []).concat(documentVariables || []);
    return _.uniqBy(_allVariables, (variable: VariableWithValues) => variable.id);
  }, [projectVariables.variablesWithValues, documentVariables]);

  const documentSectionVariables = useMemo(
    () => (documentVariables || []).filter(isSectionVariableWithValues) as SectionVariableWithValues[],
    [documentVariables]
  );

  const isLoading =
    (hasDocument && !document && documentResult?.status !== 'error') ||
    (hasProject && projectVariables.variablesWithValues === undefined && !projectVariables.isError) ||
    (hasProject && variablesOwners === undefined && !ownersQuery.isError) ||
    (hasDocument && hasProject && documentVariables === undefined && !documentVariablesResult.isError);

  useEffect(() => {
    void dispatch(requestListDocumentTemplates());
  }, [dispatch]);

  const reloadDocument = useCallback(() => {
    if (hasDocument) {
      void dispatch(requestGetDocument(documentId));
    }
  }, [dispatch, documentId, hasDocument]);

  useEffect(() => {
    reloadDocument();
  }, [reloadDocument]);

  const { refetch: refetchProjectVariables } = projectVariables;
  const { refetch: refetchDocumentVariables } = documentVariablesResult;

  const reloadVariables = useCallback(() => {
    refetchProjectVariables();
    refetchDocumentVariables();
  }, [refetchDocumentVariables, refetchProjectVariables]);

  const getUsedSections = useCallback(
    (variableId: number) => documentSectionVariables.reduce(getContainingSections(variableId), []),
    [documentSectionVariables]
  );

  const documentProducerData = useMemo<DocumentProducerData>(
    () => ({
      allVariables,
      document,
      documentId,
      documentSectionVariables,
      documentTemplate,
      documentVariables,
      getUsedSections,
      isLoading,
      projectId,
      reload: reloadDocument,
      variablesOwners,
      reloadVariables,
      reloadDocument,
    }),
    [
      allVariables,
      document,
      documentId,
      documentSectionVariables,
      documentTemplate,
      documentVariables,
      getUsedSections,
      isLoading,
      projectId,
      variablesOwners,
      reloadVariables,
      reloadDocument,
    ]
  );

  if (isLoading) {
    return <BusySpinner withSkrim />;
  }

  return <DocumentProducerContext.Provider value={documentProducerData}>{children}</DocumentProducerContext.Provider>;
};

export default DocumentProducerProvider;
