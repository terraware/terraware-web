import React from 'react';

import { Box, useTheme } from '@mui/material';

import TableDisplay from 'src/components/DocumentProducer/TableDisplay';
import strings from 'src/strings';
import { TableVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueImageValue } from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import TextVariable from './TextVariable';

type DisplayVariableValueProps = {
  projectId: number;
  onEditVariableValue: (variable?: VariableWithValues) => void;
  variable: VariableWithValues;
  reference: boolean;
};

export default function DisplayVariableValue({
  projectId,
  onEditVariableValue,
  variable,
  reference,
}: DisplayVariableValueProps): React.ReactElement<any> {
  const theme = useTheme();

  const variableStyles = {
    color: theme.palette.TwClrTxt,
    backgroundColor: '#e9e2ba',
    fontSize: '16px',
    margin: '0 1px',
    padding: '0 1px',
  };

  switch (variable.type) {
    case 'Text':
    case 'Number':
    case 'Date':
    case 'Email':
    case 'Link':
    case 'Select':
      return (
        <TextVariable
          isEditing={false}
          icon='iconVariable'
          onClick={() => {
            onEditVariableValue(variable);
          }}
          reference={reference}
          variable={variable}
        />
      );
    case 'Image':
      return reference ? (
        <span style={variableStyles}>
          {variable.name} {strings.REFERENCE}
        </span>
      ) : (
        <>
          {variable.values.map((v, index) => {
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <img
                  src={getImagePath(projectId, v.id, 500, 500)}
                  alt={(v as VariableValueImageValue).caption ?? `${variable.name}-${index}`}
                />
                <p style={{ fontSize: '16px' }}>{(v as VariableValueImageValue).caption}</p>
              </Box>
            );
          })}
        </>
      );
    case 'Table':
      return reference ? (
        <span style={variableStyles}>
          {variable.name} {strings.REFERENCE}
        </span>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <TableDisplay variable={variable as TableVariableWithValues} />
        </Box>
      );
    default:
      return <span />;
  }
}
