import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { RendererProps, TableRowType } from '@terraware/web-components';
import { Textfield } from '@terraware/web-components';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import strings from 'src/strings';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
      overflow: 'visible',
    },
  },
  input: {
    maxWidth: '140px',

    '& label': {
      whiteSpace: 'break-spaces',
    },
  },
}));

export type PlantingSiteSpeciesCellRendererProps = {
  editMode: boolean;
  validate?: boolean;
};

export default function PlantingSiteSpeciesCellRenderer({ editMode, validate }: PlantingSiteSpeciesCellRendererProps) {
  const classes = useStyles();

  return (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, index, onRowClick } = props;
    const createInput = (id: string) => {
      if (onRowClick) {
        return (
          <TableCellInput
            id={id}
            initialValue={row[id]}
            isPercentage={column.key === 'mortalityRateInField'}
            onConfirmEdit={onRowClick}
            className={classes.input}
            validate={validate}
          />
        );
      }
    };

    if (column.key === 'growthForm') {
      let growthFormValue = '';
      switch (row.growthForm) {
        case 'Tree':
          growthFormValue = strings.TREE;
          break;
        case 'Shrub':
          growthFormValue = strings.SHRUB;
          break;
        case 'Forb':
          growthFormValue = strings.FORB;
          break;
        case 'Graminoid':
          growthFormValue = strings.GRAMINOID;
          break;
        case 'Fern':
          growthFormValue = strings.FERN;
          break;
      }
      return <CellRenderer index={index} row={row} column={column} value={growthFormValue} />;
    }

    if (editMode && (column.key === 'totalPlanted' || column.key === 'mortalityRateInField')) {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={createInput(column.key)}
          row={row}
          className={classes.text}
        />
      );
    }

    return <CellRenderer {...props} className={classes.text} />;
  };
}

type TableCellInputProps = {
  id: string;
  initialValue: string;
  isPercentage?: boolean;
  onConfirmEdit: (value: string | undefined) => void;
  className: string;
  validate?: boolean;
};

function TableCellInput(props: TableCellInputProps): JSX.Element {
  const { id, initialValue, isPercentage, onConfirmEdit, className, validate } = props;
  const [inputValue, setInputValue] = useState(initialValue);
  const inputInvalid = inputValue === null || inputValue === undefined || inputValue === '';

  return (
    <Textfield
      id={id}
      type='number'
      onChange={(newValue) =>
        setInputValue(
          `${
            newValue === ''
              ? ''
              : isPercentage
              ? Math.max(0, Math.min(100, Math.floor(newValue as number)))
              : Math.max(0, Math.floor(newValue as number))
          }`
        )
      }
      onBlur={() => onConfirmEdit(inputValue)}
      value={inputValue}
      label={''}
      className={className}
      min={0}
      max={isPercentage ? 100 : undefined}
      errorText={validate && inputInvalid ? strings.REQUIRED_FIELD : ''}
    />
  );
}
