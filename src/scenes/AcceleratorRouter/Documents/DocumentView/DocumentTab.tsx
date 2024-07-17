import React, { useEffect, useState } from 'react';

import EditableSectionContainer from 'src/components/DocumentProducer/EditableSection/Container';
import MultiLineComponentNonEditable from 'src/components/DocumentProducer/MultiLineComponentNonEditable';
import PageContent from 'src/components/DocumentProducer/PageContent';
import { requestListVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import {
  selectVariablesOwners,
  selectVariablesWithValues,
} from 'src/redux/features/documentProducer/variables/variablesSelector';
import {
  requestListVariables,
  requestListVariablesOwners,
} from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Document as DocumentType } from 'src/types/documentProducer/Document';
import {
  SectionVariableWithValues,
  VariableOwners,
  VariableStatusType,
  VariableWithValues,
} from 'src/types/documentProducer/Variable';
import { VariableValue } from 'src/types/documentProducer/VariableValue';

export type DocumentProps = {
  document: DocumentType;
};

const DocumentTab = ({ document }: DocumentProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [variables, setVariables] = useState<VariableWithValues[]>();
  const [variablesOwners, setVariablesOwners] = useState<VariableOwners[]>();
  const result = useAppSelector((state) =>
    selectVariablesWithValues(state, document.variableManifestId, document.projectId)
  );
  const ownersResult = useAppSelector((state) => selectVariablesOwners(state, document.projectId));

  useSelectorProcessor(result, setVariables);
  useSelectorProcessor(ownersResult, setVariablesOwners);

  useEffect(() => {
    dispatch(requestListVariables(document.variableManifestId));
    dispatch(requestListVariablesValues({ projectId: document.projectId }));
    dispatch(requestListVariablesOwners(document.projectId));
  }, [dispatch, document.variableManifestId, document.projectId]);

  const onUpdate = () => {
    dispatch(requestListVariables(document.variableManifestId));
    dispatch(requestListVariablesValues({ projectId: document.projectId }));
    dispatch(requestListVariablesOwners(document.projectId));
  };

  const getVariableOwner = (variableId: number) => {
    const variableOwner = variablesOwners?.find((vo) => vo.variableId.toString() === variableId.toString());
    const variableOwnerId = variableOwner?.ownedBy;
    return variableOwnerId;
  };

  const renderVariable = (variable: VariableWithValues) => {
    if (variable.type === 'Section') {
      return renderSection(variable as SectionVariableWithValues);
    }
    return [];
  };

  const renderSection = (section: SectionVariableWithValues): JSX.Element[] => {
    const sectionsToRender: JSX.Element[] = [];
    const firstVariableValue: VariableValue | undefined = (section?.variableValues || [])[0];
    const firstVariableValueStatus: VariableStatusType | undefined = firstVariableValue?.status;

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
          projectId={document.projectId}
          reload={onUpdate}
          ownerId={getVariableOwner(section.id)}
        />
      );
    } else {
      sectionsToRender.push(
        <EditableSectionContainer
          key={`component-${section.position}`}
          docId={document.id}
          projectId={document.projectId}
          section={section}
          allVariables={variables ?? []}
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
  };

  return (
    <PageContent styles={{ marginTop: 0 }}>
      {variables?.map((variable) => {
        return renderVariable(variable);
      })}
    </PageContent>
  );
};

export default DocumentTab;
