import React from 'react';

import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

import TableDisplay from 'src/components/DocumentProducer/TableDisplay';
import strings from 'src/strings';
import { TableVariableWithValues, VariableWithValues } from 'src/types/documentProducer/Variable';
import { VariableValueImageValue, VariableValueSelectValue } from 'src/types/documentProducer/VariableValue';
import { getImagePath } from 'src/utils/images';

import { displayValue } from './helpers';

const useStyles = makeStyles((theme: Theme) => ({
  variable: {
    color: theme.palette.TwClrTxt,
    backgroundColor: '#e9e2ba',
    fontSize: '16px',
    margin: '0 1px',
    padding: '0 1px',
  },
  image: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  caption: {
    fontSize: '16px',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
}));

type DisplayVariableValueProps = {
  docId: number;
  variable: VariableWithValues;
  reference: boolean;
};

export default function DisplayVariableValue({
  docId,
  variable,
  reference,
}: DisplayVariableValueProps): React.ReactElement {
  const classes = useStyles();

  switch (variable.type) {
    case 'Text':
    case 'Number':
    case 'Date':
    case 'Link':
      return <span className={classes.variable}>{variable.values.map((v) => displayValue(v)).join(', ')}</span>;
    case 'Image':
      return reference ? (
        <span className={classes.variable}>
          {variable.name} {strings.REFERENCE}
        </span>
      ) : (
        <>
          {variable.values.map((v, index) => {
            return (
              <div key={index} className={classes.image}>
                <img
                  src={getImagePath(docId, v.id, 500, 500)}
                  alt={(v as VariableValueImageValue).caption ?? `${variable.name}-${index}`}
                />
                <p className={classes.caption}>{(v as VariableValueImageValue).caption}</p>
              </div>
            );
          })}
        </>
      );
    case 'Select':
      const selectedValues = (variable.values[0] as VariableValueSelectValue)?.optionValues;
      return (
        <span className={classes.variable}>
          {`${
            variable.options
              .filter((o) => selectedValues?.includes(o.id))
              .map((o) => o.renderedText ?? o.name)
              .join(', ') || '--'
          }`}
        </span>
      );
    case 'Table':
      return reference ? (
        <span className={classes.variable}>
          {variable.name} {strings.REFERENCE}
        </span>
      ) : (
        <div className={classes.table}>
          <TableDisplay variable={variable as TableVariableWithValues} />
        </div>
      );
    default:
      return <span />;
  }
}
