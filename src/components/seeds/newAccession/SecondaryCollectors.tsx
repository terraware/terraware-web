import { Close } from '@mui/icons-material';
import { Box, IconButton, Link } from '@mui/material';
import React from 'react';
import strings from 'src/strings';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';
import TextField from '../../common/TextField';

interface Props {
  id: string;
  secondaryCollectors?: string[];
  onChange: (id: string, value: string[]) => void;
  disabled?: boolean;
}

export default function SecondaryCollectors({
  id,
  secondaryCollectors = [''],
  onChange,
  disabled,
}: Props): JSX.Element {
  const onAddCollector = () => {
    const updatedSecondaryCollectors = [...secondaryCollectors];
    updatedSecondaryCollectors.push('');

    onChange(id, updatedSecondaryCollectors);
  };

  const onCollectorChange = (value: unknown, index: number) => {
    const updatedSecondaryCollectors = [...secondaryCollectors];
    updatedSecondaryCollectors[index] = value as string;
    onChange(id, updatedSecondaryCollectors);
  };

  const onDeleteCollector = (index: number) => {
    const updatedSecondaryCollectors = [...secondaryCollectors];
    updatedSecondaryCollectors.splice(index, 1);
    onChange(id, updatedSecondaryCollectors);
  };

  return (
    <>
      {secondaryCollectors?.map((collector, index) => (
        <Box key={index} mb={2} display='flex' alignItems='center'>
          <TextField
            id={`secondaryCollectors${index}`}
            value={collector}
            onChange={(_id, value) => onCollectorChange(value, index)}
            label={index === 0 && 'Secondary collector'}
            disabled={disabled}
          />
          {index !== 0 && (
            <IconButton
              id={`delete-secondaryCollectors${index}`}
              aria-label='delete'
              size='small'
              onClick={() => onDeleteCollector(index)}
            >
              <Close />
            </IconButton>
          )}
        </Box>
      ))}
      {!disabled && (
        <Link
          href='#'
          id='addCollectorButton'
          onClick={(event: React.SyntheticEvent) => {
            preventDefaultEvent(event);
            onAddCollector();
          }}
        >
          {strings.ADD_NEW}
        </Link>
      )}
    </>
  );
}
