import React, { ReactElement, useEffect, useState } from 'react';

import { requestListVariablesValues } from 'src/redux/features/documentProducer/values/valuesThunks';
import { selectVariablesWithValues } from 'src/redux/features/documentProducer/variables/variablesSelector';
import { requestListVariables } from 'src/redux/features/documentProducer/variables/variablesThunks';
import { useSelectorProcessor } from 'src/redux/hooks/useSelectorProcessor';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import {
  SectionVariableWithValues,
  VariableWithValues,
  isSectionVariableWithValues,
} from 'src/types/documentProducer/Variable';

import PreviewSection from './PreviewSection';
import TitlePage from './TitlePage';
import { calculateFigures, getRelevantVariables } from './util';

type PreviewDocumentProps = {
  doc: Document;
};

export default function PreviewDocument({ doc }: PreviewDocumentProps): ReactElement | null {
  const dispatch = useAppDispatch();
  const [variables, setVariables] = useState<VariableWithValues[]>([]);
  const variablesWithValues = useAppSelector((state) =>
    selectVariablesWithValues(state, doc.variableManifestId, doc.id)
  );
  useSelectorProcessor(variablesWithValues, setVariables);

  useEffect(() => {
    dispatch(requestListVariables(doc.variableManifestId));
    dispatch(requestListVariablesValues({ projectId: doc.projectId }));
  }, [dispatch, doc.variableManifestId, doc.projectId]);

  const [sectionVariables, setSectionVariables] = useState<SectionVariableWithValues[]>([]);
  const [titleSection, setTitleSection] = useState<SectionVariableWithValues>();
  useEffect(() => {
    const allSections = variables.filter(isSectionVariableWithValues);
    const firstSection = allSections.shift();

    setSectionVariables(allSections as SectionVariableWithValues[]);
    setTitleSection(firstSection as SectionVariableWithValues);
  }, [variables]);

  calculateFigures(sectionVariables, variables, 'Table');
  calculateFigures(sectionVariables, variables, 'Image');

  return (
    <>
      {titleSection && <TitlePage doc={doc} titleSection={titleSection} variables={variables} />}
      <div id='table-of-contents'>
        <h1>{strings.CONTENTS}</h1>
        <hr />
      </div>
      <div className='header-left'>
        <img width='100px' src='assets/logo-vcs-initials.png' alt='VCS logo' />
      </div>
      <div className='header-right'>
        <p>{strings.VCS_TEMPLATE_NAME}</p>
      </div>

      <>
        {sectionVariables.map((sectionVariable, index) => {
          const relevantVariables = getRelevantVariables(sectionVariable, variables);
          return (
            <PreviewSection
              sectionVariableWithRelevantVariables={{ ...sectionVariable, relevantVariables }}
              isTopLevel={sectionVariable.renderHeading}
              key={index}
              docId={doc.id}
              projectId={doc.projectId}
            />
          );
        })}
      </>
    </>
  );
}
