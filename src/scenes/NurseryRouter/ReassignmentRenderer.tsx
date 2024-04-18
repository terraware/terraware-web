/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react';

import { Box, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Autocomplete, DropdownItem, Textfield } from '@terraware/web-components';

import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import { NumericFormatter } from 'src/types/Number';

const useStyles = makeStyles(() => ({
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
  id: number;
  name: string;
};

export type ZoneInfo = {
  id: number;
  name: string;
  subzones: SubzoneInfo[];
};

export type Reassignment = {
  plantingId: number;
  newSubzoneId?: number;
  newZoneId?: number;
  quantity?: number;
  notes?: string;
  error?: string;
};

export type ReassignmentRowType = {
  numPlants: number;
  species: string;
  siteName: string;
  originalZone: ZoneInfo;
  originalSubzone: SubzoneInfo;
  reassignment: Reassignment;
};

export type ReassignmentRendererProps = {
  zones: ZoneInfo[];
  setReassignment: (reassignment: Reassignment) => void;
  numericFormatter: NumericFormatter;
};

export default function ReassignmentRenderer({ zones, setReassignment, numericFormatter }: ReassignmentRendererProps) {
  return function ReassignmentlCellRenderer(props: RendererProps<ReassignmentRowType>): JSX.Element {
    const classes = useStyles();
    const { column, row } = props;
    const { numPlants, originalZone, originalSubzone, reassignment } = row;
    const { plantingId, newSubzoneId, newZoneId, error, quantity, notes } = reassignment;

    const zoneOptions: DropdownItem[] = zones
      .filter((zone) => zone.subzones.some((subzone) => subzone.id !== originalSubzone.id))
      .map((zone) => ({ label: zone.name, value: zone.id }));

    const subzoneOptions: DropdownItem[] = newZoneId
      ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        zones
          .find((zone) => zone.id === newZoneId)!!
          .subzones.filter((subzone) => subzone.id !== originalSubzone.id)
          .map((subzone) => ({
            value: subzone.id,
            label: subzone.name,
          }))
      : [];

    const selectedZone = zoneOptions.find((option) => option.value === newZoneId);
    const selectedSubzone = subzoneOptions.find((option) => option.value === newSubzoneId);

    const onUpdateQuantity = (value: any) => {
      if (value === '') {
        setReassignment({ ...reassignment, quantity: undefined });
        return;
      }
      const quantityValue = Number(value);
      if (isNaN(quantityValue) || quantityValue < 0 || quantityValue > numPlants) {
        reassignment.error = strings.INVALID_VALUE;
      } else {
        reassignment.error = undefined;
      }
      setReassignment({ ...reassignment, quantity: quantityValue });
    };

    if (column.key === 'newZone') {
      const value = (
        <Autocomplete
          id={`newZone_${plantingId}`}
          selected={selectedZone}
          onChange={(newZoneValue: any) => {
            if (newZoneValue.value) {
              setReassignment({ ...reassignment, newZoneId: newZoneValue.value, newSubzoneId: undefined });
            }
          }}
          isEqual={(option: any, selected: any) => option?.value === selected?.value}
          label={''}
          placeholder={strings.SELECT}
          disabled={selectedSubzone !== undefined}
          options={zoneOptions}
          freeSolo={false}
          hideClearIcon={true}
          className={classes.subzone}
        />
      );

      return <CellRenderer {...props} value={value} className={classes.cell} />;
    }

    if (column.key === 'newSubzone') {
      const value = (
        <Autocomplete
          id={`newSubzone_${plantingId}`}
          selected={selectedSubzone}
          onChange={(newSubzoneValue: any) => {
            setReassignment({ ...reassignment, newSubzoneId: newSubzoneValue.value });
          }}
          isEqual={(option: any, selected: any) => option?.value === selected?.value}
          label={''}
          placeholder={strings.SELECT}
          disabled={subzoneOptions.length === 0}
          options={subzoneOptions}
          freeSolo={false}
          hideClearIcon={false}
          className={classes.subzone}
        />
      );

      return <CellRenderer {...props} value={value} className={classes.cell} />;
    }

    if (column.key === 'reassign') {
      const value = (
        <Box display='flex' alignItems={error ? 'start' : 'center'}>
          <Textfield
            id={`quantity_${plantingId}`}
            type='number'
            min={0}
            onChange={onUpdateQuantity}
            value={quantity?.toString()}
            label={''}
            errorText={error}
            className={classes.input}
          />
          <Typography paddingLeft={1} paddingTop={error ? '10px' : 0}>
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
          onChange={(text: any) => setReassignment({ ...reassignment, notes: text })}
          value={notes}
          label={''}
          className={classes.text}
        />
      );

      return <CellRenderer {...props} value={value} className={classes.cell} />;
    }

    if (column.key === 'originalSubzone') {
      return <CellRenderer {...props} value={originalSubzone.name} />;
    }

    if (column.key === 'originalZone') {
      return <CellRenderer {...props} value={originalZone.name} />;
    }

    return <CellRenderer {...props} />;
  };
}
