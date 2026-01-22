import React, { ReactElement } from 'react';

import { SectionVariableWithValues } from 'src/types/documentProducer/Variable';
import { isSectionVariableVariableValue } from 'src/types/documentProducer/VariableValue';

import SectionVariable from './SectionVariable';
import { SectionVariableWithRelevantVariables } from './util';
import { collectTablesForPreview, isTableElement } from './util/markdown-table';

interface PreviewSectionProps {
  isTopLevel: boolean;
  sectionVariableWithRelevantVariables: SectionVariableWithRelevantVariables;
  docId: number;
  projectId: number;
  suppressCaptions?: boolean;
}

const PreviewSection = ({
  sectionVariableWithRelevantVariables,
  isTopLevel,
  docId,
  projectId,
  suppressCaptions,
}: PreviewSectionProps): ReactElement<any> | null => {
  const isLeaf = !sectionVariableWithRelevantVariables.renderHeading;
  const isMinor = !isTopLevel && !isLeaf;

  if (isLeaf) {
    if (!sectionVariableWithRelevantVariables.values) {
      return null;
    }

    const values = sectionVariableWithRelevantVariables.values;
    const valuesWithTables = collectTablesForPreview(values);

    return (
      <div className='section-body'>
        {valuesWithTables.map((value, index) => {
          if (isTableElement(value)) {
            return (
              <table key={index}>
                <thead>
                  <tr>
                    {value.headers.map((header, headerIndex) => (
                      <th scope='col' key={headerIndex}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {value.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => {
                        if (Array.isArray(cell)) {
                          return (
                            <td key={cellIndex}>
                              {cell.map((cellPart, cellPartIndex) => {
                                if (isSectionVariableVariableValue(cellPart)) {
                                  return (
                                    <SectionVariable
                                      key={cellPartIndex}
                                      sectionVariable={sectionVariableWithRelevantVariables}
                                      sectionVariableValue={cellPart}
                                      projectId={projectId}
                                      suppressCaptions={suppressCaptions}
                                    />
                                  );
                                } else {
                                  return cellPart;
                                }
                              })}
                            </td>
                          );
                        }

                        if (isSectionVariableVariableValue(cell)) {
                          return (
                            <td key={cellIndex}>
                              <SectionVariable
                                sectionVariable={sectionVariableWithRelevantVariables}
                                sectionVariableValue={cell}
                                projectId={projectId}
                                suppressCaptions={suppressCaptions}
                              />
                            </td>
                          );
                        }

                        return <td key={cellIndex}>{cell}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          }

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
                  projectId={projectId}
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
          <span className='section-number'>{sectionVariableWithRelevantVariables.sectionNumber}.</span>
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
              projectId={projectId}
              suppressCaptions={suppressCaptions}
            />
          );
        }
      )}
    </>
  );
};

export default PreviewSection;
