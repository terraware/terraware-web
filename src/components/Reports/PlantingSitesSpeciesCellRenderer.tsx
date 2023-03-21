import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { RendererProps, TableRowType } from '@terraware/web-components';
import { Textfield } from '@terraware/web-components';
import CellRenderer from 'src/components/common/table/TableCellRenderer';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
      overflow: 'visible',
    },
  },
  input: {
    maxWidth: '88px',

    '& label': {
      whiteSpace: 'break-spaces',
    },
  },
}));

export type PlantingSiteSpeciesCellRendererProps = {
  editMode: boolean;
};

export default function PlantingSiteSpeciesCellRenderer({ editMode }: PlantingSiteSpeciesCellRendererProps) {
  const classes = useStyles();

  return (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, index, onRowClick } = props;
    const createInput = (id: string) => {
      if (onRowClick) {
        return <TableCellInput id={id} initialValue={row[id]} onConfirmEdit={onRowClick} className={classes.input} />;
      }
    };

    if (
      editMode &&
      (column.key === 'totalPlanted' ||
        column.key === 'mortalityRateInField' ||
        column.key === 'mortalityRateInNursery')
    ) {
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
  onConfirmEdit: (value: string) => void;
  className: string;
};

function TableCellInput(props: TableCellInputProps): JSX.Element {
  const { id, initialValue, onConfirmEdit, className } = props;
  const [inputValue, setInputValue] = useState(initialValue);

  return (
    <Textfield
      id={id}
      type='number'
      onChange={(newValue) => setInputValue(newValue as string)}
      onBlur={() => onConfirmEdit(inputValue)}
      value={inputValue}
      label={''}
      className={className}
      min={0}
    />
  );
}
