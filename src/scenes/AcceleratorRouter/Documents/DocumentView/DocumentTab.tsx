import React, { type JSX, useCallback, useState } from 'react';

import EditableSectionContainer from 'src/components/DocumentProducer/EditableSection/Container';
import MultiLineComponentNonEditable from 'src/components/DocumentProducer/MultiLineComponentNonEditable';
import PageContent from 'src/components/DocumentProducer/PageContent';
import { useUser } from 'src/providers';
import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import { SectionVariableWithValues, VariableStatusType, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

import Metadata from './Metadata';

const DocumentTab = (): JSX.Element => {
  const { allVariables, documentId, documentVariables, projectId, reload, variablesOwners, reloadVariables } =
    useDocumentProducerData();
  const { isAllowed } = useUser();
  const [metadataDisabled, setMetadataDisabled] = useState(!isAllowed('UPDATE_DELIVERABLE'));

  const getVariableOwner = useCallback(
    (variableId: number) => {
      const variableOwner = variablesOwners?.find((vo) => vo.variableId.toString() === variableId.toString());
      return variableOwner?.ownedBy;
    },
    [variablesOwners]
  );

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
            id={`${section.id}`}
            key={`component-${section.position}`}
            docId={documentId}
            projectId={projectId}
            section={section}
            allVariables={allVariables ?? []}
            onUpdate={reloadVariables}
            onEdit={(editing) => setMetadataDisabled(editing)}
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
    [allVariables, reload, reloadVariables, documentId, getVariableOwner, projectId]
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
      <Metadata disabled={metadataDisabled} />
      {documentVariables?.map((documentVariable) => {
        return renderVariable(documentVariable);
      })}
    </PageContent>
  );
};

export default DocumentTab;
