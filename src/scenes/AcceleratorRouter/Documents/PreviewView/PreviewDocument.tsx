import React, { ReactElement, useEffect, useState } from 'react';

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
import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';

import PreviewSection from './PreviewSection';
import TitlePage from './TitlePage';
import { calculateFigures, getRelevantVariables } from './util';

type PreviewDocumentProps = {
  doc: Document;
};

export default function PreviewDocument({ doc }: PreviewDocumentProps): ReactElement | null {
  const dispatch = useAppDispatch();

  const [documentVariables, setDocumentVariables] = useState<VariableWithValues[]>();
  const documentVariablesResult = useAppSelector((state) =>
    selectVariablesWithValues(state, doc.variableManifestId, doc.projectId)
  );
  useSelectorProcessor(documentVariablesResult, setDocumentVariables);

  const allVariables: VariableWithValues[] = useAppSelector((state) =>
    selectAllVariablesWithValues(state, doc.projectId)
  );

  useEffect(() => {
    dispatch(requestListAllVariables());
    dispatch(requestListVariables(doc.variableManifestId));
    dispatch(requestListVariablesValues({ projectId: doc.projectId }));
  }, [dispatch, doc.variableManifestId, doc.projectId]);

  const [sectionVariables, setSectionVariables] = useState<SectionVariableWithValues[]>([]);
  // const [titleSection, setTitleSection] = useState<SectionVariableWithValues>();
  const [titleSection] = useState<SectionVariableWithValues>();

  useEffect(() => {
    if (!documentVariables) {
      return;
    }

    // TODO We need to put a title section into the sample data to test this out. Currently there is only one section
    // const firstSection = documentVariables.shift();

    setSectionVariables(documentVariables as SectionVariableWithValues[]);
    // setTitleSection(firstSection as SectionVariableWithValues);
  }, [documentVariables]);

  // TODO remove this, things in state should not be mutated
  calculateFigures(sectionVariables, documentVariables || [], 'Table');
  calculateFigures(sectionVariables, documentVariables || [], 'Image');

  if (!(documentVariables && allVariables.length > 0)) {
    return null;
  }

  return (
    <>
      {titleSection && (
        <TitlePage
          allVariables={allVariables}
          doc={doc}
          documentVariables={documentVariables}
          titleSection={titleSection}
        />
      )}

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
          const relevantVariables = [
            ...getRelevantVariables(sectionVariable, documentVariables),
            ...getRelevantVariables(sectionVariable, allVariables),
          ];

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
