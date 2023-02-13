import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { FacilityService } from 'src/services';
import TextField from '../common/Textfield/Textfield';
import Button from '../common/button/Button';
import { Facility } from 'src/types/Facility';
import { makeStyles } from '@mui/styles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import TfMain from '../common/TfMain';
import BackToLink from 'src/components/common/BackToLink';
import { useOrganization } from 'src/providers/hooks';
import isEnabled from 'src/features';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';
import StorageLocations from './StorageLocations';

const useStyles = makeStyles((theme: Theme) => ({
  titleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

export default function SeedBankDetails(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const [seedBank, setSeedBank] = useState<Facility>();
  const history = useHistory();
  const timeZoneFeatureEnabled = isEnabled('Timezones');
  const tz = useLocationTimeZone().get(seedBank);

  useEffect(() => {
    if (selectedOrganization) {
      const selectedSeedBank = FacilityService.getFacility({
        organization: selectedOrganization,
        facilityId: seedBankId,
        type: 'Seed Bank',
      });
      if (selectedSeedBank) {
        setSeedBank(selectedSeedBank);
      } else {
        history.push(APP_PATHS.SEED_BANKS);
      }
    }
  }, [seedBankId, selectedOrganization, history]);

  const classes = useStyles();

  const goToEditSeedBank = () => {
    const editSeedBankLocation = {
      pathname: APP_PATHS.SEED_BANKS_EDIT.replace(':seedBankId', seedBankId),
    };
    history.push(editSeedBankLocation);
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
          <BackToLink id='back' to={APP_PATHS.SEED_BANKS} name={strings.SEED_BANKS} />
        </Grid>
        <Grid item xs={12} padding={theme.spacing(0, 3)} className={classes.titleWithButton}>
          <Typography fontSize='20px' fontWeight={600} margin={0}>
            {seedBank?.name}
          </Typography>
          <Button
            icon='iconEdit'
            label={isMobile ? undefined : strings.EDIT_SEED_BANK}
            priority='primary'
            size='medium'
            onClick={goToEditSeedBank}
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
          <TextField label={strings.NAME_REQUIRED} id='name' type='text' value={seedBank?.name} display={true} />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.DESCRIPTION_REQUIRED}
            id='description'
            type='text'
            value={seedBank?.description}
            display={true}
          />
        </Grid>
        {timeZoneFeatureEnabled && (
          <Grid item xs={gridSize()} marginTop={isMobile ? 3 : 0}>
            <TextField
              label={strings.TIME_ZONE}
              id='timezone'
              type='text'
              value={tz.longName}
              tooltipTitle={strings.TOOLTIP_TIME_ZONE_SEEDBANK}
              display={true}
            />
          </Grid>
        )}
        {seedBank && <StorageLocations seedBankId={seedBank.id} />}
      </Grid>
    </TfMain>
  );
}
