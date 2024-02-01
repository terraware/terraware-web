import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import strings from 'src/strings';
import { useDeviceInfo } from '@terraware/web-components/utils';
import TextField from '@terraware/web-components/components/Textfield/Textfield';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import isEnabled from 'src/features';
import { TimeZoneDescription } from 'src/types/TimeZones';
import { useProjects } from 'src/hooks/useProjects';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import LocationTimeZoneSelector from 'src/components/LocationTimeZoneSelector';
import PlantingSeasonsEdit from 'src/components/PlantingSites/PlantingSeasonsEdit';

export type DetailsInputFormProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean) => void;
  plantingSeasons?: UpdatedPlantingSeason[];
  record: PlantingSite;
  setPlantingSeasons: (plantingSeasons: UpdatedPlantingSeason[]) => void;
  setRecord: (setFn: (previousValue: PlantingSite) => PlantingSite) => void;
};

export default function DetailsInputForm({
  onChange,
  onValidate,
  plantingSeasons,
  record,
  setPlantingSeasons,
  setRecord,
}: DetailsInputFormProps): JSX.Element {
  const { isMobile } = useDeviceInfo();
  const [nameError, setNameError] = useState('');
  const [effectiveTimeZone, setEffectiveTimeZone] = useState<TimeZoneDescription | undefined>();
  const [plantingSeasonsValid, setPlantingSeasonsValid] = useState(true);
  const [showSaveValidationErrors, setShowSaveValidationErrors] = useState(false);
  const { availableProjects } = useProjects(record);
  const detailedSitesEnabled = isEnabled('User Detailed Sites');
  const projectsEnabled = isEnabled('Projects');

  useEffect(() => {
    if (!onValidate) {
      return;
    }

    let hasErrors = false;
    if (!record.name) {
      setNameError(strings.REQUIRED_FIELD);
      hasErrors = true;
    } else {
      setNameError('');
    }

    if (!plantingSeasonsValid) {
      setShowSaveValidationErrors(true);
      hasErrors = true;
    } else {
      setShowSaveValidationErrors(false);
    }

    if (onValidate) {
      onValidate(hasErrors);
    }
  }, [onValidate, plantingSeasonsValid, record?.name]);

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
          errorText={record.name ? '' : nameError}
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
          <ProjectsDropdown<PlantingSite> availableProjects={availableProjects} record={record} setRecord={setRecord} />
        </Grid>
      )}
    </Grid>
  );
}
