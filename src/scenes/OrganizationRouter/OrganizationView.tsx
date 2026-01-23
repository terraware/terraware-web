import React, { type JSX, useEffect, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import TextField from 'src/components/common/Textfield/Textfield';
import TfMain from 'src/components/common/TfMain';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization, useTimeZones } from 'src/providers/hooks';
import { OrganizationUserService } from 'src/services';
import strings from 'src/strings';
import { organizationTypeLabel } from 'src/types/Organization';
import { OrganizationUser } from 'src/types/User';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { getUTC } from 'src/utils/useTimeZoneUtils';

export default function OrganizationView(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const [people, setPeople] = useState<OrganizationUser[]>();
  const { isMobile } = useDeviceInfo();
  const { countries } = useLocalization();
  const timeZones = useTimeZones();
  const utcTimeZone = getUTC(timeZones);
  const currentTimeZone = timeZones.find((tz) => tz.id === selectedOrganization?.timeZone)?.longName;

  useEffect(() => {
    if (selectedOrganization) {
      const populatePeople = async () => {
        const response = await OrganizationUserService.getOrganizationUsers(selectedOrganization.id);
        if (response.requestSucceeded) {
          setPeople(response.users);
        }
      };
      void populatePeople();
    }
  }, [selectedOrganization]);

  const goToEditOrganization = () => {
    const editOrganizationLocation = {
      pathname: APP_PATHS.ORGANIZATION_EDIT,
    };
    navigate(editOrganizationLocation);
  };

  const organizationState = () => {
    if (countries && selectedOrganization?.countryCode && selectedOrganization?.countrySubdivisionCode) {
      return getSubdivisionByCode(
        countries,
        selectedOrganization.countryCode,
        selectedOrganization.countrySubdivisionCode
      )?.name;
    }
  };

  const getDateAdded = () => {
    if (selectedOrganization?.createdTime) {
      return getDateDisplayValue(selectedOrganization.createdTime);
    }
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <TfMain>
      <Box margin={theme.spacing(0, 3, 4, 3)}>
        <Box display='flex' justifyContent='space-between' alignItems='center' marginBottom={theme.spacing(1)}>
          <Typography margin={0} fontSize='24px' fontWeight={600}>
            {strings.ORGANIZATION}
          </Typography>
          <Button
            icon='iconEdit'
            label={isMobile ? undefined : strings.EDIT_ORGANIZATION}
            priority='primary'
            size='medium'
            onClick={goToEditOrganization}
          />
        </Box>
        <Typography margin={0} fontSize='14px' fontWeight={400}>
          {strings.ORGANIZATION_DESC}
        </Typography>
        <PageSnackbar />
      </Box>
      <Grid
        container
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: '32px',
          padding: theme.spacing(3),
          margin: 0,
        }}
      >
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <TextField
            label={strings.ORGANIZATION_NAME}
            id='name'
            type='text'
            value={selectedOrganization?.name || ''}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <TextField
            label={strings.DESCRIPTION}
            id='description'
            type='text'
            value={selectedOrganization?.description || ''}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <TextField label={strings.DATE_ADDED} id='dateAdded' type='text' value={getDateAdded()} display={true} />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <TextField
            label={strings.COUNTRY}
            id='country'
            type='text'
            value={
              countries && selectedOrganization?.countryCode
                ? getCountryByCode(countries, selectedOrganization.countryCode)?.name
                : ''
            }
            display={true}
          />
        </Grid>
        {selectedOrganization?.countrySubdivisionCode && (
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
            <TextField label={strings.STATE} id='state' type='text' value={organizationState()} display={true} />
          </Grid>
        )}
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <TextField
            label={strings.NUMBER_OF_PEOPLE}
            id='numberOfPeople'
            type='text'
            value={people?.length.toString()}
            display={true}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
          <TextField
            label={strings.TIME_ZONE}
            id='timeZone'
            type='text'
            value={currentTimeZone || utcTimeZone.longName}
            display={true}
            tooltipTitle={strings.TOOLTIP_TIME_ZONE_ORGANIZATION}
          />
        </Grid>
        <Grid item xs={gridSize()} paddingBottom={isMobile ? theme.spacing(4) : 0}>
          <TextField
            label={strings.ORGANIZATION_TYPE}
            id='org-type'
            type='text'
            value={
              selectedOrganization?.organizationType ? organizationTypeLabel(selectedOrganization.organizationType) : ''
            }
            display={true}
          />
        </Grid>
        {selectedOrganization?.organizationType === 'Other' && (
          <Grid item xs={gridSize()} paddingBottom={isMobile ? theme.spacing(4) : 0}>
            <TextField
              label={strings.ORGANIZATION_TYPE_DESCRIPTION}
              id='org-type-description'
              type='text'
              value={selectedOrganization.organizationTypeDetails}
              display={true}
            />
          </Grid>
        )}
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.ORGANIZATION_WEBSITE}
            id='org-website'
            type='text'
            value={selectedOrganization?.website || ''}
            display={true}
          />
        </Grid>
      </Grid>
    </TfMain>
  );
}
