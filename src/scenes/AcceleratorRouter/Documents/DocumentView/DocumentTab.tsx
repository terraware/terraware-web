import React, { useCallback } from 'react';

import EditableSectionContainer from 'src/components/DocumentProducer/EditableSection/Container';
import MultiLineComponentNonEditable from 'src/components/DocumentProducer/MultiLineComponentNonEditable';
import PageContent from 'src/components/DocumentProducer/PageContent';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { SectionVariableWithValues, VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

const DocumentTab = (): JSX.Element => {
  const { allVariables, document, documentId, documentVariables, projectId, reload, variablesOwners, reloadVariables } =
    useDocumentProducerData();

  const getVariableOwner = (variableId: number) => {
    const variableOwner = variablesOwners?.find((vo) => vo.variableId.toString() === variableId.toString());
    const variableOwnerId = variableOwner?.ownedBy;
    return variableOwnerId;
  };

  const renderSection = useCallback(
    (section: SectionVariableWithValues): JSX.Element[] => {
      const firstVariableValue: VariableValue | undefined = (section?.variableValues || [])[0];
      const firstVariableValueStatus: VariableStatusType | undefined = firstVariableValue?.status;
      const sectionsToRender: JSX.Element[] = [];
      if (section.renderHeading) {
        sectionsToRender.push(
          <MultiLineComponentNonEditable
            id={section.sectionNumber}
            key={`component-${section.position}`}
            titleNumber={section.sectionNumber ?? ''}
            title={section.name}
            description={section.description || ''}
            status={firstVariableValueStatus || 'Incomplete'}
            variableId={section.id}
            projectId={projectId}
            reload={reload}
            reloadVariables={reloadVariables}
            ownerId={getVariableOwner(section.id)}
          />
        );
      } else {
        sectionsToRender.push(
          <EditableSectionContainer
            key={`component-${section.position}`}
            docId={documentId}
            projectId={projectId}
            section={section}
            allVariables={allVariables ?? []}
            onUpdate={reload}
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
    [allVariables, document, reload]
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
