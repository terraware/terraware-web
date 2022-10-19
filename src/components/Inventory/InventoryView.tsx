import { useTheme, Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '@terraware/web-components';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from 'src/components/common/TfMain';
import useSnackbar from 'src/utils/useSnackbar';
import PageSnackbar from 'src/components/PageSnackbar';
import { APP_PATHS } from 'src/constants';
import { SpeciesInventorySummary } from 'src/api/types/inventory';
import { getSummary } from 'src/api/inventory/inventory';
import { InventorySummary, InventorySeedlingsTable } from './view';
import { Species } from 'src/types/Species';
import _ from 'lodash';

const useStyles = makeStyles((theme: Theme) => ({
  backIcon: {
    fill: '#007DF2',
    marginRight: theme.spacing(1),
  },
  back: {
    display: 'flex',
    textDecoration: 'none',
    color: '#0067C8',
    fontSize: '20px',
    alignItems: 'center',
  },
}));

interface InventoryViewProps {
  organization: ServerOrganization;
  species: Species[];
}

export default function InventoryView(props: InventoryViewProps): JSX.Element {
  const { species } = props;
  const { speciesId } = useParams<{ speciesId: string }>();
  const [summary, setSummary] = useState<SpeciesInventorySummary>();
  const [inventorySpecies, setInventorySpecies] = useState<Species>();

  const classes = useStyles();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const reloadData = useCallback(() => {
    const populateSummary = async () => {
      const response = await getSummary(speciesId);
      if (response.requestSucceeded === false) {
        snackbar.toastError(response.error);
      } else if (!_.isEqual(response.summary, summary)) {
        setSummary(response.summary || undefined);
      }
    };

    if (speciesId !== undefined) {
      populateSummary();
    } else {
      setSummary(undefined);
    }
  }, [speciesId, summary, snackbar]);

  useEffect(() => {
    reloadData();
  }, [speciesId, reloadData]);

  useEffect(() => {
    setInventorySpecies(species.find((s) => s.id === summary?.speciesId));
  }, [summary, species]);

  const getSpeciesLabel = () => {
    const { scientificName, commonName } = inventorySpecies || {};

    if (!scientificName && !commonName) {
      return ''; // will this happen?
    } else if (!commonName) {
      return scientificName;
    } else {
      return `${scientificName} (${commonName})`;
    }
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
        {summary && (
          <Grid item xs={12}>
            <InventorySummary summary={summary} />
            <InventorySeedlingsTable summary={summary} />
          </Grid>
        )}
      </Grid>
    </TfMain>
  );
}
