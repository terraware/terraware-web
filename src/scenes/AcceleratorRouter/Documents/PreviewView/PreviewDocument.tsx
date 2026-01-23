import React, { ReactElement, useEffect, useState } from 'react';

import { useDocumentProducerData } from 'src/providers/DocumentProducer/Context';
import strings from 'src/strings';
import { SectionVariableWithValues, isSectionVariableWithValues } from 'src/types/documentProducer/Variable';

import PreviewSection from './PreviewSection';
import TitlePage from './TitlePage';
import { calculateFigures, getRelevantVariables } from './util';

type PreviewDocumentProps = {
  projectName: string;
};

export default function PreviewDocument({ projectName }: PreviewDocumentProps): ReactElement<any> | null {
  const { allVariables, document, documentId, documentVariables, projectId } = useDocumentProducerData();

  const [sectionVariables, setSectionVariables] = useState<SectionVariableWithValues[]>([]);
  const [titleSection, setTitleSection] = useState<SectionVariableWithValues>();

  useEffect(() => {
    if (!documentVariables) {
      return;
    }

    const documentSectionVariables = documentVariables.filter(
      isSectionVariableWithValues
    ) as SectionVariableWithValues[];

    const firstSection = documentSectionVariables.shift();

    setSectionVariables(documentSectionVariables);
    setTitleSection(firstSection);
  }, [documentVariables]);

  // TODO remove this, things in state should not be mutated
  calculateFigures(sectionVariables, allVariables || [], 'Table');
  calculateFigures(sectionVariables, allVariables || [], 'Image');

  if (!(document && documentVariables && allVariables)) {
    return null;
  }

  return (
    <>
      <div className='footer-left'>
        <p>{projectName} - Preview</p>
      </div>

      {titleSection && (
        <TitlePage
          allVariables={allVariables}
          doc={document}
          documentVariables={documentVariables}
          projectName={projectName}
          titleSection={titleSection}
        />
      )}

      <div className='header-left'>
        <img width='205px' src='assets/logo-tw.svg' alt='Terraware logo' />
      </div>

      <div className='header-right' />

      <div className='footer-left'>
        <p>
          {projectName} - {strings.PREVIEW}
        </p>
      </div>

      <div id='table-of-contents'>
        <h1>{strings.TABLE_OF_CONTENTS}</h1>
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
              docId={documentId}
              projectId={projectId}
            />
          );
        })}
      </>
    </>
  );
}
