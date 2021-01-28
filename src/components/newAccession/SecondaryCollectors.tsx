import { Box, IconButton, Link } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';
import TextField from '../common/TextField';

interface Props {
  secondaryCollectors: string[];
  onChange: (value: string[]) => void;
}

const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

export default function SecondaryCollectors({
  secondaryCollectors,
  onChange,
}: Props): JSX.Element {
  const onAddCollector = () => {
    const updatedSecondaryCollectors = [...secondaryCollectors];
    updatedSecondaryCollectors.push('');

    onChange(updatedSecondaryCollectors);
  };

  const onCollectorChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number
  ) => {
    const updatedSecondaryCollectors = [...secondaryCollectors];
    updatedSecondaryCollectors[index] = event.target.value;
    onChange(updatedSecondaryCollectors);
  };

  const onDeleteCollector = (index: number) => {
    const updatedSecondaryCollectors = [...secondaryCollectors];
    updatedSecondaryCollectors.splice(index, 1);
    onChange(updatedSecondaryCollectors);
  };

  return (
    <>
      {secondaryCollectors?.map((collector, index) => (
        <Box key={index} mb={2} display='flex' alignItems='center'>
          <TextField
            id={`secondaryCollectors[${index}]`}
            value={collector}
            onChange={(event) => onCollectorChange(event, index)}
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
