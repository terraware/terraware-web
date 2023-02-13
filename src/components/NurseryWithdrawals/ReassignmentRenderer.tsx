import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Typography, Theme } from '@mui/material';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { Autocomplete, Textfield } from '@terraware/web-components';
import { NumericFormatter, NumericParser } from 'src/utils/useNumber';
import strings from 'src/strings';

const useStyles = makeStyles((theme: Theme) => ({
  plot: {
    minWidth: '175px',
  },
  input: {
    maxWidth: '88px',
  },
  text: {
    minWidth: '150px',
  },
}));

export type PlotInfo = {
  id: string;
  name: string;
};

export type Reassignment = {
  plantingId: number;
  newPlot?: PlotInfo;
  quantity?: string;
  notes?: string;
  error: object;
};

export type ReassignmentRendererProps = {
  plots: PlotInfo[];
  setReassignment: (reassignment: Reassignment) => void;
  numericParser: NumericParser;
  numericFormatter: NumericFormatter;
};

export default function ReassignmentRenderer({
  plots,
  setReassignment,
  numericParser,
  numericFormatter,
}: ReassignmentRendererProps) {
  return function ReassignmentlCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
    const classes = useStyles();
    const { column, row } = props;
    const { plot, reassignment, numPlants } = row;
    const { plantingId, newPlot, error, quantity, notes } = reassignment;

    const updateReassignment = (id: string, value: unknown) => {
      reassignment[id] = value;
      setReassignment(reassignment);
    };

    const otherPlots = plots
      .filter((otherPlot) => plot.id !== otherPlot.id)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
      .map((otherPlot) => ({ ...otherPlot, value: otherPlot.id, label: otherPlot.name }));

    const onUpdateQuantity = (value: any) => {
      if (value === '') {
        updateReassignment('quantity', undefined);
        return;
      }
      const quantityValue = numericParser.parse(value?.toString());
      if (isNaN(quantityValue) || quantityValue < 0 || quantityValue > numericParser.parse(numPlants?.toString())) {
        reassignment.error.quantity = strings.INVALID_VALUE;
      } else {
        reassignment.error.quantity = '';
      }
      updateReassignment('quantity', quantityValue);
    };

    if (column.key === 'newPlot') {
      const value = (
        <Autocomplete
          id={`newPlot_${plantingId}`}
          selected={newPlot}
          onChange={(newPlotValue: any) => {
            if (newPlotValue.value) {
              updateReassignment('newPlot', newPlotValue);
            }
          }}
          isEqual={(option: any, selected: any) => option?.value === selected?.value}
          label={''}
          placeholder={strings.SELECT}
          options={otherPlots}
          freeSolo={false}
          hideClearIcon={true}
          className={classes.plot}
        />
      );

      return <CellRenderer {...props} value={value} />;
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

      return <CellRenderer {...props} value={value} />;
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

      return <CellRenderer {...props} value={value} />;
    }

    if (column.key === 'originalPlot') {
      return <CellRenderer {...props} value={plot.name} />;
    }

    return <CellRenderer {...props} />;
  };
}
