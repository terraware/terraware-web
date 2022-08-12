import { Close } from '@mui/icons-material';
import { Box, IconButton, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getCollectors } from 'src/api/seeds/search';
import Select from 'src/components/common/Select/Select';
import strings from 'src/strings';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';

interface Props {
  organizationId: number;
  id: string;
  collectors?: string[];
  onChange: (id: string, value: string[]) => void;
  disabled?: boolean;
}

export default function Collectors({ organizationId, id, collectors = [''], onChange, disabled }: Props): JSX.Element {
  const [collectorsOpt, setCollectorsOpt] = useState<string[]>();

  useEffect(() => {
    const populateCollectors = async () => {
      setCollectorsOpt(await getCollectors(organizationId));
    };
    populateCollectors();
  }, [organizationId]);

  const onAddCollector = () => {
    const updatedCollectors = [...collectors];
    updatedCollectors.push('');

    onChange(id, updatedCollectors);
  };

  const onCollectorChange = (value: unknown, index: number) => {
    const updatedCollectors = [...collectors];
    updatedCollectors[index] = value as string;
    onChange(id, updatedCollectors);
  };

  const onDeleteCollector = (index: number) => {
    const updatedCollectors = [...collectors];
    updatedCollectors.splice(index, 1);
    onChange(id, updatedCollectors);
  };

  return (
    <>
      {collectors?.map((collector, index) => (
        <Box key={index} mb={2} display='flex' alignItems='center'>
          <Select
            id={`collector${index}`}
            selectedValue={collector}
            onChange={(value) => onCollectorChange(value, index)}
            label={index === 0 ? strings.COLLECTORS : ''}
            disabled={disabled}
            readonly={false}
            options={collectorsOpt}
          />
          {index !== 0 && (
            <IconButton
              id={`delete-collector${index}`}
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
