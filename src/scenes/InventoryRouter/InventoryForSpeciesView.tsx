import React, { type JSX, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';

import { Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import Card from 'src/components/common/Card';
import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import TfMain from 'src/components/common/TfMain';
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
  const [modified, setModified] = useState<number>(Date.now());
  const contentRef = useRef(null);
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

  return (
    <TfMain>
      <PageHeaderWrapper nextElement={contentRef.current}>
        <BackToLink id='back' name={strings.INVENTORY} to={`${APP_PATHS.INVENTORY}?${query.toString()}`} />
        <Grid container>
          <Typography
            sx={{
              marginTop: theme.spacing(3),
              marginBottom: theme.spacing(4),
              paddingLeft: theme.spacing(3),
              fontSize: '20px',
              fontWeight: 600,
              fontStyle: 'italic',
            }}
          >
            {getSpeciesLabel()}
          </Typography>
          <Grid item xs={12}>
            <PageSnackbar />
          </Grid>
        </Grid>
      </PageHeaderWrapper>
      {speciesId && (
        <Grid container ref={contentRef}>
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <InventorySummaryForSpecies speciesId={Number(speciesId)} modified={modified} />

            <Card flushMobile style={{ marginTop: theme.spacing(3) }}>
              <InventorySeedlingsTableForSpecies
                speciesId={Number(speciesId)}
                modified={modified}
                setModified={setModified}
                openBatchNumber={openBatchNumber}
                onUpdateOpenBatch={setBatchNumber}
                origin={'Species'}
              />
            </Card>
          </Grid>
        </Grid>
      )}
    </TfMain>
  );
}
