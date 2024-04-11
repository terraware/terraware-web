import React from 'react';

import { Box } from '@mui/material';

import {
  ImageVariable,
  SectionVariableWithValues,
  VariableUnion,
  VariableWithValues,
  isImageVariable,
} from 'src/types/documentProducer/Variable';
import { CombinedInjectedValue, ImageVariableValue } from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import { getSourceVariable } from './util';

export const getSourceImageVariable = (
  combinedInjectedValue: CombinedInjectedValue,
  sectionVariable: SectionVariableWithValues
): ImageVariable | false => {
  const sourceVariable: VariableUnion | undefined = getSourceVariable(combinedInjectedValue, sectionVariable);
  return isImageVariable(sourceVariable) ? sourceVariable : false;
};

type PreviewImageProps = {
  docId: number;
  combinedInjectedValue: CombinedInjectedValue;
  sectionVariable: SectionVariableWithValues & { relevantVariables: VariableWithValues[] };
  sourceImageVariable: ImageVariable;
  suppressCaptions?: boolean;
};

export const PreviewImage = ({
  docId,
  combinedInjectedValue,
  sectionVariable,
  sourceImageVariable,
  suppressCaptions,
}: PreviewImageProps): React.ReactElement => {
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
          const imgValue = img as ImageVariableValue;

          return (
            <div className='image-container' key={`image-${index}`}>
              <img width='75%' src={getImagePath(docId, img.id)} alt='doc' />
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
