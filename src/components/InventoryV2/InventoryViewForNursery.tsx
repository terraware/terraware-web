import { useTheme, Grid, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import strings from 'src/strings';
import TfMain from 'src/components/common/TfMain';
import PageSnackbar from 'src/components/PageSnackbar';
import { APP_PATHS } from 'src/constants';
import { Species } from 'src/types/Species';
import PageHeaderWrapper from '../common/PageHeaderWrapper';
import BackToLink from 'src/components/common/BackToLink';

export default function InventoryViewForNursery(): JSX.Element {
  const [inventorySpecies] = useState<Species>();
  const contentRef = useRef(null);
  const theme = useTheme();

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
        TODO: Inventory View by Nursery
      </Grid>
    </TfMain>
  );
}
