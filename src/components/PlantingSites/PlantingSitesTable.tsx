import { useState } from 'react';
import { Box, Grid, useTheme } from '@mui/material';
import { TableColumnType, Textfield } from '@terraware/web-components';
import { SearchResponseElement } from 'src/types/Search';
import strings from 'src/strings';
import PlantingSitesCellRenderer from './PlantingSitesCellRenderer';
import Table from 'src/components/common/table';
import { SortOrder } from 'src/components/common/table/sort';
import { SearchSortOrder } from 'src/types/Search';
import isEnabled from 'src/features';

interface PlantingSitesTableProps {
  results: SearchResponseElement[];
  temporalSearchValue: string;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
  setSearchSortOrder: (sortOrder: SearchSortOrder) => void;
}

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.NAME,
    type: 'string',
  },
  {
    key: 'description',
    name: strings.DESCRIPTION,
    type: 'string',
  },
  { key: 'numPlantingZones', name: strings.PLANTING_ZONES, type: 'string' },
  { key: 'numPlantingSubzones', name: strings.SUBZONES, type: 'string' },
  { key: 'timeZone', name: strings.TIME_ZONE, type: 'string' },
];

export default function PlantingSitesTable(props: PlantingSitesTableProps): JSX.Element {
  const { results, setTemporalSearchValue, temporalSearchValue, setSearchSortOrder } = props;
  const [isPresorted, setIsPresorted] = useState<boolean>(false);
  const theme = useTheme();
  const featureFlagProjects = isEnabled('Projects');

  const onSortChange = (order: SortOrder, orderBy: string) => {
    const isTimeZone = orderBy === 'timeZone';
    if (!isTimeZone) {
      setSearchSortOrder({
        field: orderBy as string,
        direction: order === 'asc' ? 'Ascending' : 'Descending',
      });
    }
    setIsPresorted(!isTimeZone);
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        padding: theme.spacing(3),
        borderRadius: '32px',
      }}
    >
      <Box display='flex' flexDirection='row'>
        <Box width='300px'>
          <Textfield
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            onChange={(value) => setTemporalSearchValue(value as string)}
            value={temporalSearchValue}
            iconRight='cancel'
            onClickRightIcon={() => setTemporalSearchValue('')}
          />
        </Box>
      </Box>
      <Grid item xs={12} marginTop={2}>
        <div>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                id='planting-sites-table'
                columns={columns}
                rows={results}
                orderBy='name'
                Renderer={PlantingSitesCellRenderer}
                sortHandler={onSortChange}
                isPresorted={isPresorted}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Box>
  );
}
