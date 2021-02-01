import { Box, IconButton, Link } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import TextField from '../common/TextField';

interface Props {
  id: string;
  secondaryCollectors?: string[];
  onChange: (id: string, value: string[]) => void;
}

const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

export default function SecondaryCollectors({
  id,
  secondaryCollectors = [''],
  onChange,
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
            id={`secondaryCollectors[${index}]`}
            value={collector}
            onChange={(id, value) => onCollectorChange(value, index)}
            label={index === 0 && 'Secondary collector'}
          />
          {index !== 0 && (
            <IconButton
              aria-label='delete'
              size='small'
              onClick={() => onDeleteCollector(index)}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      ))}
      <Link
        href='#'
        onClick={(event: React.SyntheticEvent) => {
          preventDefault(event);
          onAddCollector();
        }}
      >
        Add new
      </Link>
    </>
  );
}
