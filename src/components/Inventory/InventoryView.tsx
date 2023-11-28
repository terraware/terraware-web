import { useTheme, Grid, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { APP_PATHS } from 'src/constants';
import { InventorySummary, InventorySeedlingsTable } from './view';
import { Species } from 'src/types/Species';
import useQuery from '../../utils/useQuery';
import useStateLocation, { getLocation } from '../../utils/useStateLocation';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import BackToLink from 'src/components/common/BackToLink';

interface InventoryViewProps {
  species: Species[];
}

export default function InventoryView(props: InventoryViewProps): JSX.Element {
  const query = useQuery();
  const navigate = useNavigate();
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
        <BackToLink id='back' name={strings.INVENTORY} to={APP_PATHS.INVENTORY} />
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
      <Grid container ref={contentRef}>
        {speciesId && (
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <InventorySummary speciesId={Number(speciesId)} modified={modified} />
            <InventorySeedlingsTable
              speciesId={Number(speciesId)}
              modified={modified}
              setModified={setModified}
              openBatchNumber={openBatchNumber}
              onUpdateOpenBatch={setBatchNumber}
            />
          </Grid>
        )}
      </Grid>
    </TfMain>
  );
}
