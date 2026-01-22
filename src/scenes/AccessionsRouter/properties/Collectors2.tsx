import React, { type JSX, useEffect, useState } from 'react';

import { Close } from '@mui/icons-material';
import { Box, IconButton, useTheme } from '@mui/material';

import AddLink from 'src/components/common/AddLink';
import Autocomplete from 'src/components/common/Autocomplete';
import { useOrganization } from 'src/providers/hooks';
import { SeedBankService } from 'src/services';
import strings from 'src/strings';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';

interface Props {
  collectors?: string[];
  onChange: (id: string, value: string[]) => void;
}

export default function Collectors2({ collectors = [''], onChange }: Props): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [collectorsList, setCollectorsList] = useState<string[]>([...collectors]);
  const [collectorsOpt, setCollectorsOpt] = useState<string[]>();
  const theme = useTheme();

  useEffect(() => {
    if (selectedOrganization) {
      const populateCollectors = async () => {
        setCollectorsOpt(await SeedBankService.getCollectors(selectedOrganization.id));
      };
      void populateCollectors();
    }
  }, [selectedOrganization]);

  const getNonEmptyCollectors = (updatedCollectors: string[]) => updatedCollectors.filter((collector) => !!collector);

  const onAddCollector = () => {
    setCollectorsList((prev) => {
      return [...prev, ''];
    });
  };

  const onCollectorChange = (value: unknown, index: number) => {
    setCollectorsList((prev) => {
      const updatedCollectors = [...prev];
      updatedCollectors[index] = value as string;
      onChange('collectors', getNonEmptyCollectors(updatedCollectors));
      return updatedCollectors;
    });
  };

  const onDeleteCollector = (index: number) => {
    setCollectorsList((prev) => {
      const updatedCollectors = [...prev];
      updatedCollectors.splice(index, 1);
      onChange('collectors', getNonEmptyCollectors(updatedCollectors));
      return updatedCollectors;
    });
  };

  return (
    <>
      {collectorsList.map((collector, index) => (
        <Box key={index} mb={2} display='flex' alignItems='center' sx={{ display: 'block', position: 'relative' }}>
          <Autocomplete
            id={`collector${index}`}
            selected={collector}
            onChange={(value) => onCollectorChange(value, index)}
            label={index === 0 ? strings.COLLECTORS : ''}
            placeholder={strings.COLLECTORS}
            options={collectorsOpt || []}
            freeSolo={true}
          />
          {index !== 0 && (
            <IconButton
              id={`delete-collector${index}`}
              aria-label='delete'
              size='small'
              onClick={() => onDeleteCollector(index)}
              sx={{ position: 'absolute', top: `calc(${theme.spacing(1)}/2)`, right: `-${theme.spacing(4)}` }}
            >
              <Close />
            </IconButton>
          )}
        </Box>
      ))}
      <Box display='flex' justifyContent='flex-end'>
        <AddLink
          id='addCollectorButton'
          onClick={(event?: React.SyntheticEvent) => {
            if (event) {
              preventDefaultEvent(event);
            }
            onAddCollector();
          }}
          large={true}
          text={strings.ADD}
        />
      </Box>
    </>
  );
}
