import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Typography, Theme } from '@mui/material';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { Autocomplete, Textfield } from '@terraware/web-components';
import { NumericFormatter } from 'src/types/Number';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  subzone: {
    minWidth: '175px',
  },
  input: {
    maxWidth: '88px',
  },
  text: {
    minWidth: '150px',
  },
  cell: {
    '&.MuiTableCell-root': {
      height: '76px',
    },
  },
}));

export type SubzoneInfo = {
  id: string;
  name: string;
};

export type Reassignment = {
  plantingId: number;
  newSubzone?: SubzoneInfo;
  quantity?: string;
  notes?: string;
  error: object;
};

export type ReassignmentRendererProps = {
  subzones: SubzoneInfo[];
  setReassignment: (reassignment: Reassignment) => void;
  numericFormatter: NumericFormatter;
};

export default function ReassignmentRenderer({
  subzones,
  setReassignment,
  numericFormatter,
}: ReassignmentRendererProps) {
  return function ReassignmentlCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
    const classes = useStyles();
    const { column, row } = props;
    const { subzone, reassignment, numPlants } = row;
    const { plantingId, newSubzone, error, quantity, notes } = reassignment;

    const updateReassignment = (id: string, value: unknown) => {
      reassignment[id] = value;
      setReassignment(reassignment);
    };

    const otherSubzones = subzones
      .filter((otherSubzone) => subzone.id !== otherSubzone.id)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((otherSubzone) => ({ ...otherSubzone, value: otherSubzone.id, label: otherSubzone.name }));

    const onUpdateQuantity = (value: any) => {
      if (value === '') {
        updateReassignment('quantity', undefined);
        return;
      }
      const quantityValue = Number(value);
      if (isNaN(quantityValue) || quantityValue < 0 || quantityValue > numPlants?.toString()) {
        reassignment.error.quantity = strings.INVALID_VALUE;
      } else {
        reassignment.error.quantity = '';
      }
      updateReassignment('quantity', quantityValue);
    };

    if (column.key === 'newSubzone') {
      const value = (
        <Autocomplete
          id={`newSubzone_${plantingId}`}
          selected={newSubzone}
          onChange={(newSubzoneValue: any) => {
            if (newSubzoneValue.value) {
              updateReassignment('newSubzone', newSubzoneValue);
            }
          }}
          isEqual={(option: any, selected: any) => option?.value === selected?.value}
          label={''}
          placeholder={strings.SELECT}
          options={otherSubzones}
          freeSolo={false}
          hideClearIcon={true}
          className={classes.subzone}
        />
      );

      return <CellRenderer {...props} value={value} className={classes.cell} />;
    }

    if (column.key === 'reassign') {
      const value = (
        <Box display='flex' alignItems={error.quantity ? 'start' : 'center'}>
          <Textfield
            id={`quantity_${plantingId}`}
            type='number'
            min={0}
            onChange={onUpdateQuantity}
            value={quantity}
            label={''}
            errorText={error.quantity}
            className={classes.input}
          />
          <Typography paddingLeft={1} paddingTop={error.quantity ? '10px' : 0}>
            / {numericFormatter.format(numPlants)}
          </Typography>
        </Box>
      );

      return <CellRenderer {...props} value={value} className={classes.cell} />;
    }

    if (column.key === 'notes') {
      const value = (
        <Textfield
          id={`notes_${plantingId}`}
          type='text'
          onChange={(text: any) => updateReassignment('notes', text)}
          value={notes}
          label={''}
          className={classes.text}
        />
      );

      return <CellRenderer {...props} value={value} className={classes.cell} />;
    }

    if (column.key === 'originalSubzone') {
      return <CellRenderer {...props} value={subzone.name} />;
    }

    return <CellRenderer {...props} />;
  };
}
