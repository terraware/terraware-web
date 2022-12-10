import { Close } from '@mui/icons-material';
import { useTheme, Box, IconButton } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getCollectors } from 'src/api/seeds/search';
import Autocomplete from 'src/components/common/Autocomplete';
import strings from 'src/strings';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';
import AddLink from 'src/components/common/AddLink';

interface Props {
  organizationId: number;
  id: string;
  collectors?: string[];
  onChange: (id: string, value: string[]) => void;
}

export default function Collectors2({ organizationId, id, collectors = [''], onChange }: Props): JSX.Element {
  const [collectorsList, setCollectorsList] = useState<string[]>([...collectors]);
  const [collectorsOpt, setCollectorsOpt] = useState<string[]>();
  const theme = useTheme();

  useEffect(() => {
    const populateCollectors = async () => {
      setCollectorsOpt(await getCollectors(organizationId));
    };
    populateCollectors();
  }, [organizationId]);

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
      onChange(id, getNonEmptyCollectors(updatedCollectors));
      return updatedCollectors;
    });
  };

  const onDeleteCollector = (index: number) => {
    setCollectorsList((prev) => {
      const updatedCollectors = [...prev];
      updatedCollectors.splice(index, 1);
      onChange(id, getNonEmptyCollectors(updatedCollectors));
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
            onChange={(unused, value) => onCollectorChange(value, index)}
            label={index === 0 ? strings.COLLECTORS : ''}
            values={collectorsOpt || []}
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
