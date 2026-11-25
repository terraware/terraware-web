import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Button, Tabs } from '@terraware/web-components';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { useGetBatchQuery } from 'src/queries/generated/nurseryBatches';
import strings from 'src/strings';
import { getBatchAccessions } from 'src/types/Batch';
import { Facility } from 'src/types/Facility';
import { Species } from 'src/types/Species';
import { getNurseryById } from 'src/utils/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useStickyTabs from 'src/utils/useStickyTabs';

import BatchDetails from './BatchDetails';
import BatchHistory from './BatchHistory';
import BatchSummary from './BatchSummary';
import BatchWithdrawModal from './BatchWithdrawModal';

export type OriginPage = 'Nursery' | 'Species' | 'Batches' | 'InventoryAdd';

type InventoryBatchProps = {
  origin: OriginPage;
  species: Species[];
};

export default function InventoryBatchView({ origin, species }: InventoryBatchProps) {
  const theme = useTheme();
  const { batchId } = useParams<{ batchId: string }>();
  const { speciesId } = useParams<{ speciesId: string }>();
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const { currentData: batchData, isError } = useGetBatchQuery(Number(batchId), { skip: !batchId });
  const batch = isError ? undefined : batchData?.batch;
  const [inventorySpecies, setInventorySpecies] = useState<Species>();
  const [inventoryNursery, setInventoryNursery] = useState<Facility>();
  const { selectedOrganization } = useOrganization();
  const { isMobile } = useDeviceInfo();

  const isWithdrawable =
    Number(batch?.readyQuantity) +
      Number(batch?.activeGrowthQuantity) +
      Number(batch?.hardeningOffQuantity) +
      Number(batch?.germinatingQuantity) >
    0;

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  // A fresh array literal here would re-run the modal's fetch effect on every re-render of this view
  const withdrawBatchIds = useMemo(() => (batchId ? [Number(batchId)] : []), [batchId]);

  const openWithdraw = () => {
    if (!batchId) {
      return;
    }

    setWithdrawModalOpen(true);
  };

  useEffect(() => {
    if (speciesId) {
      setInventorySpecies(species.find((s) => s.id === Number(speciesId)));
    } else if (batch?.speciesId) {
      setInventorySpecies(species.find((s) => s.id === Number(batch.speciesId)));
    }
  }, [speciesId, species, batch]);

  useEffect(() => {
    if (selectedOrganization) {
      if (nurseryId) {
        const nursery = getNurseryById(selectedOrganization, Number(nurseryId));
        setInventoryNursery(nursery);
      } else if (batch?.facilityId) {
        const nursery = getNurseryById(selectedOrganization, Number(batch.facilityId));
        setInventoryNursery(nursery);
      }
    }
  }, [nurseryId, batch, selectedOrganization]);

  const speciesLabel = useMemo(() => {
    const { scientificName, commonName } = inventorySpecies || {};

    if (!scientificName && !commonName) {
      return '';
    } else if (!commonName) {
      return scientificName || '';
    } else {
      return `${scientificName} (${commonName})`;
    }
  }, [inventorySpecies]);

  const nurseryLabel = inventoryNursery?.name || '';

  const tabs = useMemo(() => {
    if (!batch) {
      return [];
    }

    return [
      {
        id: 'details',
        label: strings.DETAILS,
        children: <BatchDetails batch={batch} />,
      },
      {
        id: 'history',
        label: strings.HISTORY,
        children: (
          <BatchHistory
            batchId={batch.id}
            nurseryName={inventoryNursery?.name}
            accessions={getBatchAccessions(batch)}
          />
        ),
      },
    ];
  }, [batch, inventoryNursery]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'details',
    tabs,
    viewIdentifier: 'inventory-batch-details',
  });

  // A single crumb renders as the back link to wherever this batch was opened from.
  const crumbs = useMemo(
    () => [
      {
        name: `${strings.INVENTORY}${
          origin !== 'Batches'
            ? ` / ${
                origin === 'Species'
                  ? (strings.formatString(strings.BATCHES_OF, speciesLabel) as string)
                  : (strings.formatString(strings.BATCHES_AT, nurseryLabel) as string)
              }`
            : ''
        }`,
        to:
          origin === 'Species'
            ? APP_PATHS.INVENTORY_ITEM_FOR_SPECIES.replace(':speciesId', speciesId || '')
            : origin === 'Nursery'
              ? APP_PATHS.INVENTORY_ITEM_FOR_NURSERY.replace(':nurseryId', nurseryId || '')
              : `${APP_PATHS.INVENTORY}?tab=batches_by_batch`,
      },
    ],
    [origin, speciesId, nurseryId, speciesLabel, nurseryLabel]
  );

  const title = (
    <Box>
      <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>{batch?.batchNumber}</Typography>
      <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>{speciesLabel}</Typography>
      <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>{nurseryLabel}</Typography>
    </Box>
  );

  return (
    <Page
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={title}
      // Page's own left inset differs by breakpoint, putting the heading 16px in on a desktop and
      // flush left on a phone; setting it here pins it to the 24px the three heading lines had
      // before. The right stays at 0, as the original row had no padding there, so the Withdraw
      // button reaches the same edge the content below it lines up with.
      titleContainerStyle={{ paddingLeft: 3, paddingRight: 0, marginTop: theme.spacing(3) }}
      // Without both sizes Page caps a non-string title at 8 of 12 columns on a phone, which would
      // wrap the species name earlier than before. There is no leftComponent, hence the 0.
      leftComponentGridSize={0}
      rightComponentGridSize={4}
      rightComponent={
        isWithdrawable && batchId ? (
          // Page right-aligns its action slot with text-align, which does not move a flex child, so
          // the button keeps itself at the end of the row as the old space-between layout did.
          <Box
            margin={isMobile ? theme.spacing(2, 2, 0, 2) : 0}
            display='flex'
            justifyContent='flex-end'
            flexGrow={isMobile ? 1 : 0}
          >
            <Button label={strings.WITHDRAW} onClick={openWithdraw} style={isMobile ? { width: '100%' } : {}} />
          </Box>
        ) : undefined
      }
    >
      {batchId && (
        <BatchWithdrawModal
          open={withdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          batchIds={withdrawBatchIds}
        />
      )}
      {batch && (
        <Grid sx={{ display: 'flex', flexDirection: 'column' }} size={12}>
          <BatchSummary batch={batch} />
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
            <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
          </Box>
        </Grid>
      )}
    </Page>
  );
}
