import React, { type JSX, useMemo, useState } from 'react';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import RegionSelector from 'src/components/RegionSelector';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useTimeZones } from 'src/providers';
import { OrganizationService } from 'src/services';
import strings from 'src/strings';
import { Organization, OrganizationType, OrganizationTypes, organizationTypeLabel } from 'src/types/Organization';
import { TimeZoneDescription } from 'src/types/TimeZones';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { getUTC, useUserTimeZone } from 'src/utils/useTimeZoneUtils';

import PageForm from '../../components/common/PageForm';
import TextField from '../../components/common/Textfield/Textfield';

type OrganizationViewProps = {
  organization: Organization;
  reloadOrganizationData: (id: number) => Promise<void>;
};

export default function OrganizationView({ organization, reloadOrganizationData }: OrganizationViewProps): JSX.Element {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const [organizationRecord, setOrganizationRecord, onChange, onChangeCallback] = useForm<Organization>(organization);
  const [nameError, setNameError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [subdivisionError, setSubdivisionError] = useState('');
  const [organizationTypeError, setOrganizationTypeError] = useState('');
  const [organizationTypeDetailsError, setOrganizationTypeDetailsError] = useState('');
  const [requireSubdivision, setRequireSubdivisions] = useState(!!organization.countrySubdivisionCode);
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const timeZones = useTimeZones();
  const defaultTimeZone = useUserTimeZone()?.id || getUTC(timeZones).id;

  const organizationTypeOptions = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return OrganizationTypes.map((organizationType: OrganizationType) => ({
      label: organizationTypeLabel(organizationType) ?? '',
      value: organizationType,
    }));
  }, [activeLocale]);

  const onChangeTimeZone = (newTimeZone: TimeZoneDescription | undefined) => {
    setOrganizationRecord((previousRecord: Organization): Organization => {
      return {
        ...previousRecord,
        timeZone: newTimeZone ? newTimeZone.id : undefined,
      };
    });
  };

  const onChangeOrganizationType = (value: any) => {
    onChange('organizationTypeDetails', undefined);
    onChange('organizationType', value);
    setOrganizationTypeError('');
  };

  const goToOrganization = () => {
    const organizationLocation = {
      pathname: APP_PATHS.ORGANIZATION,
    };
    navigate(organizationLocation);
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

    if (!organizationRecord.organizationType) {
      setOrganizationTypeError(strings.REQUIRED_FIELD);
      hasErrors = true;
    } else if (organizationRecord.organizationType === 'Other' && !organizationRecord.organizationTypeDetails?.trim()) {
      setOrganizationTypeDetailsError(strings.REQUIRED_FIELD);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    const response = await OrganizationService.updateOrganization(organizationRecord);
    if (response.requestSucceeded) {
      snackbar.toastSuccess(strings.CHANGES_SAVED);
      await reloadOrganizationData(organizationRecord.id);
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
      <PageForm
        cancelID='cancelEditOrg'
        saveID='saveEditOrg'
        onCancel={goToOrganization}
        onSave={() => void saveOrganization()}
      >
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
              onChange={onChangeCallback('name')}
              value={organizationRecord.name}
              errorText={organizationRecord.name ? '' : nameError}
            />
          </Grid>
          <Grid item xs={gridSize()} paddingLeft={isMobile ? 0 : theme.spacing(2)} paddingBottom={theme.spacing(4)}>
            <TextField
              id='description'
              label={strings.DESCRIPTION}
              type='textarea'
              onChange={onChangeCallback('description')}
              value={organizationRecord.description}
            />
          </Grid>
          <RegionSelector
            selectedCountryCode={organizationRecord.countryCode}
            selectedCountrySubdivisionCode={organizationRecord.countrySubdivisionCode}
            onChangeCountryCode={(countryCode: string, hasSubdivisions: boolean) => {
              setRequireSubdivisions(hasSubdivisions);
              setOrganizationRecord(
                (previousOrganizationRecord: Organization): Organization => ({
                  ...previousOrganizationRecord,
                  countryCode,
                  countrySubdivisionCode: undefined,
                })
              );
            }}
            onChangeCountrySubdivisionCode={onChangeCallback('countrySubdivisionCode')}
            horizontalLayout
            countryError={countryError}
            countrySubdivisionError={subdivisionError}
            paddingBottom={theme.spacing(4)}
          />
          <Grid item xs={gridSize()} marginTop={isMobile ? 4 : 0}>
            <TimeZoneSelector
              selectedTimeZone={organizationRecord.timeZone || defaultTimeZone}
              countryCode={organizationRecord.countryCode}
              onTimeZoneSelected={onChangeTimeZone}
              label={strings.TIME_ZONE_REQUIRED}
              tooltip={strings.TOOLTIP_TIME_ZONE_ORGANIZATION}
            />
          </Grid>
          <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} marginTop={4}>
            <Grid item xs={gridSize()}>
              <Dropdown
                required
                label={strings.ORGANIZATION_TYPE}
                onChange={onChangeOrganizationType}
                selectedValue={organizationRecord.organizationType}
                options={organizationTypeOptions}
                fullWidth={true}
                errorText={organizationTypeError}
              />
            </Grid>
            {organizationRecord.organizationType === 'Other' && (
              <Grid item xs={gridSize()} marginLeft={isMobile ? 0 : 2} marginTop={isMobile ? 2 : 0}>
                <TextField
                  required
                  type='text'
                  label={strings.DESCRIBE_ORGANIZATION_TYPE_DETAILS}
                  id='edit-org-question-type-details'
                  display={false}
                  maxLength={100}
                  onChange={(value) => {
                    onChange('organizationTypeDetails', value);
                    setOrganizationTypeDetailsError('');
                  }}
                  errorText={organizationTypeDetailsError}
                  value={organizationRecord.organizationTypeDetails}
                />
              </Grid>
            )}
          </Grid>
          <Grid item xs={12} display='flex' marginTop={4}>
            <Grid item xs={gridSize()}>
              <TextField
                type='text'
                label={strings.ORGANIZATION_WEBSITE}
                id='org-website'
                display={false}
                onChange={onChangeCallback('website')}
                value={organizationRecord.website}
              />
            </Grid>
          </Grid>
        </Grid>
      </PageForm>
    </TfMain>
  );
}
