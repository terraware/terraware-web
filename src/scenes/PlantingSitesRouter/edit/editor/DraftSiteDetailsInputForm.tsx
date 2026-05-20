import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Grid } from '@mui/material';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { useDeviceInfo } from '@terraware/web-components/utils';

import LocationTimeZoneSelector from 'src/components/LocationTimeZoneSelector';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { useProjects } from 'src/hooks/useProjects';
import { useLocalization, useOrganization } from 'src/providers';
import { selectDraftPlantingSites } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { requestSearchDrafts } from 'src/redux/features/draftPlantingSite/draftPlantingSiteThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { UpdatedPlantingSeason } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantingSeasonsEdit from '../PlantingSeasonsEdit';

export type DraftSiteDetailsInputFormProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean) => void;
  record: DraftPlantingSite;
  setPlantingSeasons: (plantingSeasons: UpdatedPlantingSeason[]) => void;
  setRecord: (setFn: (previousValue: DraftPlantingSite) => DraftPlantingSite) => void;
};

export default function DraftSiteDetailsInputForm({
  onChange,
  onValidate,
  record,
  setPlantingSeasons,
  setRecord,
}: DraftSiteDetailsInputFormProps): JSX.Element {
  const defaultTimeZoneId = useDefaultTimeZone().get().id;
  const { isMobile } = useDeviceInfo();
  const [validateInput, setValidateInput] = useState<boolean>(false);
  const [nameError, setNameError] = useState('');
  const [plantingSeasonsValid, setPlantingSeasonsValid] = useState(true);
  const [showSaveValidationErrors, setShowSaveValidationErrors] = useState(false);
  const { availableProjects } = useProjects(record);
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const dispatch = useAppDispatch();
  const plantingSites = useAppSelector(selectPlantingSites);
  const draftSites = useAppSelector(selectDraftPlantingSites(selectedOrganization?.id || -1));

  const usedNames = useMemo(() => {
    const allSites = [...(plantingSites || []), ...(draftSites?.data || [])];
    const otherSiteNames = allSites.filter((site) => Number(site.id) !== record.id).map((site) => site.name);
    return new Set(otherSiteNames);
  }, [draftSites, plantingSites, record.id]);

  const checkErrors = useCallback(() => {
    let hasNameError = true;
    let hasSeasonsError = true;

    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
    } else if (usedNames?.has(record.name) === true) {
      setNameError(strings.SITE_WITH_NAME_EXISTS);
    } else {
      setNameError('');
      hasNameError = false;
    }

    if (!plantingSeasonsValid) {
      setShowSaveValidationErrors(true);
    } else {
      setShowSaveValidationErrors(false);
      hasSeasonsError = false;
    }

    return hasNameError || hasSeasonsError;
  }, [plantingSeasonsValid, record.name, usedNames]);

  useEffect(() => {
    if (!plantingSites && selectedOrganization) {
      void dispatch(requestPlantingSites(selectedOrganization.id));
    }
  }, [activeLocale, dispatch, plantingSites, selectedOrganization]);

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestSearchDrafts(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

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

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  const effectiveTimeZoneId = useMemo(() => {
    return record.timeZone ?? selectedOrganization?.timeZone ?? defaultTimeZoneId;
  }, [defaultTimeZoneId, record.timeZone, selectedOrganization?.timeZone]);

  return (
    <Grid container display='flex' spacing={3} flexGrow={0}>
      <Grid item xs={gridSize()}>
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
      <Grid item xs={gridSize()}>
        <TextField
          id='description'
          label={strings.DESCRIPTION}
          type='textarea'
          onChange={(value) => onChange('description', value)}
          value={record.description}
        />
      </Grid>
      <Grid item xs={gridSize()}>
        <LocationTimeZoneSelector
          location={record}
          onChangeTimeZone={onChangeTimeZone}
          tooltip={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
        />
      </Grid>
      {record.strata && (
        <Grid item xs={gridSize()}>
          <TextField
            label={strings.UPCOMING_PLANTING_SEASONS}
            id='upcomingPlantingSeasons'
            type='text'
            display={true}
          />
          <PlantingSeasonsEdit
            plantingSeasons={record.plantingSeasons}
            setPlantingSeasons={setPlantingSeasons}
            setPlantingSeasonsValid={setPlantingSeasonsValid}
            setShowSaveValidationErrors={setShowSaveValidationErrors}
            showSaveValidationErrors={showSaveValidationErrors}
            timeZoneId={effectiveTimeZoneId}
          />
        </Grid>
      )}
      <Grid item xs={gridSize()}>
        <ProjectsDropdown availableProjects={availableProjects} record={record} setRecord={setRecord} allowUnselect />
      </Grid>
    </Grid>
  );
}
