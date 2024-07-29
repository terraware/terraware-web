import React, { ReactElement } from 'react';

import { Document } from 'src/types/documentProducer/Document';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';

import PreviewSection from './PreviewSection';
import { getRelevantVariables } from './util';

type TitlePageProps = {
  allVariables: VariableWithValues[];
  doc: Document;
  documentVariables: VariableWithValues[];
  titleSection: SectionVariableWithValues;
};

export default function TitlePage({
  allVariables,
  doc,
  documentVariables,
  titleSection,
}: TitlePageProps): ReactElement | null {
  if (!(documentVariables.length > 0 && allVariables.length > 0)) {
    return null;
  }

  const relevantVariables = [
    ...getRelevantVariables(titleSection, documentVariables),
    ...getRelevantVariables(titleSection, allVariables),
  ];

  return (
    <div id='title-page'>
      <img className='vcs-logo-full' src='assets/logo-vcs-full.png' alt='VCS Logo' />
      <h1>{doc.name}</h1>
      {titleSection && (
        <PreviewSection
          sectionVariableWithRelevantVariables={{ ...titleSection, relevantVariables }}
          isTopLevel={false}
          docId={doc.id}
          projectId={doc.projectId}
          suppressCaptions={true}
        />
      )}
    </div>
  );
}
