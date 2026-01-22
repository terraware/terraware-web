import React from 'react';

import { Box, useTheme } from '@mui/material';

import TableDisplay from 'src/components/DocumentProducer/TableDisplay';
import strings from 'src/strings';
import { TableVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueImageValue, VariableValueSelectValue } from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import { displayValue } from '../EditableSection/helpers';

type DeliverableDisplayVariableValueProps = {
  projectId: number;
  variable: VariableWithValues;
};

export default function DeliverableDisplayVariableValue({
  projectId,
  variable,
}: DeliverableDisplayVariableValueProps): React.ReactElement<any> {
  const theme = useTheme();

  const variableStyles = {
    color: theme.palette.TwClrTxt,
    fontSize: '16px',
    margin: '0 1px',
    padding: '0 1px',
    whiteSpace: 'break-spaces',
  };

  switch (variable?.type) {
    case 'Text':
    case 'Number':
    case 'Date':
    case 'Email':
    case 'Link':
      return (
        <span style={variableStyles}>
          {variable.values.length ? variable.values.map((v) => displayValue(v)).join(', ') : '--'}
        </span>
      );
    case 'Image':
      return (
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
    case 'Select': {
      const selectedValues = (variable.values[0] as VariableValueSelectValue)?.optionValues;
      return (
        <span style={variableStyles}>
          {`${
            variable.options
              .filter((o) => selectedValues?.includes(o.id))
              .map((o) => o.name)
              .join(', ') || strings.UNSPECIFIED
          }`}
        </span>
      );
    }
    case 'Table':
      return (
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
