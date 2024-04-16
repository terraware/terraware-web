import { useEffect, useState } from 'react';

import EditableSectionContainer from 'src/components/DocumentProducer/EditableSection/Container';
import MultiLineComponentNonEditable from 'src/components/DocumentProducer/MultiLineComponentNonEditable';
import PageContent from 'src/components/DocumentProducer/PageContent';
import { requestListVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Document as DocumentType } from 'src/types/documentProducer/Document';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';

export type DocumentProps = {
  document: DocumentType;
};

const DocumentTab = ({ document }: DocumentProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [variables, setVariables] = useState<VariableWithValues[]>();
  const result = useAppSelector((state) => selectVariablesWithValues(state, document.variableManifestId, document.id));

  useSelectorProcessor(result, setVariables);

  useEffect(() => {
    dispatch(requestListVariables(document.variableManifestId));
    dispatch(requestListVariablesValues(document.id));
  }, [dispatch, document.variableManifestId, document.id]);

  const onUpdate = () => {
    dispatch(requestListVariables(document.variableManifestId));
    dispatch(requestListVariablesValues(document.id));
  };

  const renderVariable = (variable: VariableWithValues) => {
    if (variable.type === 'Section') {
      return renderSection(variable as SectionVariableWithValues);
    }
    return [];
  };

  const renderSection = (section: SectionVariableWithValues): JSX.Element[] => {
    const sectionsToRender: JSX.Element[] = [];
    if (section.renderHeading) {
      sectionsToRender.push(
        <MultiLineComponentNonEditable
          id={section.sectionNumber}
          key={`component-${section.position}`}
          titleNumber={section.sectionNumber ?? ''}
          title={section.name}
          description={section.description || ''}
        />
      );
    } else {
      sectionsToRender.push(
        <EditableSectionContainer
          key={`component-${section.position}`}
          docId={document.id}
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
