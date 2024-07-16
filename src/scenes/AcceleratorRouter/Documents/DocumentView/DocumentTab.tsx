import React, { useCallback, useEffect, useState } from 'react';

import EditableSectionContainer from 'src/components/DocumentProducer/EditableSection/Container';
import MultiLineComponentNonEditable from 'src/components/DocumentProducer/MultiLineComponentNonEditable';
import PageContent from 'src/components/DocumentProducer/PageContent';
import { requestListVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectAllVariablesWithValues,
  selectVariablesWithValues,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListAllVariables,
  requestListVariables,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Document as DocumentType } from 'src/types/documentProducer/Document';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';

export type DocumentProps = {
  document: DocumentType;
};

const DocumentTab = ({ document }: DocumentProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [documentVariables, setDocumentVariables] = useState<VariableWithValues[]>();
  const documentVariablesResult = useAppSelector((state) =>
    selectVariablesWithValues(state, document.variableManifestId, document.projectId)
  );
  useSelectorProcessor(documentVariablesResult, setDocumentVariables);

  const [listVariablesRequestId, setListVariablesRequestId] = useState('');
  const allVariables: VariableWithValues[] = useAppSelector((state) =>
    selectAllVariablesWithValues(state, listVariablesRequestId, document.projectId)
  );

  const onUpdate = useCallback(() => {
    dispatch(requestListVariables(document.variableManifestId));
    dispatch(requestListVariablesValues({ projectId: document.projectId }));

    const request = dispatch(requestListAllVariables());
    setListVariablesRequestId(request.requestId);
  }, [dispatch, document.projectId, document.variableManifestId]);

  useEffect(() => {
    onUpdate();
  }, [onUpdate]);

  const renderSection = useCallback(
    (section: SectionVariableWithValues): JSX.Element[] => {
      const sectionsToRender: JSX.Element[] = [];
      if (section.renderHeading) {
        sectionsToRender.push(
          <MultiLineComponentNonEditable
            id={section.sectionNumber}
            key={`component-${section.position}`}
            titleNumber={section.sectionNumber ?? ''}
            title={section.name}
            description={section.description || ''}
            status={section.values && section.values.length > 0 ? 'Complete' : 'Incomplete'}
          />
        );
      } else {
        sectionsToRender.push(
          <EditableSectionContainer
            key={`component-${section.position}`}
            docId={document.id}
            projectId={document.projectId}
            section={section}
            allVariables={allVariables ?? []}
            onUpdate={onUpdate}
            manifestId={document.variableManifestId}
          />
        );
      }

      if (section.children) {
        section.children.forEach((child: SectionVariableWithValues) => {
          const childWithRecommendedVariables = { ...child, recommends: [...child.recommends, ...section.recommends] };
          sectionsToRender.push(...renderSection(childWithRecommendedVariables));
        });
      }
      return sectionsToRender;
    },
    [allVariables, document, onUpdate]
  );

  const renderVariable = useCallback(
    (variable: VariableWithValues) => {
      if (variable.type === 'Section') {
        return renderSection(variable as SectionVariableWithValues);
      }
      return [];
    },
    [renderSection]
  );

  return (
    <PageContent styles={{ marginTop: 0 }}>
      {documentVariables?.map((documentVariable) => {
        return renderVariable(documentVariable);
      })}
    </PageContent>
  );
};

export default DocumentTab;
