import { useCallback, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import strings from 'src/strings';
import { useDeviceInfo } from '@terraware/web-components/utils';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { SiteDetails, UpdatedPlantingSeason } from 'src/types/Tracking';
import isEnabled from 'src/features';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useLocalization, useOrganization } from 'src/providers';
import { useProjects } from 'src/hooks/useProjects';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import LocationTimeZoneSelector from 'src/components/LocationTimeZoneSelector';
import PlantingSeasonsEdit from './PlantingSeasonsEdit';

export type DetailsInputFormProps<T extends SiteDetails> = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean) => void;
  plantingSeasons?: UpdatedPlantingSeason[];
  record: T;
  setPlantingSeasons: (plantingSeasons: UpdatedPlantingSeason[]) => void;
  setRecord: (setFn: (previousValue: T) => T) => void;
};

export default function DetailsInputForm<T extends SiteDetails>({
  onChange,
  onValidate,
  plantingSeasons,
  record,
  setPlantingSeasons,
  setRecord,
}: DetailsInputFormProps<T>): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const [validateInput, setValidateInput] = useState<boolean>(false);
  const [nameError, setNameError] = useState('');
  const [effectiveTimeZone, setEffectiveTimeZone] = useState<TimeZoneDescription | undefined>();
  const [plantingSeasonsValid, setPlantingSeasonsValid] = useState(true);
  const [showSaveValidationErrors, setShowSaveValidationErrors] = useState(false);
  const [usedNames, setUsedNames] = useState<Set<string>>();
  const { availableProjects } = useProjects(record);
  const detailedSitesEnabled = isEnabled('User Detailed Sites');
  const projectsEnabled = isEnabled('Projects');
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const dispatch = useAppDispatch();
  const plantingSites = useAppSelector(selectPlantingSites);

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
    if (!plantingSites) {
      dispatch(requestPlantingSites(selectedOrganization.id, activeLocale));
    }
  }, [activeLocale, dispatch, plantingSites, selectedOrganization.id]);

  useEffect(() => {
    // TODO: also include planting site drafts in this list
    const otherSiteNames = (plantingSites ?? []).filter((site) => site.id !== record.id).map((site) => site.name);
    setUsedNames(new Set(otherSiteNames));
  }, [plantingSites, record.id]);

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
          onEffectiveTimeZone={setEffectiveTimeZone}
          tooltip={strings.TOOLTIP_TIME_ZONE_PLANTING_SITE}
        />
      </Grid>
      {(record?.plantingZones || detailedSitesEnabled) && effectiveTimeZone && (
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
            timeZone={effectiveTimeZone}
          />
        </Grid>
      )}
      {projectsEnabled && (
        <Grid item xs={gridSize()}>
          <ProjectsDropdown<T> availableProjects={availableProjects} record={record} setRecord={setRecord} />
        </Grid>
      )}
    </Grid>
  );
}
