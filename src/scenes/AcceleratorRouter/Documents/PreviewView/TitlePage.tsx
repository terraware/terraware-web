import { ReactElement } from 'react';

import { Document } from 'src/types/documentProducer/Document';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';

import PreviewSection from './PreviewSection';
import { getRelevantVariables } from './util';

type TitlePageProps = {
  doc: Document;
  titleSection: SectionVariableWithValues;
  variables: VariableWithValues[];
};

export default function TitlePage({ doc, titleSection, variables }: TitlePageProps): ReactElement {
  const relevantVariables = getRelevantVariables(titleSection, variables);
  return (
    <div id='title-page'>
      <img className='vcs-logo-full' src='assets/logo-vcs-full.png' alt='VCS Logo' />
      <h1>{doc.name}</h1>
      {titleSection && (
        <PreviewSection
          sectionVariableWithRelevantVariables={{ ...titleSection, relevantVariables }}
          isTopLevel={false}
          docId={doc.id}
          suppressCaptions={true}
        />
      )}
    </div>
  );
}
