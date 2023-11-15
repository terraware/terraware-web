import TfMain from 'src/components/common/TfMain';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import BackToLink from '../common/BackToLink';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import PageSnackbar from '../PageSnackbar';
import useQuery from 'src/utils/useQuery';
import BatchSummary from './BatchSummary';
import { NurseryBatchService } from 'src/services';
import { Batch } from 'src/types/Batch';
import { Button, Tabs } from '@terraware/web-components';
import { useHistory, useParams } from 'react-router-dom';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';
import { makeStyles } from '@mui/styles';
import BatchDetails from './BatchDetails';
import BatchHistory from './BatchHistory';
import { getNurseryById } from 'src/utils/organization';
import { useOrganization } from 'src/providers';
import { Species } from 'src/types/Species';
import { Facility } from 'src/types/Facility';

export type OriginPage = 'Nursery' | 'Species';

type InventoryBatchProps = {
  origin: OriginPage;
  species: Species[];
};

const useStyles = makeStyles(() => ({
  tabs: {
    '& .MuiTabPanel-root[hidden]': {
      flexGrow: 0,
    },
    '& .MuiTabPanel-root': {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    '& >.MuiBox-root': {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
  },
}));

export default function InventoryBatch({ origin, species }: InventoryBatchProps) {
  const classes = useStyles();
  const contentRef = useRef(null);
  const theme = useTheme();
  const query = useQuery();
  const { batchId } = useParams<{ batchId: string }>();
  const { speciesId } = useParams<{ speciesId: string }>();
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const [batch, setBatch] = useState<Batch | null>();
  const tab = query.get('tab') || 'details';
  const [activeTab, setActiveTab] = useState<string>(tab);
  const history = useHistory();
  const location = useStateLocation();
  const [inventorySpecies, setInventorySpecies] = useState<Species>();
  const [inventoryNursery, setInventoryNursery] = useState<Facility>();
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    if (speciesId) {
      setInventorySpecies(species.find((s) => s.id === Number(speciesId)));
    } else if (batch?.speciesId) {
      setInventorySpecies(species.find((s) => s.id === Number(batch.speciesId)));
    }
  }, [speciesId, species, batch]);

  useEffect(() => {
    if (nurseryId) {
      const nursery = getNurseryById(selectedOrganization, Number(nurseryId));
      setInventoryNursery(nursery);
    } else if (batch?.facilityId) {
      const nursery = getNurseryById(selectedOrganization, Number(batch.facilityId));
      setInventoryNursery(nursery);
    }
  }, [nurseryId, batch, selectedOrganization]);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const getSpeciesLabel = () => {
    const { scientificName, commonName } = inventorySpecies || {};

    if (!scientificName && !commonName) {
      return '';
    } else if (!commonName) {
      return scientificName || '';
    } else {
      return `${scientificName} (${commonName})`;
    }
  };

  const getNurseryLabel = () => {
    return inventoryNursery?.name || '';
  };

  const reloadData = useCallback(() => {
    const populateBatch = async () => {
      const response = await NurseryBatchService.getBatch(Number(batchId));
      setBatch(response.batch);
    };

    if (batchId !== undefined) {
      populateBatch();
    }
  }, [batchId]);

  useEffect(() => {
    reloadData();
  }, [batchId, reloadData]);

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      history.push(getLocation(location.pathname, location, query.toString()));
    },
    [query, history, location]
  );

  const onUpdateBatch = () => {
    reloadData();
  };

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <BackToLink
          id='back'
          name={`${strings.INVENTORY} / ${
            origin === 'Species'
              ? strings.formatString(strings.BATCHES_OF, getSpeciesLabel())
              : strings.formatString(strings.BATCHES_AT, getNurseryLabel())
          } `}
          to={
            origin === 'Species'
              ? APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', speciesId)
              : APP_PATHS.INVENTORY_ITEM_FOR_NURSERY.replace(':nurseryId', nurseryId)
          }
        />
        <Grid
          container
          marginTop={theme.spacing(3)}
          marginBottom={theme.spacing(4)}
          justifyContent='space-between'
          alignItems='center'
        >
          <Box>
            <Typography
              sx={{
                paddingLeft: theme.spacing(3),
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              {batch?.batchNumber}
            </Typography>
            <Typography
              sx={{
                paddingLeft: theme.spacing(3),
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {getSpeciesLabel()}
            </Typography>
            <Typography
              sx={{
                paddingLeft: theme.spacing(3),
                fontSize: '14px',
                fontWeight: 400,
              }}
            >
              {getNurseryLabel()}
            </Typography>
          </Box>
          <Box>
            <Button
              label={strings.WITHDRAW}
              onClick={() =>
                history.push({
                  pathname: APP_PATHS.BATCH_WITHDRAW,
                  search: `?batchId=${batchId.toString()}&source=${window.location.pathname}`,
                })
              }
            />
          </Box>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      <Grid container ref={contentRef}>
        {batch && (
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <BatchSummary batch={batch} />
            <Box ref={contentRef} display='flex' flexDirection='column' flexGrow={1} className={classes.tabs}>
              <Tabs
                activeTab={activeTab}
                onTabChange={onTabChange}
                tabs={[
                  {
                    id: 'details',
                    label: strings.DETAILS,
                    children: <BatchDetails batch={batch} onUpdate={onUpdateBatch} />,
                  },
                  {
                    id: 'history',
                    label: strings.HISTORY,
                    children: <BatchHistory batchId={batch.id} nurseryName={inventoryNursery?.name} />,
                  },
                ]}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </TfMain>
  );
}
