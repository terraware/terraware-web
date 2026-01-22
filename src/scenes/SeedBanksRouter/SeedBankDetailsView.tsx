import React, { type JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Grid, Typography, useTheme } from '@mui/material';

import PageSnackbar from 'src/components/PageSnackbar';
import BackToLink from 'src/components/common/BackToLink';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import SeedBankSubLocations from 'src/scenes/SeedBanksRouter/SeedBankSubLocations';
import { FacilityService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import TextField from '../../components/common/Textfield/Textfield';
import TfMain from '../../components/common/TfMain';
import Button from '../../components/common/button/Button';

export default function SeedBankDetailsView(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { seedBankId } = useParams<{ seedBankId: string }>();
  const [seedBank, setSeedBank] = useState<Facility>();
  const navigate = useSyncNavigate();
  const tz = useLocationTimeZone().get(seedBank);

  useEffect(() => {
    if (selectedOrganization && seedBankId) {
      const selectedSeedBank = FacilityService.getFacility({
        organization: selectedOrganization,
        facilityId: seedBankId,
        type: 'Seed Bank',
      });
      if (selectedSeedBank) {
        setSeedBank(selectedSeedBank);
      } else {
        navigate(APP_PATHS.SEED_BANKS);
      }
    }
  }, [seedBankId, selectedOrganization, navigate]);

  const goToEditSeedBank = () => {
    if (seedBankId) {
      const editSeedBankLocation = {
        pathname: APP_PATHS.SEED_BANKS_EDIT.replace(':seedBankId', seedBankId),
      };
      navigate(editSeedBankLocation);
    }
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
        <Grid
          item
          xs={12}
          padding={theme.spacing(0, 3)}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
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
        <Grid item xs={gridSize()}>
          <TextField
            id={'buildStartedDate'}
            label={strings.FACILITY_BUILD_START_DATE}
            value={seedBank?.buildStartedDate ?? ''}
            type='text'
            aria-label='date-picker'
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            id={'buildCompletedDate'}
            label={strings.FACILITY_BUILD_COMPLETION_DATE}
            value={seedBank?.buildCompletedDate ?? ''}
            type='text'
            aria-label='date-picker'
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            id={'operationStartedDate'}
            label={strings.FACILITY_OPERATION_START_DATE}
            value={seedBank?.operationStartedDate ?? ''}
            type='text'
            aria-label='date-picker'
            display={true}
          />
        </Grid>
        {seedBank && <SeedBankSubLocations seedBankId={seedBank.id} />}
      </Grid>
    </TfMain>
  );
}
