import React, { ReactElement, useMemo } from 'react';

import { DateTime } from 'luxon';

import strings from 'src/strings';
import { Document } from 'src/types/documentProducer/Document';
import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';

import PreviewSection from './PreviewSection';
import { getRelevantVariables } from './util';

type TitlePageProps = {
  allVariables: VariableWithValues[];
  doc: Document;
  documentVariables: VariableWithValues[];
  projectName: string;
  titleSection: SectionVariableWithValues;
};

export default function TitlePage({
  allVariables,
  doc,
  documentVariables,
  projectName,
  titleSection,
}: TitlePageProps): ReactElement<any> | null {
  const isoDate: string | null = useMemo(() => DateTime.fromJSDate(new Date()).toISODate(), []);

  if (!(documentVariables.length > 0 && allVariables.length > 0)) {
    return null;
  }

  const relevantVariables = [
    ...getRelevantVariables(titleSection, documentVariables),
    ...getRelevantVariables(titleSection, allVariables),
  ];

  return (
    <div id='title-page'>
      <h1>
        {projectName} - {doc.name}
      </h1>

      {titleSection && (
        <PreviewSection
          sectionVariableWithRelevantVariables={{ ...titleSection, relevantVariables }}
          isTopLevel={false}
          docId={doc.id}
          projectId={doc.projectId}
          suppressCaptions={true}
        />
      )}

      <div id='title-page-content-footer'>
        <h2>
          {isoDate}
          <br />
          {strings.VERSION_PREVIEW}
        </h2>
      </div>
    </div>
  );
}
