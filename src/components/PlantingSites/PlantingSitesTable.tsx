import { Box, Grid, useTheme } from '@mui/material';
import { Table, TableColumnType, Textfield } from '@terraware/web-components';
import { SearchResponseElement } from 'src/api/search';
import strings from 'src/strings';
import PlantingSitesCellRenderer from './PlantingSitesCellRenderer';
import isEnabled from 'src/features';

interface PlantingSitesTableProps {
  results: SearchResponseElement[];
  temporalSearchValue: string;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function PlantingSitesTable(props: PlantingSitesTableProps): JSX.Element {
  const { results, setTemporalSearchValue, temporalSearchValue } = props;
  const theme = useTheme();
  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const columns: TableColumnType[] = [
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
    { key: 'numPlots', name: strings.PLOTS, type: 'string' },
  ];

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
                columns={
                  timeZoneFeatureEnabled
                    ? [...columns, { key: 'timeZone', name: strings.TIME_ZONE, type: 'string' }]
                    : columns
                }
                rows={results}
                orderBy='name'
                Renderer={PlantingSitesCellRenderer}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Box>
  );
}
