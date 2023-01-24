import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { ServerOrganization } from 'src/types/Organization';
import TextField from '../common/Textfield/Textfield';
import useForm from 'src/utils/useForm';
import PageForm from '../common/PageForm';
import { updateOrganization } from 'src/api/organization/organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import TfMain from 'src/components/common/TfMain';
import isEnabled from 'src/features';
import { getUTC, useUserTimeZone } from 'src/utils/useTimeZoneUtils';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useTimeZones } from 'src/providers';
import RegionSelector from 'src/components/RegionSelector';

type OrganizationViewProps = {
  organization: ServerOrganization;
  reloadOrganizationData: () => void;
};

export default function OrganizationView({ organization, reloadOrganizationData }: OrganizationViewProps): JSX.Element {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const [organizationRecord, setOrganizationRecord, onChange] = useForm<ServerOrganization>(organization);
  const [nameError, setNameError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [subdivisionError, setSubdivisionError] = useState('');
  const [requireSubdivision, setRequireSubdivisions] = useState(!!organization.countrySubdivisionCode);
  const history = useHistory();
  const snackbar = useSnackbar();
  const timeZones = useTimeZones();
  const defaultTimeZone = useUserTimeZone()?.id || getUTC(timeZones).id;
  const timeZoneFeatureEnabled = isEnabled('Timezones');

  const onChangeTimeZone = (newTimeZone: TimeZoneDescription | undefined) => {
    setOrganizationRecord((previousRecord: ServerOrganization): ServerOrganization => {
      return {
        ...previousRecord,
        timeZone: newTimeZone ? newTimeZone.id : undefined,
      };
    });
  };

  const goToOrganization = () => {
    const organizationLocation = {
      pathname: APP_PATHS.ORGANIZATION,
    };
    history.push(organizationLocation);
  };

  const saveOrganization = async () => {
    let hasErrors = false;
    if (organizationRecord.name === '') {
      setNameError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (!organizationRecord.countryCode) {
      setCountryError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (requireSubdivision && !organizationRecord.countrySubdivisionCode) {
      setSubdivisionError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const response = await updateOrganization(organizationRecord);
    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      reloadOrganizationData();
    } else {
      snackbar.toastError();
    }
    goToOrganization();
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 6;
  };

  return (
    <TfMain>
      <PageForm cancelID='cancelEditOrg' saveID='saveEditOrg' onCancel={goToOrganization} onSave={saveOrganization}>
        <Box margin={theme.spacing(0, 3, 4, 3)}>
          <Box display='flex' flexDirection='column' justifyContent='space-between' marginBottom={theme.spacing(1)}>
            <Typography margin={0} fontSize='24px' fontWeight={600}>
              {strings.ORGANIZATION}
            </Typography>
            <PageSnackbar />
          </Box>
        </Box>
        <Grid
          container
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            padding: theme.spacing(3),
            marginBottom: theme.spacing(10),
          }}
        >
          <Grid item xs={gridSize()} paddingBottom={theme.spacing(4)}>
            <TextField
              id='name'
              label={strings.ORGANIZATION_NAME_REQUIRED}
              type='text'
              onChange={(value) => onChange('name', value)}
              value={organizationRecord.name}
              errorText={organizationRecord.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingLeft={isMobile ? 0 : theme.spacing(2)} paddingBottom={theme.spacing(4)}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              onChange={(value) => onChange('description', value)}
              value={organizationRecord.description}
            />
          </Grid>
          <RegionSelector
            selectedCountryCode={organizationRecord.countryCode}
            selectedCountrySubdivisionCode={organizationRecord.countrySubdivisionCode}
            onChangeCountryCode={(countryCode: string, hasSubdivisions: boolean) => {
              setRequireSubdivisions(hasSubdivisions);
              setOrganizationRecord(
                (previousOrganizationRecord: ServerOrganization): ServerOrganization => ({
                  ...previousOrganizationRecord,
                  countryCode,
                  countrySubdivisionCode: undefined,
                })
              );
            }}
            onChangeCountrySubdivisionCode={(countrySubdivisionCode: string) =>
              onChange('countrySubdivisionCode', countrySubdivisionCode)
            }
            horizontalLayout
            countryError={countryError}
            countrySubdivisionError={subdivisionError}
          />
          {timeZoneFeatureEnabled && (
            <Grid item xs={gridSize()}>
              <TimeZoneSelector
                selectedTimeZone={organizationRecord.timeZone || defaultTimeZone}
                countryCode={organizationRecord.countryCode}
                onTimeZoneSelected={onChangeTimeZone}
                label={strings.TIME_ZONE_REQUIRED}
                tooltip={strings.TOOLTIP_TIME_ZONE_ORGANIZATION}
              />
            </Grid>
          )}
        </Grid>
      </PageForm>
    </TfMain>
  );
}
