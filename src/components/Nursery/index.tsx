import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { getAllNurseries } from 'src/utils/organization';
import TextField from '../common/Textfield/Textfield';
import Button from '../common/button/Button';
import { Facility } from 'src/api/types/facilities';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import TfMain from '../common/TfMain';
import PageSnackbar from '../PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import { useOrganization } from 'src/providers/hooks';

const useStyles = makeStyles((theme: Theme) => ({
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

export default function NurseryDetails(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const [nursery, setNursery] = useState<Facility>();
  const history = useHistory();

  useEffect(() => {
    if (selectedOrganization) {
      const selectedNursery = getAllNurseries(selectedOrganization).find((n) => n?.id.toString() === nurseryId);
      if (selectedNursery) {
        setNursery(selectedNursery);
      } else {
        history.push(APP_PATHS.SEED_BANKS);
      }
    }
  }, [nurseryId, selectedOrganization, history]);

  const classes = useStyles();

  const goToEditNursery = () => {
    const editNurseryLocation = {
      pathname: APP_PATHS.NURSERIES_EDIT.replace(':nurseryId', nurseryId),
    };
    history.push(editNurseryLocation);
  };

  const { isMobile } = useDeviceInfo();
  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <TfMain>
      <Grid container padding={theme.spacing(0, 0, 4, 0)}>
        <Grid item xs={12} marginBottom={theme.spacing(3)}>
          <BackToLink id='back' to={APP_PATHS.NURSERIES} name={strings.NURSERIES} />
        </Grid>
        <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
          <Typography fontSize='20px' fontWeight={600}>
            {nursery?.name}
          </Typography>
          <Button
            icon='iconEdit'
            label={isMobile ? undefined : strings.EDIT_NURSERY}
            priority='primary'
            size='medium'
            onClick={goToEditNursery}
          />
        </Grid>
        <Grid item xs={12}>
          <PageSnackbar />
        </Grid>
      </Grid>

      <Grid
        container
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
          margin: 0,
        }}
      >
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField label={strings.NAME} id='name' type='text' value={nursery?.name} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.DESCRIPTION}
            id='description'
            type='text'
            value={nursery?.description}
            display={true}
          />
        </Grid>
      </Grid>
    </TfMain>
  );
}
