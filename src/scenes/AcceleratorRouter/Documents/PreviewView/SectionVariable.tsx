import React from 'react';

import {
  CombinedInjectedValue,
  ExistingVariableValueUnion,
  VariableValue,
  VariableValueValue,
} from 'src/types/documentProducer/VariableValue';

import { PreviewImage, getSourceImageVariable } from './PreviewImage';
import { PreviewTable, getSourceTableVariable } from './PreviewTable';
import { getPrintValue } from './render';
import { SectionVariableWithRelevantVariables } from './util';

type SectionVariableProps = {
  sectionVariable: SectionVariableWithRelevantVariables;
  sectionVariableValue: VariableValueValue;
  projectId: number;
  suppressCaptions?: boolean;
};

const SectionVariable = ({
  sectionVariable,
  sectionVariableValue,
  projectId,
  suppressCaptions,
}: SectionVariableProps): React.ReactElement<any> => {
  const injectedValue = sectionVariable.variableValues.find(
    (value: VariableValue) =>
      'variableId' in sectionVariableValue && sectionVariableValue.variableId === value.variableId
  );

  const combinedInjectedValue: CombinedInjectedValue = {
    ...(injectedValue || ({} as VariableValue)),
    ...sectionVariableValue,
  };

  const sourceTableVariable = getSourceTableVariable(combinedInjectedValue, sectionVariable);
  if (sourceTableVariable) {
    return (
      <PreviewTable
        combinedInjectedValue={combinedInjectedValue}
        sectionVariable={sectionVariable}
        sourceTableVariable={sourceTableVariable}
        suppressCaptions={suppressCaptions}
      />
    );
  }

  const sourceImageVariable = getSourceImageVariable(combinedInjectedValue, sectionVariable);
  if (sourceImageVariable) {
    return (
      <PreviewImage
        projectId={projectId}
        combinedInjectedValue={combinedInjectedValue}
        sectionVariable={sectionVariable}
        sourceImageVariable={sourceImageVariable}
        suppressCaptions={suppressCaptions}
      />
    );
  }

  return (
    <span>
      {(combinedInjectedValue.values || ([] as ExistingVariableValueUnion[])).map(
        (value: ExistingVariableValueUnion, index: number): React.ReactElement<any> => {
          const printValue = getPrintValue(combinedInjectedValue, value, sectionVariable);

          // Default to inline
          if ('displayStyle' in combinedInjectedValue && combinedInjectedValue.displayStyle === 'Block') {
            return (
              <p key={index}>
                {printValue}
                {value.citation && <span className='footnote'>{value.citation}</span>}
              </p>
            );
          } else {
            return (
              <span key={index}>
                {printValue}
                {value.citation && <span className='footnote'>{value.citation}</span>}
              </span>
            );
          }
        }
      )}
    </span>
  );
};

export default SectionVariable;
