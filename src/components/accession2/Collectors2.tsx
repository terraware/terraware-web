import { Close } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { Theme, Box, IconButton, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getCollectors } from 'src/api/seeds/search';
import Select from 'src/components/common/Select/Select';
import strings from 'src/strings';
import preventDefaultEvent from 'src/utils/preventDefaultEvent';

const useStyles = makeStyles((theme: Theme) => ({
  delete: {
    position: 'absolute',
    top: `calc(${theme.spacing(1)}/2)`,
    right: `-${theme.spacing(4)}`,
  },
}));

interface Props {
  organizationId: number;
  id: string;
  collectors?: string[];
  onChange: (id: string, value: string[]) => void;
  disabled?: boolean;
}

export default function Collectors({ organizationId, id, collectors = [''], onChange, disabled }: Props): JSX.Element {
  const classes = useStyles();
  const [collectorsList, setCollectorsList] = useState<string[]>([...collectors]);
  const [collectorsOpt, setCollectorsOpt] = useState<string[]>();

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
          <Select
            id={`collector${index}`}
            selectedValue={collector}
            onChange={(value) => onCollectorChange(value, index)}
            label={index === 0 ? strings.COLLECTORS : ''}
            disabled={disabled}
            readonly={false}
            options={collectorsOpt}
            fullWidth={true}
          />
          {index !== 0 && (
            <IconButton
              id={`delete-collector${index}`}
              aria-label='delete'
              size='small'
              onClick={() => onDeleteCollector(index)}
              className={classes.delete}
            >
              <Close />
            </IconButton>
          )}
        </Box>
      ))}
      {!disabled && (
        <Box display='flex' justifyContent='flex-end'>
          <Link
            sx={{ textDecoration: 'none' }}
            href='#'
            id='addCollectorButton'
            onClick={(event: React.SyntheticEvent) => {
              preventDefaultEvent(event);
              onAddCollector();
            }}
          >
            + {strings.ADD}
          </Link>
        </Box>
      )}
    </>
  );
}
