import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Tabs } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers';
import { requestFetchBatch } from 'src/redux/features/batches/batchesAsyncThunks';
import { selectBatch } from 'src/redux/features/batches/batchesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import { Species } from 'src/types/Species';
import { getNurseryById } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import BatchDetails from './BatchDetails';
import BatchHistory from './BatchHistory';
import BatchSummary from './BatchSummary';

export type OriginPage = 'Nursery' | 'Species' | 'Batches' | 'InventoryAdd';

type InventoryBatchProps = {
  origin: OriginPage;
  species: Species[];
};

const initializeTab = (tab: string | null): 'details' | 'history' => {
  if (tab === 'history') {
    return 'history';
  }
  return 'details';
};

export default function InventoryBatchView({ origin, species }: InventoryBatchProps) {
  const dispatch = useAppDispatch();
  const contentRef = useRef(null);
  const theme = useTheme();
  const query = useQuery();
  const { batchId } = useParams<{ batchId: string }>();
  const { speciesId } = useParams<{ speciesId: string }>();
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const batch = useAppSelector(selectBatch(batchId || -1));
  const tab = initializeTab(query.get('tab'));
  const [activeTab, setActiveTab] = useState<string>(tab);
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const [inventorySpecies, setInventorySpecies] = useState<Species>();
  const [inventoryNursery, setInventoryNursery] = useState<Facility>();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();

  const isWithdrawable =
    Number(batch?.readyQuantity) + Number(batch?.notReadyQuantity) + Number(batch?.germinatingQuantity) > 0;

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

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      navigate(getLocation(location.pathname, location, query.toString()));
    },
    [query, navigate, location]
  );

  const fetchBatch = useCallback(() => {
    if (batchId) {
      void dispatch(requestFetchBatch({ batchId }));
    }
  }, [batchId, dispatch]);

  useEffect(() => {
    fetchBatch();
  }, [batchId, fetchBatch]);

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <BackToLink
          id='back'
          name={`${strings.INVENTORY}${
            origin !== 'Batches'
              ? ` / ${
                  origin === 'Species'
                    ? strings.formatString(strings.BATCHES_OF, getSpeciesLabel())
                    : strings.formatString(strings.BATCHES_AT, getNurseryLabel())
                }`
              : ''
          }`}
          to={
            origin === 'Species'
              ? APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', speciesId || '')
              : origin === 'Nursery'
                ? APP_PATHS.INVENTORY_ITEM_FOR_NURSERY.replace(':nurseryId', nurseryId || '')
                : `${APP_PATHS.INVENTORY}?tab=batches_by_batch`
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
          {isWithdrawable && batchId && (
            <Box margin={isMobile ? theme.spacing(2, 2, 0, 2) : 0} display='flex' flexGrow={isMobile ? 1 : 0}>
              <Button
                label={strings.WITHDRAW}
                onClick={() =>
                  navigate({
                    pathname: APP_PATHS.BATCH_WITHDRAW,
                    search: `?batchId=${batchId.toString()}&source=${window.location.pathname}`,
                  })
                }
                style={isMobile ? { width: '100%' } : {}}
              />
            </Box>
          )}
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      <Grid container ref={contentRef}>
        {batch && (
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <BatchSummary batch={batch} reloadData={fetchBatch} />
            <Box
              display='flex'
              flexDirection='column'
              flexGrow={1}
              sx={{
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
              }}
            >
              <Tabs
                activeTab={activeTab}
                onTabChange={onTabChange}
                tabs={[
                  {
                    id: 'details',
                    label: strings.DETAILS,
                    children: <BatchDetails batch={batch} onUpdate={fetchBatch} />,
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
