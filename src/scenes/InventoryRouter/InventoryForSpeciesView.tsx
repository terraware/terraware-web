import React, { type JSX, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Grid, useTheme } from '@mui/material';

import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import InventorySeedlingsTableForSpecies from 'src/scenes/InventoryRouter/view/InventorySeedlingsTableForSpecies';
import InventorySummaryForSpecies from 'src/scenes/InventoryRouter/view/InventorySummaryForSpecies';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

interface InventoryForSpeciesViewProps {
  species: Species[];
}

export default function InventoryForSpeciesView(props: InventoryForSpeciesViewProps): JSX.Element {
  const query = useQuery();
  const navigate = useSyncNavigate();
  const location = useStateLocation();
  const openBatchNumber = (query.get('batch') || '').toLowerCase();
  const { species } = props;
  const { speciesId } = useParams<{ speciesId: string }>();
  const [inventorySpecies, setInventorySpecies] = useState<Species>();
  const theme = useTheme();

  useEffect(() => {
    setInventorySpecies(species.find((s) => s.id === Number(speciesId)));
  }, [speciesId, species]);

  const getSpeciesLabel = () => {
    const { scientificName, commonName } = inventorySpecies || {};

    if (!scientificName && !commonName) {
      return '';
    } else if (!commonName) {
      return scientificName;
    } else {
      return `${scientificName} (${commonName})`;
    }
  };

  const setBatchNumber = (batchNum: string | null) => {
    if (batchNum === null) {
      query.delete('batch');
    } else {
      query.set('batch', batchNum);
    }
    navigate(getLocation(location.pathname, location, query.toString()), { replace: true });
  };

  // A single crumb renders as the back link to the inventory list.
  const crumbs = useMemo(
    () => [{ name: strings.INVENTORY, to: `${APP_PATHS.INVENTORY}?${query.toString()}` }],
    [query]
  );

  return (
    <Page
      crumbs={crumbs}
      hierarchicalCrumbs={false}
      title={getSpeciesLabel()}
      // Page's own insets differ by breakpoint, putting the title 40px in on a desktop and flush
      // left on a phone. Setting the whole inset on the container instead pins it to the 24px it
      // had before this view used Page, at every width, and lines it up with the cards below.
      titleContainerStyle={{ paddingX: 3 }}
      titleStyle={{ fontSize: '20px', fontStyle: 'italic', marginTop: theme.spacing(3), paddingLeft: 0 }}
    >
      {speciesId && (
        <Grid sx={{ display: 'flex', flexDirection: 'column' }} size={12}>
          <InventorySummaryForSpecies speciesId={Number(speciesId)} />

          <Card flushMobile style={{ marginTop: theme.spacing(3) }}>
            <InventorySeedlingsTableForSpecies
              speciesId={Number(speciesId)}
              openBatchNumber={openBatchNumber}
              onUpdateOpenBatch={setBatchNumber}
              origin={'Species'}
            />
          </Card>
        </Grid>
      )}
    </Page>
  );
}
