import React from 'react';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import { Button, Table, TableColumnType } from '@terraware/web-components';
import { Box, Grid } from '@mui/material';
import { SearchResponseElement } from 'src/api/search';
import { useHistory } from 'react-router-dom';
import { useDeviceInfo } from '@terraware/web-components/utils';
import { APP_PATHS } from 'src/constants';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import InventoryCellRenderer from './InventoryCellRenderer';

const columns: TableColumnType[] = [
  { key: 'species_scientificName', name: strings.SPECIES, type: 'string' },
  { key: 'species_commonName', name: strings.COMMON_NAME, type: 'string' },
  { key: 'facilityInventories', name: strings.NURSERIES, type: 'string' },
  { key: 'germinatingQuantity', name: strings.GERMINATING, type: 'string' },
  { key: 'notReadyQuantity', name: strings.NOT_READY, type: 'string' },
  { key: 'readyQuantity', name: strings.READY, type: 'string' },
  { key: 'totalQuantity', name: strings.TOTAL, type: 'string' },
];

interface InventoryTableProps {
  organization: ServerOrganization;
  results: SearchResponseElement[];
  temporalSearchValue: string;
  setTemporalSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

export default function InventoryTable(props: InventoryTableProps): JSX.Element {
  const { organization, results, setTemporalSearchValue, temporalSearchValue } = props;
  const { isMobile } = useDeviceInfo();
  const history = useHistory();

  const goTo = (appPath: string) => {
    const appPathLocation = {
      pathname: appPath,
    };
    history.push(appPathLocation);
  };

  const clearSearch = () => {
    setTemporalSearchValue('');
  };

  const onChangeSearch = (id: string, value: unknown) => {
    setTemporalSearchValue(value as string);
  };

  return (
    <>
      <Grid item xs={3} sx={{ textAlign: 'right' }}>
        {['Admin', 'Owner'].includes(organization.role) &&
          (isMobile ? (
            <Button id='new-inventory' icon='plus' onClick={() => goTo(APP_PATHS.INVENTORY_NEW)} size='medium' />
          ) : (
            <Button
              id='new-inventory'
              icon='plus'
              label={strings.ADD_INVENTORY}
              onClick={() => goTo(APP_PATHS.INVENTORY_NEW)}
              size='medium'
            />
          ))}
      </Grid>
      <Grid item xs={12} marginTop={3}>
        <Box width='300px'>
          <TextField
            placeholder={strings.SEARCH}
            iconLeft='search'
            label=''
            id='search'
            type='text'
            onChange={onChangeSearch}
            value={temporalSearchValue}
            iconRight='cancel'
            onClickRightIcon={clearSearch}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <div>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Table
                id='inventory-table'
                columns={columns}
                rows={results}
                orderBy='species_scientificName'
                Renderer={InventoryCellRenderer}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </>
  );
}
