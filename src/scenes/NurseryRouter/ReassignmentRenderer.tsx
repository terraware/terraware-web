/* eslint-disable @typescript-eslint/no-extra-non-null-assertion */
import React from 'react';

import { Box, Typography } from '@mui/material';
import { Autocomplete, DropdownItem, Textfield } from '@terraware/web-components';

import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import { NumberFormatter } from 'src/types/Number';

export type SubstratumInfo = {
  id: number;
  name: string;
};

export type StratumInfo = {
  id: number;
  name: string;
  substrata: SubstratumInfo[];
};

export type Reassignment = {
  plantingId: number;
  newSubstratumId?: number;
  newStratumId?: number;
  quantity?: number;
  notes?: string;
  error?: string;
};

export type ReassignmentRowType = {
  numPlants: number;
  species: string;
  siteName: string;
  originalStratum: StratumInfo;
  originalSubstratum: SubstratumInfo;
  reassignment: Reassignment;
};

export type ReassignmentRendererProps = {
  strata: StratumInfo[];
  setReassignment: (reassignment: Reassignment) => void;
  numberFormatter: NumberFormatter;
};

export default function ReassignmentRenderer({ strata, setReassignment, numberFormatter }: ReassignmentRendererProps) {
  // eslint-disable-next-line react/display-name
  return (props: RendererProps<ReassignmentRowType>): JSX.Element => {
    const { column, row } = props;
    const { numPlants, originalStratum, originalSubstratum, reassignment } = row;
    const { plantingId, newSubstratumId, newStratumId, error, quantity, notes } = reassignment;

    const substratumStyles = {
      minWidth: '175px',
    };

    const cellStyles = {
      '&.MuiTableCell-root': {
        height: '76px',
      },
    };

    const stratumOptions: DropdownItem[] = strata
      .filter((stratum) => stratum.substrata.some((substratum) => substratum.id !== originalSubstratum.id))
      .map((stratum) => ({ label: stratum.name, value: stratum.id }));

    const substratumOptions: DropdownItem[] = newStratumId
      ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        strata
          .find((stratum) => stratum.id === newStratumId)!!
          .substrata.filter((substratum) => substratum.id !== originalSubstratum.id)
          .map((substratum) => ({
            value: substratum.id,
            label: substratum.name,
          }))
      : [];

    const selectedStratum = stratumOptions.find((option) => option.value === newStratumId);
    const selectedSubstratum = substratumOptions.find((option) => option.value === newSubstratumId);

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

    if (column.key === 'newStratum') {
      const value = (
        <Autocomplete
          id={`newStratum_${plantingId}`}
          selected={selectedStratum}
          onChange={(newStratumValue: any) => {
            if (newStratumValue.value) {
              setReassignment({ ...reassignment, newStratumId: newStratumValue.value, newSubstratumId: undefined });
            }
          }}
          isEqual={(option: any, selected: any) => option?.value === selected?.value}
          label={''}
          placeholder={strings.SELECT}
          disabled={selectedSubstratum !== undefined}
          options={stratumOptions}
          freeSolo={false}
          hideClearIcon={true}
          sx={substratumStyles}
        />
      );

      return <CellRenderer {...props} value={value} sx={cellStyles} />;
    }

    if (column.key === 'newSubstratum') {
      const value = (
        <Autocomplete
          id={`newSubstratum_${plantingId}`}
          selected={selectedSubstratum}
          onChange={(newSubstratumValue: any) => {
            setReassignment({ ...reassignment, newSubstratumId: newSubstratumValue.value });
          }}
          isEqual={(option: any, selected: any) => option?.value === selected?.value}
          label={''}
          placeholder={strings.SELECT}
          disabled={substratumOptions.length === 0}
          options={substratumOptions}
          freeSolo={false}
          hideClearIcon={false}
          sx={substratumStyles}
        />
      );

      return <CellRenderer {...props} value={value} sx={cellStyles} />;
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
            sx={{ maxWidth: '88px' }}
          />
          <Typography paddingLeft={1} paddingTop={error ? '10px' : 0}>
            / {numberFormatter.format(numPlants)}
          </Typography>
        </Box>
      );

      return <CellRenderer {...props} value={value} sx={cellStyles} />;
    }

    if (column.key === 'notes') {
      const value = (
        <Textfield
          id={`notes_${plantingId}`}
          type='text'
          onChange={(text: any) => setReassignment({ ...reassignment, notes: text })}
          value={notes}
          label={''}
          sx={{ minWidth: '150px' }}
        />
      );

      return <CellRenderer {...props} value={value} sx={cellStyles} />;
    }

    if (column.key === 'originalSubstratum') {
      return <CellRenderer {...props} value={originalSubstratum.name} />;
    }

    if (column.key === 'originalStratum') {
      return <CellRenderer {...props} value={originalStratum.name} />;
    }

    return <CellRenderer {...props} />;
  };
}
