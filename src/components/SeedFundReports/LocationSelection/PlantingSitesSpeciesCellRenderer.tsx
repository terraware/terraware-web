import React, { type JSX, useState } from 'react';

import { SxProps } from '@mui/material';
import { RendererProps, TableRowType } from '@terraware/web-components';
import { Textfield } from '@terraware/web-components';

import CellRenderer from 'src/components/common/table/TableCellRenderer';
import strings from 'src/strings';
import { Species, getGrowthFormsString } from 'src/types/Species';

export type PlantingSiteSpeciesCellRendererProps = {
  editMode: boolean;
  validate?: boolean;
};

export default function PlantingSiteSpeciesCellRenderer({ editMode, validate }: PlantingSiteSpeciesCellRendererProps) {
  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
      overflow: 'visible',
    },
  };

  // eslint-disable-next-line react/display-name
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
            validate={validate}
            sx={{
              maxWidth: '140px',
              '& label': {
                whiteSpace: 'break-spaces',
              },
            }}
          />
        );
      }
    };

    if (column.key === 'growthForms') {
      return <CellRenderer index={index} row={row} column={column} value={getGrowthFormsString(row as Species)} />;
    }

    if (editMode && (column.key === 'totalPlanted' || column.key === 'mortalityRateInField')) {
      return <CellRenderer index={index} column={column} value={createInput(column.key)} row={row} sx={textStyles} />;
    }

    return <CellRenderer {...props} sx={textStyles} />;
  };
}

type TableCellInputProps = {
  id: string;
  initialValue: string;
  isPercentage?: boolean;
  onConfirmEdit: (value: string | undefined) => void;
  className?: string;
  sx?: SxProps;
  validate?: boolean;
};

function TableCellInput(props: TableCellInputProps): JSX.Element {
  const { id, initialValue, isPercentage, onConfirmEdit, className, sx, validate } = props;
  const [inputValue, setInputValue] = useState(initialValue);
  /* eslint-disable-next-line eqeqeq */
  const inputInvalid = inputValue == null || inputValue === '';

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
      sx={sx}
    />
  );
}
