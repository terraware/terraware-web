import React, { ReactElement } from 'react';

import { SectionVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueValue } from 'src/types/documentProducer/VariableValue';

import SectionVariable from './SectionVariable';

interface PreviewSectionProps {
  isTopLevel: boolean;
  sectionVariableWithRelevantVariables: SectionVariableWithValues & { relevantVariables: VariableWithValues[] };
  docId: number;
  suppressCaptions?: boolean;
}

const PreviewSection = ({
  sectionVariableWithRelevantVariables,
  isTopLevel,
  docId,
  suppressCaptions,
}: PreviewSectionProps): ReactElement | null => {
  const isLeaf = !sectionVariableWithRelevantVariables.renderHeading;
  const isMinor = !isTopLevel && !isLeaf;

  if (isLeaf) {
    if (!sectionVariableWithRelevantVariables.values) {
      return null;
    }

    return (
      <div className='section-body'>
        {sectionVariableWithRelevantVariables.values.map((value: VariableValueValue, index: number) => {
          switch (value.type) {
            case 'SectionText':
              return (
                <span key={index}>
                  {value.textValue}
                  {value.citation && <span className='footnote'>{value.citation}</span>}
                </span>
              );
            case 'SectionVariable':
              return (
                <SectionVariable
                  sectionVariable={sectionVariableWithRelevantVariables}
                  sectionVariableValue={value}
                  key={index}
                  docId={docId}
                  suppressCaptions={suppressCaptions}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }

  return (
    <>
      {isTopLevel && (
        <h1 className='toc-major'>
          <span className='section-number'>{sectionVariableWithRelevantVariables.sectionNumber}</span>
          <span> {sectionVariableWithRelevantVariables.name}</span>
        </h1>
      )}

      {isMinor && (
        <h2 className='toc-minor'>
          <span className='section-number'>{sectionVariableWithRelevantVariables.sectionNumber}</span>
          <span> {sectionVariableWithRelevantVariables.name}</span>
        </h2>
      )}

      {sectionVariableWithRelevantVariables.children.map(
        (_sectionVariable: SectionVariableWithValues, index: number) => {
          return (
            <PreviewSection
              sectionVariableWithRelevantVariables={{
                ..._sectionVariable,
                relevantVariables: sectionVariableWithRelevantVariables.relevantVariables,
              }}
              isTopLevel={false}
              key={index}
              docId={docId}
              suppressCaptions={suppressCaptions}
            />
          );
        }
      )}
    </>
  );
};

export default PreviewSection;
