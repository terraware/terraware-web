import React from 'react';

import { Box } from '@mui/material';

import {
  ImageVariable,
  SectionVariableWithValues,
  VariableUnion,
  VariableWithValues,
  isImageVariable,
} from 'src/types/documentProducer/Variable';
import { CombinedInjectedValue } from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import { SectionVariableWithRelevantVariables, getSourceVariable } from './util';

export const getSourceImageVariable = (
  combinedInjectedValue: CombinedInjectedValue,
  sectionVariable: SectionVariableWithValues
): ImageVariable | false => {
  const sourceVariable: VariableUnion | undefined = getSourceVariable(combinedInjectedValue, sectionVariable);
  return isImageVariable(sourceVariable) ? sourceVariable : false;
};

type PreviewImageProps = {
  projectId: number;
  combinedInjectedValue: CombinedInjectedValue;
  sectionVariable: SectionVariableWithRelevantVariables;
  sourceImageVariable: ImageVariable;
  suppressCaptions?: boolean;
};

export const PreviewImage = ({
  projectId,
  combinedInjectedValue,
  sectionVariable,
  sourceImageVariable,
  suppressCaptions,
}: PreviewImageProps): React.ReactElement<any> => {
  const relevantImageVariable = sectionVariable.relevantVariables.find(
    (variable: VariableWithValues) => variable.id === sourceImageVariable.id
  );

  if (combinedInjectedValue.usageType === 'Reference') {
    return <span>Figure {(relevantImageVariable as any).figure}</span>;
  }

  return (
    <Box>
      {combinedInjectedValue.values?.map((img, index) => {
        if (img.type === 'Image') {
          const imgValue = img;

          return (
            <div className='image-container' key={`image-${index}`}>
              <img width='75%' src={getImagePath(projectId, img.id)} alt='doc' />
              {!suppressCaptions && (
                <p className='caption'>
                  Figure {(relevantImageVariable as any).figure} {imgValue.caption}{' '}
                  {imgValue.citation && <span className='footnote'>{imgValue.citation}</span>}
                </p>
              )}
            </div>
          );
        }
        return null;
      })}
    </Box>
  );
};
