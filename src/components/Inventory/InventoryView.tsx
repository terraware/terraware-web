import { useTheme, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useEffect, useRef, useState } from 'react';
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
import PageHeaderWrapper from '../common/PageHeaderWrapper';

const useStyles = makeStyles((theme: Theme) => ({
  backIcon: {
    fill: theme.palette.TwClrIcnBrand,
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: theme.palette.TwClrTxtBrand,
    fontSize: '14px',
    fontWeight: 500,
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
  const contentRef = useRef(null);

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
      <PageHeaderWrapper nextElement={contentRef.current}>
        <Link id='back' to={APP_PATHS.INVENTORY} className={classes.back}>
          <Icon name='caretLeft' className={classes.backIcon} size='small' />
          {strings.INVENTORY}
        </Link>
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
