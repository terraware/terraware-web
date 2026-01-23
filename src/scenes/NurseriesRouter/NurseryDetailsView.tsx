import React, { type JSX, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Grid, Typography, useTheme } from '@mui/material';

import BackToLink from 'src/components/common/BackToLink';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { FacilityService } from 'src/services';
import strings from 'src/strings';
import { Facility } from 'src/types/Facility';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { useLocationTimeZone } from 'src/utils/useTimeZoneUtils';

import PageSnackbar from '../../components/PageSnackbar';
import TextField from '../../components/common/Textfield/Textfield';
import TfMain from '../../components/common/TfMain';
import Button from '../../components/common/button/Button';
import NurserySubLocations from './NurserySubLocations';

export default function NurseryDetailsView(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const { nurseryId } = useParams<{ nurseryId: string }>();
  const [nursery, setNursery] = useState<Facility>();
  const navigate = useSyncNavigate();
  const tz = useLocationTimeZone().get(nursery);

  useEffect(() => {
    if (selectedOrganization && nurseryId) {
      const selectedNursery = FacilityService.getFacility({
        organization: selectedOrganization,
        facilityId: nurseryId,
        type: 'Nursery',
      });
      if (selectedNursery) {
        setNursery(selectedNursery);
      } else {
        navigate(APP_PATHS.NURSERIES);
      }
    }
  }, [nurseryId, selectedOrganization, navigate]);

  const goToEditNursery = () => {
    if (nurseryId) {
      const editNurseryLocation = {
        pathname: APP_PATHS.NURSERIES_EDIT.replace(':nurseryId', nurseryId),
      };
      navigate(editNurseryLocation);
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
          <BackToLink id='back' to={APP_PATHS.NURSERIES} name={strings.NURSERIES} />
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
        <Grid item xs={gridSize()} marginTop={isMobile ? 3 : 0}>
          <TextField
            label={strings.TIME_ZONE}
            id='timezone'
            type='text'
            value={tz.longName}
            tooltipTitle={strings.TOOLTIP_TIME_ZONE_NURSERY}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField
            id={'buildStartedDate'}
            label={strings.FACILITY_BUILD_START_DATE}
            value={nursery?.buildStartedDate ?? ''}
            type='text'
            aria-label='date-picker'
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField
            id={'buildCompletedDate'}
            label={strings.FACILITY_BUILD_COMPLETION_DATE}
            value={nursery?.buildCompletedDate ?? ''}
            type='text'
            aria-label='date-picker'
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(2)}>
          <TextField
            id={'operationStartedDate'}
            label={strings.FACILITY_OPERATION_START_DATE}
            value={nursery?.operationStartedDate ?? ''}
            type='text'
            aria-label='date-picker'
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()}>
          <TextField
            id={'capacity'}
            label={strings.NURSERY_CAPACITY}
            value={nursery?.capacity ?? ''}
            type='number'
            aria-label='date-picker'
            display={true}
          />
        </Grid>
        <NurserySubLocations nurseryId={Number(nurseryId)} />
      </Grid>
    </TfMain>
  );
}
