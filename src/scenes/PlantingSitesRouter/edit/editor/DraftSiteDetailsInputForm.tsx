import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { GridLegacy as Grid } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import LocationTimeZoneSelector from 'src/components/LocationTimeZoneSelector';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { useProjects } from 'src/hooks/useProjects';
import { useOrganization } from 'src/providers';
import { useLazySearchDraftPlantingSitesQuery } from 'src/queries/search/draftPlantingSites';
import { useLazySearchPlantingSiteNamesQuery } from 'src/queries/search/plantingSites';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { TimeZoneDescription } from 'src/types/TimeZones';

export type DraftSiteDetailsInputFormProps = {
  onChange: (id: string, value: unknown) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onValidate?: (hasErrors: boolean) => void;
  record: DraftPlantingSite;
  setRecord: (setFn: (previousValue: DraftPlantingSite) => DraftPlantingSite) => void;
};

export default function DraftSiteDetailsInputForm({
  onChange,
  onLoadingChange,
  onValidate,
  record,
  setRecord,
}: DraftSiteDetailsInputFormProps): JSX.Element {
  const [validateInput, setValidateInput] = useState<boolean>(false);
  const [nameError, setNameError] = useState('');
  const { availableProjects } = useProjects(record);
  const { selectedOrganization } = useOrganization();
  const [searchPlantingSiteNames, { currentData: plantingSites, isFetching: isFetchingPlantingSites }] =
    useLazySearchPlantingSiteNamesQuery();
  const [searchDraftPlantingSites, { currentData: draftSites, isFetching: isFetchingDraftSites }] =
    useLazySearchDraftPlantingSitesQuery();

  const usedNames = useMemo(() => {
    const otherDraftSites = (draftSites || []).filter((site) => Number(site.id) !== record.id);
    return new Set([...(plantingSites || []), ...otherDraftSites].map((site) => site.name));
  }, [draftSites, plantingSites, record.id]);

  const isLoading = isFetchingPlantingSites || isFetchingDraftSites || !plantingSites || !draftSites;

  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const checkErrors = useCallback(() => {
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      return true;
    }
    if (usedNames?.has(record.name) === true) {
      setNameError(strings.SITE_WITH_NAME_EXISTS);
      return true;
    }
    setNameError('');
    return false;
  }, [record.name, usedNames]);

  useEffect(() => {
    if (selectedOrganization) {
      void searchPlantingSiteNames(selectedOrganization.id, true);
      void searchDraftPlantingSites({ organizationId: selectedOrganization.id }, true);
    }
  }, [searchDraftPlantingSites, searchPlantingSiteNames, selectedOrganization]);

  useEffect(() => {
    if (!onValidate) {
      return;
    }

    setValidateInput(true);
    onValidate(checkErrors());
  }, [checkErrors, onValidate]);

  useEffect(() => {
    if (validateInput) {
      checkErrors();
    }
  }, [checkErrors, validateInput]);

  const onChangeTimeZone = (newTimeZone: TimeZoneDescription | undefined) => {
    onChange('timeZone', newTimeZone ? newTimeZone.id : undefined);
  };

  return (
    <Grid container display='flex' spacing={3} flexGrow={0}>
      <Grid item xs={12}>
        <TextField
          id='name'
          label={strings.NAME_REQUIRED}
          type='text'
          onChange={(value) => onChange('name', value)}
          value={record.name}
          errorText={nameError}
          autoFocus={true}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          id='description'
          label={strings.DESCRIPTION}
          type='textarea'
          onChange={(value) => onChange('description', value)}
          value={record.description}
        />
      </Grid>
      <Grid item xs={12}>
        <LocationTimeZoneSelector
          location={record}
          onChangeTimeZone={onChangeTimeZone}
          tooltip={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
        />
      </Grid>
      <Grid item xs={12}>
        <ProjectsDropdown availableProjects={availableProjects} record={record} setRecord={setRecord} allowUnselect />
      </Grid>
    </Grid>
  );
}
