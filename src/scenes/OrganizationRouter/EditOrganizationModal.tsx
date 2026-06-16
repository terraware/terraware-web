import React, { type JSX, useEffect, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import RegionSelector from 'src/components/RegionSelector';
import TimeZoneSelector from 'src/components/TimeZoneSelector';
import ScrollableDialogBox from 'src/components/common/ScrollableDialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useLocalization, useTimeZones } from 'src/providers';
import { OrganizationService } from 'src/services';
import strings from 'src/strings';
import { Organization, OrganizationType, OrganizationTypes, organizationTypeLabel } from 'src/types/Organization';
import { TimeZoneDescription } from 'src/types/TimeZones';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';
import { getUTC, useUserTimeZone } from 'src/utils/useTimeZoneUtils';

export type EditOrganizationModalProps = {
  organization: Organization;
  open: boolean;
  onClose: () => void;
  reloadOrganizationData: (id: number) => Promise<void>;
};

export default function EditOrganizationModal({
  organization,
  open,
  onClose,
  reloadOrganizationData,
}: EditOrganizationModalProps): JSX.Element {
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const [organizationRecord, setOrganizationRecord, onChange, onChangeCallback] = useForm<Organization>(organization);
  const [nameError, setNameError] = useState('');
  const [countryError, setCountryError] = useState('');
  const [subdivisionError, setSubdivisionError] = useState('');
  const [organizationTypeError, setOrganizationTypeError] = useState('');
  const [organizationTypeDetailsError, setOrganizationTypeDetailsError] = useState('');
  const [requireSubdivision, setRequireSubdivisions] = useState(!!organization.countrySubdivisionCode);
  const snackbar = useSnackbar();
  const timeZones = useTimeZones();
  const defaultTimeZone = useUserTimeZone()?.id || getUTC(timeZones).id;

  useEffect(() => {
    if (open) {
      setOrganizationRecord(organization);
      setNameError('');
      setCountryError('');
      setSubdivisionError('');
      setOrganizationTypeError('');
      setOrganizationTypeDetailsError('');
      setRequireSubdivisions(!!organization.countrySubdivisionCode);
    }
  }, [open, organization, setOrganizationRecord]);

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
    onClose();
  };

  return (
    <ScrollableDialogBox
      onClose={onClose}
      open={open}
      title={strings.EDIT_ORGANIZATION}
      size='medium'
      maxHeight={'calc(100vh - 120px)'}
      scrolled
      middleButtons={[
        <Button
          id='cancelEditOrg'
          label={strings.CANCEL}
          priority='secondary'
          type='passive'
          onClick={onClose}
          key='button-1'
        />,
        <Button id='saveEditOrg' label={strings.SAVE} onClick={() => void saveOrganization()} key='button-2' />,
      ]}
    >
      <Grid container spacing={3} sx={{ padding: 0 }} textAlign='left'>
        <Grid item xs={12}>
          <TextField
            id='name'
            label={strings.ORGANIZATION_NAME_REQUIRED}
            type='text'
            onChange={(value) => {
              onChange('name', value);
              setNameError('');
            }}
            value={organizationRecord.name}
            errorText={nameError}
          />
        </Grid>
        <Grid item xs={12}>
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
            setCountryError('');
          }}
          onChangeCountrySubdivisionCode={(countrySubdivisionCode: string) => {
            onChange('countrySubdivisionCode', countrySubdivisionCode);
            setSubdivisionError('');
          }}
          countryError={countryError}
          countrySubdivisionError={subdivisionError}
          paddingBottom={theme.spacing(4)}
        />
        <Grid item xs={12} sx={{ '&.MuiGrid-item': { paddingTop: 0 } }}>
          <TimeZoneSelector
            selectedTimeZone={organizationRecord.timeZone || defaultTimeZone}
            countryCode={organizationRecord.countryCode}
            onTimeZoneSelected={onChangeTimeZone}
            label={strings.TIME_ZONE_REQUIRED}
            tooltip={strings.TOOLTIP_TIME_ZONE_ORGANIZATION}
          />
        </Grid>
        <Grid item xs={12}>
          <Dropdown
            required
            label={strings.ORGANIZATION_TYPE}
            onChange={onChangeOrganizationType}
            selectedValue={organizationRecord.organizationType}
            options={organizationTypeOptions}
            fullWidth={true}
            errorText={organizationTypeError}
          />
          {organizationRecord.organizationType === 'Other' && (
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
              sx={{ marginTop: theme.spacing(1) }}
              value={organizationRecord.organizationTypeDetails}
            />
          )}
        </Grid>
        <Grid item xs={12}>
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
    </ScrollableDialogBox>
  );
}
