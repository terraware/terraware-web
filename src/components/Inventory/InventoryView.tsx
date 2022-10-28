import { useTheme, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { Icon } from '@terraware/web-components';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { APP_PATHS } from 'src/constants';
import { InventorySummary, InventorySeedlingsTable } from './view';
import { Species } from 'src/types/Species';
import useQuery from '../../utils/useQuery';
import useStateLocation, { getLocation } from '../../utils/useStateLocation';

const useStyles = makeStyles((theme: Theme) => ({
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    fontSize: '20px',
    alignItems: 'center',
  },
}));

interface InventoryViewProps {
  organization: ServerOrganization;
  species: Species[];
}

export default function InventoryView(props: InventoryViewProps): JSX.Element {
  const query = useQuery();
  const history = useHistory();
  const location = useStateLocation();
  const openBatchNumber = (query.get('batch') || '').toLowerCase();
  const { species, organization } = props;
  const { speciesId } = useParams<{ speciesId: string }>();
  const [inventorySpecies, setInventorySpecies] = useState<Species>();
  const [modified, setModified] = useState<number>(Date.now());

  const classes = useStyles();
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
    history.replace(getLocation(location.pathname, location, query.toString()));
  };

  return (
    <TfMain>
      <Link id='back' to={APP_PATHS.INVENTORY} className={classes.back}>
        <Icon name='caretLeft' className={classes.backIcon} />
        {strings.INVENTORY}
      </Link>
      <Grid container>
        <Typography
          sx={{
            marginTop: theme.spacing(4),
            marginBottom: theme.spacing(3),
            fontSize: '24px',
            fontWeight: 600,
          }}
        >
          {getSpeciesLabel()}
        </Typography>
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
        {speciesId && (
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
            <InventorySummary speciesId={Number(speciesId)} modified={modified} />
            <InventorySeedlingsTable
              speciesId={Number(speciesId)}
              organization={organization}
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
