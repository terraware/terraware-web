import React, { type JSX, useState } from 'react';

import { Box, Grid, useTheme } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import PageSnackbar from 'src/components/PageSnackbar';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useBotanicalCountries } from 'src/hooks/useBotanicalCountries';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization, useTimeZones } from 'src/providers/hooks';
import { useListOrganizationUsersQuery } from 'src/queries/generated/organizationUsers';
import EditOrganizationModal from 'src/scenes/OrganizationRouter/EditOrganizationModal';
import strings from 'src/strings';
import { organizationTypeLabel } from 'src/types/Organization';
import { getCountryByCode, getSubdivisionByCode } from 'src/utils/country';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { getUTC } from 'src/utils/useTimeZoneUtils';

export default function OrganizationView(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { isMobile } = useDeviceInfo();
  const { countries } = useLocalization();
  const { availableProjects } = useProjects();
  const showBotanicalCountry = (availableProjects?.length ?? 0) < 2;
  const { getBotanicalCountryName } = useBotanicalCountries(!showBotanicalCountry);
  const timeZones = useTimeZones();
  const utcTimeZone = getUTC(timeZones);
  const currentTimeZone = timeZones.find((tz) => tz.id === selectedOrganization?.timeZone)?.longName;

  const { currentData: organizationUsersData } = useListOrganizationUsersQuery(selectedOrganization?.id ?? skipToken);
  const people = organizationUsersData?.users;

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
    <Box
      component='main'
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingRight: theme.spacing(4),
      }}
    >
      <PageSnackbar />
      {selectedOrganization && (
        <EditOrganizationModal
          organization={selectedOrganization}
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
        />
      )}
      <Grid
        container
        sx={{
          backgroundColor: theme.palette.TwClrBg,
          borderRadius: theme.spacing(1),
          padding: theme.spacing(3, 4),
          margin: 0,
        }}
      >
        <Grid paddingBottom={theme.spacing(2)} sx={{ display: 'flex', justifyContent: 'flex-end' }} size={12}>
          <Button
            icon='iconEdit'
            label={isMobile ? undefined : strings.EDIT_ORGANIZATION}
            priority='primary'
            size='medium'
            onClick={() => setEditModalOpen(true)}
          />
        </Grid>
        <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
          <TextField
            label={strings.ORGANIZATION_NAME}
            id='name'
            type='text'
            value={selectedOrganization?.name || ''}
            display={true}
          />
        </Grid>
        <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
          <TextField
            label={strings.DESCRIPTION}
            id='description'
            type='text'
            value={selectedOrganization?.description || ''}
            display={true}
          />
        </Grid>
        <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
          <TextField label={strings.DATE_ADDED} id='dateAdded' type='text' value={getDateAdded()} display={true} />
        </Grid>
        <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
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
          <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
            <TextField label={strings.STATE} id='state' type='text' value={organizationState()} display={true} />
          </Grid>
        )}
        {showBotanicalCountry && (
          <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
            <TextField
              label={strings.BOTANICAL_COUNTRY}
              id='botanicalCountry'
              type='text'
              value={getBotanicalCountryName(selectedOrganization?.botanicalCountryCode) ?? ''}
              display={true}
            />
          </Grid>
        )}
        <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
          <TextField
            label={strings.NUMBER_OF_PEOPLE}
            id='numberOfPeople'
            type='text'
            value={people?.length.toString()}
            display={true}
          />
        </Grid>
        <Grid paddingBottom={theme.spacing(4)} size={gridSize()}>
          <TextField
            label={strings.TIME_ZONE}
            id='timeZone'
            type='text'
            value={currentTimeZone || utcTimeZone.longName}
            display={true}
            tooltipTitle={strings.TOOLTIP_TIME_ZONE_ORGANIZATION}
          />
        </Grid>
        <Grid paddingBottom={isMobile ? theme.spacing(4) : 0} size={gridSize()}>
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
          <Grid paddingBottom={isMobile ? theme.spacing(4) : 0} size={gridSize()}>
            <TextField
              label={strings.ORGANIZATION_TYPE_DESCRIPTION}
              id='org-type-description'
              type='text'
              value={selectedOrganization.organizationTypeDetails}
              display={true}
            />
          </Grid>
        )}
        <Grid size={gridSize()}>
          <TextField
            label={strings.ORGANIZATION_WEBSITE}
            id='org-website'
            type='text'
            value={selectedOrganization?.website || ''}
            display={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
