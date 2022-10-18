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
import { SpeciesInventory, searchInventory } from 'src/api/inventory/search';
import { InventorySummary, InventorySeedlingsTable } from './view';
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
}

export default function InventoryView(props: InventoryViewProps): JSX.Element {
  const { organization } = props;
  const { speciesId } = useParams<{ speciesId: string }>();
  const [inventory, setInventory] = useState<SpeciesInventory>();

  const classes = useStyles();
  const theme = useTheme();
  const snackbar = useSnackbar();

  const reloadData = useCallback(() => {
    const populateInventory = async () => {
      try {
        const response = await searchInventory(speciesId, organization.id, 1);
        if (!_.isEqual(response, inventory)) {
          setInventory(response || undefined);
        }
      } catch {
        snackbar.toastError();
      }
    };

    if (speciesId !== undefined) {
      populateInventory();
    } else {
      setInventory(undefined);
    }
  }, [speciesId, inventory, organization.id, snackbar]);

  useEffect(() => {
    reloadData();
  }, [speciesId, reloadData]);

  const getSpeciesLabel = () => {
    const { species_scientificName: scientificName, species_commonName: commonName } = inventory || {};

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
        {inventory && (
          <Grid item xs={12}>
            <InventorySummary inventory={inventory} />
            <InventorySeedlingsTable inventory={inventory} />
          </Grid>
        )}
      </Grid>
    </TfMain>
  );
}
