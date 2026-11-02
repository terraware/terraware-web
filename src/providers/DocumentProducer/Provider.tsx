import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { skipToken } from '@reduxjs/toolkit/query';
import { BusySpinner } from '@terraware/web-components';
import _ from 'lodash';

import useDocumentVariablesWithValues from 'src/hooks/variables/useDocumentVariablesWithValues';
import useProjectVariablesWithValues from 'src/hooks/variables/useProjectVariablesWithValues';
import { useGetDocumentQuery } from 'src/queries/generated/documentProducerDocuments';
import { useListDocumentTemplatesQuery } from 'src/queries/generated/documentProducerTemplates';
import { useListVariableOwnersQuery } from 'src/queries/generated/documentProducerVariables';
import strings from 'src/strings';
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
  const pathParams = useParams<{ documentId: string; projectId: string }>();
  const documentId = Number(pathParams.documentId || -1);

  const hasDocument = documentId !== -1;
  const {
    currentData: documentData,
    isError: isDocumentError,
    refetch: refetchDocument,
  } = useGetDocumentQuery(documentId, { skip: !hasDocument });
  const document = documentData?.document;

  const projectId = (pathParams.projectId ? Number(pathParams.projectId) : document?.projectId) ?? -1;
  const documentTemplateId = document?.documentTemplateId ?? -1;
  const { currentData: documentTemplatesData } = useListDocumentTemplatesQuery();
  const documentTemplate = useMemo(
    () => documentTemplatesData?.documentTemplates.find((template) => template.id === documentTemplateId),
    [documentTemplatesData, documentTemplateId]
  );

  const snackbar = useSnackbar();
  useEffect(() => {
    if (isDocumentError) {
      snackbar.toastError(strings.GENERIC_ERROR);
    }
  }, [isDocumentError, snackbar]);

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
    (hasDocument && !document && !isDocumentError) ||
    (hasProject && projectVariables.variablesWithValues === undefined && !projectVariables.isError) ||
    (hasProject && variablesOwners === undefined && !ownersQuery.isError) ||
    (hasDocument && hasProject && documentVariables === undefined && !documentVariablesResult.isError);

  const reload = useCallback(() => {
    if (hasDocument) {
      void refetchDocument();
    }
  }, [hasDocument, refetchDocument]);

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
      reload,
      variablesOwners,
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
      reload,
    ]
  );

  if (isLoading) {
    return <BusySpinner withSkrim />;
  }

  return <DocumentProducerContext.Provider value={documentProducerData}>{children}</DocumentProducerContext.Provider>;
};

export default DocumentProducerProvider;
